use borsh::BorshDeserialize;
use dephy_id_program_client::{find_device_mint, find_product_mint, get_device_atoken};
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_program,
};
use spl_token_2022::{extension::{BaseStateWithExtensions, StateWithExtensions}, state::{Account, Mint}};
use spl_token_metadata_interface::state::TokenMetadata;

use crate::assertions::{
    assert_pda, assert_program_owner, assert_same_pubkeys, assert_signer, assert_writable,
};
use crate::instruction::accounts::{CreateAccounts, ProxyCallAccounts};
use crate::instruction::WalletInstruction;
use crate::state::{Key, Wallet};
use crate::utils::create_account;

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = WalletInstruction::try_from_slice(instruction_data)?;
    match instruction {
        WalletInstruction::Create { bump } => {
            msg!("Ix: Create");
            create(program_id, accounts, bump)
        }
        WalletInstruction::ProxyCall { ix_data } => {
            msg!("Ix: ProxyCall");
            proxy_call(program_id, accounts, ix_data.as_ref())
        }
    }
}

fn create<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], _bump: u8) -> ProgramResult {
    // Accounts.
    let ctx = CreateAccounts::context(accounts)?;
    let vendor_pubkey = ctx.accounts.vendor.key;
    let device_pubkey = ctx.accounts.device.key;
    let vault_pubkey = ctx.accounts.vault.key;
    let authority_pubkey = ctx.accounts.authority.key;

    // Guards.
    let mut seeds = Wallet::seeds(ctx.accounts.device.key, ctx.accounts.authority.key);
    let wallet_bump = assert_pda("wallet", ctx.accounts.wallet, program_id, &seeds)?;
    let vault_bump = assert_pda(
        "vault",
        ctx.accounts.vault,
        program_id,
        &[b"VAULT", ctx.accounts.wallet.key.as_ref()],
    )?;
    assert_signer("authority", ctx.accounts.authority)?;
    assert_signer("payer", ctx.accounts.payer)?;
    assert_writable("payer", ctx.accounts.payer)?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    let product_metadata = {
        let product_mint_data = ctx.accounts.product_mint.data.borrow();
        let product_mint_state = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
        assert_eq!(product_mint_state.base.decimals, 0);

        product_mint_state.get_variable_len_extension::<TokenMetadata>()?
    };
    let (product_mint_pubkey, _) = find_product_mint(vendor_pubkey, product_metadata.name, &dephy_id_program_client::ID);
    assert_same_pubkeys("product_mint", ctx.accounts.product_mint, &product_mint_pubkey)?;
    {
        let product_atoken_data = ctx.accounts.product_associated_token.data.borrow();
        let product_atoken_state = StateWithExtensions::<Account>::unpack(&product_atoken_data)?;
        assert_eq!(product_atoken_state.base.mint, product_mint_pubkey);
        assert_eq!(product_atoken_state.base.owner, *device_pubkey);
        assert_eq!(product_atoken_state.base.amount, 1);
    }

    let (device_mint_pubkey, _) = find_device_mint(&product_mint_pubkey, device_pubkey, &dephy_id_program_client::ID);
    assert_same_pubkeys("device_mint", ctx.accounts.device_mint, &device_mint_pubkey)?;

    let device_atoken_pubkey = get_device_atoken(authority_pubkey, &device_mint_pubkey);
    assert_same_pubkeys("device_atoken", ctx.accounts.device_associated_token, &device_atoken_pubkey)?;
    {
        let device_atoken_data = ctx.accounts.device_associated_token.data.borrow();
        let device_atoken_state = StateWithExtensions::<Account>::unpack(&device_atoken_data)?;
        assert_eq!(device_atoken_state.base.mint, device_mint_pubkey);
        assert_eq!(device_atoken_state.base.owner, *authority_pubkey);
        assert_eq!(device_atoken_state.base.amount, 1);
    }

    // Do nothing if the domain already exists.
    if !ctx.accounts.wallet.data_is_empty() {
        return Ok(());
    }

    let wallet = Wallet {
        key: Key::Wallet,
        authority: *authority_pubkey,
        device: *ctx.accounts.device.key,
        vault: *vault_pubkey,
        vault_bump,
    };
    let bump = [wallet_bump];
    seeds.push(&bump);
    create_account(
        ctx.accounts.wallet,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        Wallet::LEN,
        program_id,
        Some(&[&seeds]),
    )?;

    wallet.save(ctx.accounts.wallet)
}

fn proxy_call<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], instruction_data: &[u8]) -> ProgramResult {
    // Accounts.
    let ctx = ProxyCallAccounts::context(accounts)?;
    assert_program_owner("wallet", ctx.accounts.wallet, program_id)?;

    let wallet_account = Wallet::load(ctx.accounts.wallet)?;
    assert_same_pubkeys("authority", ctx.accounts.authority, &wallet_account.authority)?;

    let mut wallet_seed = Wallet::seeds(&wallet_account.device, &wallet_account.authority);
    let bump = [wallet_account.vault_bump];
    wallet_seed.push(&bump);

    let vault_seeds = [
        b"VAULT",
        ctx.accounts.wallet.key.as_ref(),
        &[wallet_account.vault_bump],
    ];

    let ix_accounts = ctx
        .remaining_accounts
        .iter()
        .map(|a| {
            let is_signer =
                if a.key == ctx.accounts.vault.key {
                    true
                } else {
                    a.is_signer
                };

            if a.is_writable {
                AccountMeta::new(*a.key, is_signer)
            } else {
                AccountMeta::new_readonly(*a.key, is_signer)
            }
        })
        .collect();

    let instruction = Instruction::new_with_bytes(
        *ctx.accounts.target_program.key,
        instruction_data,
        ix_accounts,
    );

    msg!("ProxyCall: {:?}", instruction);

    invoke_signed(&instruction, ctx.remaining_accounts, &[&vault_seeds])
}
