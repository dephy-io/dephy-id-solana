use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey, system_program,
};
use spl_token_2022::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::Mint,
};
use spl_token_metadata_interface::state::TokenMetadata;

use crate::{
    assertions::{assert_pda, assert_same_pubkeys, assert_signer, assert_writable},
    instruction::{
        accounts::{CreateDeviceAccounts, InitAccounts},
        CreateDeviceArgs, InitArgs, ProgramInstruction,
    },
    state::{Key, ProgramAccount},
    utils::create_account,
};

use dephy_id_program_client::{
    instructions::{CreateActivatedDeviceCpiBuilder, CreateProductCpiBuilder},
    types::CreateActivatedDeviceArgs,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: ProgramInstruction = ProgramInstruction::try_from_slice(instruction_data)?;
    match instruction {
        ProgramInstruction::Init(args) => {
            msg!("Instruction: Init");
            init(program_id, accounts, args)
        }
        ProgramInstruction::CreateDevice(args) => {
            msg!("Instruction: CreateDevice");
            create_device(program_id, accounts, args)
        }
    }
}

fn init<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], args: InitArgs) -> ProgramResult {
    // Accounts.
    let ctx = InitAccounts::context(accounts)?;

    // Guards.
    assert_same_pubkeys("dephy_id", ctx.accounts.dephy_id_program, &dephy_id_program_client::ID)?;
    // TODO: more

    let mut pda_seeds = ProgramAccount::seeds();
    let pda_bump = [assert_pda(
        "Program",
        ctx.accounts.program_pda,
        &crate::ID,
        &pda_seeds,
    )?];
    pda_seeds.push(&pda_bump);
    assert_signer("authority", ctx.accounts.authority)?;
    assert_signer("payer", ctx.accounts.payer)?;
    assert_writable("payer", ctx.accounts.payer)?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    // Create Counter PDA.
    let account = ProgramAccount {
        key: Key::ProgramAccount,
        authority: *ctx.accounts.authority.key,
        product_mint: *ctx.accounts.product_mint.key,
    };
    create_account(
        ctx.accounts.program_pda,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        ProgramAccount::LEN,
        &crate::ID,
        Some(&[&pda_seeds]),
    )?;

    account.save(ctx.accounts.program_pda)?;

    let mut vendor_seeds: Vec<&[u8]> = vec![b"VENDOR"];
    let vendor_bump = [assert_pda(
        "vendor",
        ctx.accounts.vendor,
        program_id,
        &vendor_seeds,
    )?];
    vendor_seeds.push(&vendor_bump);

    let mut create_product = CreateProductCpiBuilder::new(ctx.accounts.dephy_id_program);
    create_product
        .system_program(ctx.accounts.system_program)
        .token2022_program(ctx.accounts.token_2022_program)
        .payer(ctx.accounts.payer)
        .vendor(ctx.accounts.vendor)
        .product_mint(ctx.accounts.product_mint)
        .name(args.name)
        .symbol(args.symbol)
        .uri(args.uri)
        .additional_metadata(args.additional_metadata)
        .invoke_signed(&[&vendor_seeds])
}

fn create_device<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateDeviceArgs,
) -> ProgramResult {
    // Accounts.
    let ctx = CreateDeviceAccounts::context(accounts)?;
    let owner_pubkey = ctx.accounts.owner.key;

    // Guards
    assert_same_pubkeys("dephy_id", ctx.accounts.dephy_id_program, &dephy_id_program_client::ID)?;

    let product_mint_metadata = {
        let product_mint_data = ctx.accounts.product_mint.data.borrow();
        let product_mint = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
        product_mint.get_variable_len_extension::<TokenMetadata>()?
    };

    // TODO: use your own verify method
    assert_eq!(args.challenge, 42);

    let mut device_seeds: Vec<&[u8]> = vec![b"DEVICE", owner_pubkey.as_ref()];
    let device_bump = [assert_pda(
        "device",
        ctx.accounts.device,
        program_id,
        &device_seeds,
    )?];
    device_seeds.push(&device_bump);

    let mut vendor_seeds: Vec<&[u8]> = vec![b"VENDOR"];
    let vendor_bump = [assert_pda(
        "vendor",
        ctx.accounts.vendor,
        program_id,
        &vendor_seeds,
    )?];
    vendor_seeds.push(&vendor_bump);

    let mut create_activated_device =
        CreateActivatedDeviceCpiBuilder::new(ctx.accounts.dephy_id_program);
    create_activated_device
        .system_program(ctx.accounts.system_program)
        .token2022_program(ctx.accounts.token_2022_program)
        .ata_program(ctx.accounts.ata_program)
        .payer(ctx.accounts.payer)
        .vendor(ctx.accounts.vendor)
        .product_mint(ctx.accounts.product_mint)
        .product_associated_token(ctx.accounts.product_atoken)
        .owner(ctx.accounts.owner)
        .device(ctx.accounts.device)
        .device_mint(ctx.accounts.device_mint)
        .device_associated_token(ctx.accounts.device_atoken)
        .create_activated_device_args(CreateActivatedDeviceArgs {
            name: product_mint_metadata.name,
            uri: product_mint_metadata.uri,
            additional_metadata: product_mint_metadata.additional_metadata,
        })
        .invoke_signed(&[&vendor_seeds, &device_seeds])
}
