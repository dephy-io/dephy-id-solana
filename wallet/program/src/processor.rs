use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_program,
};

use crate::{assertions::{
    assert_pda, assert_program_owner, assert_same_pubkeys, assert_signer, assert_writable,
}};
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
            proxy_call(accounts, ix_data.as_ref())
        }
    }
}

fn create<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], _bump: u8) -> ProgramResult {
    // Accounts.
    let ctx = CreateAccounts::context(accounts)?;

    // Guards.
    let mut seeds = Wallet::seeds(ctx.accounts.device.key, ctx.accounts.authority.key);
    let wallet_bump = assert_pda("wallet", ctx.accounts.wallet, program_id, &seeds)?;
    let vault_bump = assert_pda(
        "vault",
        ctx.accounts.vault,
        &crate::ID,
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

    // Do nothing if the domain already exists.
    if !ctx.accounts.wallet.data_is_empty() {
        return Ok(());
    }

    // Create Counter PDA.
    let wallet = Wallet {
        key: Key::Wallet,
        authority: *ctx.accounts.authority.key,
        device: *ctx.accounts.device.key,
        vault: *ctx.accounts.vault.key,
        vault_bump,
    };
    let bump = [wallet_bump];
    seeds.push(&bump);
    create_account(
        ctx.accounts.wallet,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        Wallet::LEN,
        &crate::ID,
        Some(&[&seeds]),
    )?;

    wallet.save(ctx.accounts.wallet)
}

fn proxy_call<'a>(accounts: &'a [AccountInfo<'a>], instruction_data: &[u8]) -> ProgramResult {
    // Accounts.
    let ctx = ProxyCallAccounts::context(accounts)?;
    assert_program_owner("wallet", ctx.accounts.wallet, &crate::id())?;

    let wallet_account = Wallet::load(ctx.accounts.wallet)?;

    let mut wallet_seed = Wallet::seeds(&wallet_account.device, &wallet_account.authority);
    let bump = [wallet_account.vault_bump];
    wallet_seed.push(&bump);

    let vault_seeds = [
        b"VAULT",
        ctx.accounts.wallet.key.as_ref(),
        &[wallet_account.vault_bump],
    ];

    for a in ctx.remaining_accounts {
        msg!("{:?}", a)
    }

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
