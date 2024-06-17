use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey, system_program,
};
use spl_token_2022::extension::{BaseStateWithExtensions, StateWithExtensions};
use spl_token_2022::state::Mint;
use spl_token_metadata_interface::state::TokenMetadata;

use crate::assertions::{
    assert_pda, assert_same_pubkeys, assert_signer, assert_writable,
};
use crate::instruction::accounts::{CreateVirtualDeviceAccounts, InitAccounts};
use crate::instruction::{CreateVirtualDeviceArgs, DemoInstruction, InitArgs};
use crate::state::{DemoAccount, Key};
use crate::utils::create_account;

use dephy_id_program_client::instructions::{
    CreateActivatedDeviceCpiBuilder, CreateProductCpiBuilder,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: DemoInstruction = DemoInstruction::try_from_slice(instruction_data)?;
    match instruction {
        DemoInstruction::Init(args) => {
            msg!("Instruction: Init");
            init(program_id, accounts, args)
        }
        DemoInstruction::CreateVirtualDevice(args) => {
            msg!("Instruction: CreateVirtualDevice");
            create_virtual_device(program_id, accounts, args)
        }
    }
}

fn init<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>], args: InitArgs) -> ProgramResult {
    // Accounts.
    let ctx = InitAccounts::context(accounts)?;

    // Guards.
    let mut demo_seeds = DemoAccount::seeds();
    let demo_bump = [assert_pda("demo_account", ctx.accounts.demo, &crate::ID, &demo_seeds)?];
    demo_seeds.push(&demo_bump);
    assert_signer("authority", ctx.accounts.authority)?;
    assert_signer("payer", ctx.accounts.payer)?;
    assert_writable("payer", ctx.accounts.payer)?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    // Create Counter PDA.
    let account = DemoAccount {
        key: Key::DemoAccount,
        authority: *ctx.accounts.authority.key,
        product_mint: *ctx.accounts.product_mint.key,
    };
    create_account(
        ctx.accounts.demo,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        DemoAccount::LEN,
        &crate::ID,
        Some(&[&demo_seeds]),
    )?;

    account.save(ctx.accounts.demo)?;

    let mut vendor_seeds: Vec<&[u8]> = vec![b"VENDOR"];
    let vendor_bump = [assert_pda(
        "vendor",
        ctx.accounts.vendor,
        program_id,
        &vendor_seeds,
    )?];
    vendor_seeds.push(&vendor_bump);

    let mut create_product = CreateProductCpiBuilder::new(ctx.accounts.dephy_id);
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
        .invoke_signed(&[&vendor_seeds])?;

    Ok(())
}

fn create_virtual_device<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateVirtualDeviceArgs,
) -> ProgramResult {
    // Accounts.
    let ctx = CreateVirtualDeviceAccounts::context(accounts)?;
    let owner_pubkey = ctx.accounts.owner.key;

    let demo_account = DemoAccount::load(ctx.accounts.demo)?;
    assert_same_pubkeys("product_mint", ctx.accounts.product_mint, &demo_account.product_mint)?;

    let product_mint_data = ctx.accounts.product_mint.data.borrow().to_owned();
    let product_mint = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
    let product_mint_metadata = product_mint.get_variable_len_extension::<TokenMetadata>()?;

    let mut device_seeds: Vec<&[u8]> = vec![b"DEVICE", owner_pubkey.as_ref()];
    let device_bump = [assert_pda("device", ctx.accounts.device, program_id, &device_seeds)?];
    device_seeds.push(&device_bump);

    // TODO: use your own verify method
    assert_eq!(args.challenge, 42);

    let mut create_activated_device = CreateActivatedDeviceCpiBuilder::new(ctx.accounts.dephy_id);
    create_activated_device
        .system_program(ctx.accounts.system_program)
        .token2022_program(ctx.accounts.token_2022_program)
        .ata_program(ctx.accounts.ata_program)
        .payer(ctx.accounts.payer)
        .vendor(ctx.accounts.vendor)
        .owner(ctx.accounts.owner)
        .product_mint(ctx.accounts.product_mint)
        .product_associated_token(ctx.accounts.product_atoken)
        .device(ctx.accounts.device)
        .device_mint(ctx.accounts.device_mint)
        .device_associated_token(ctx.accounts.device_atoken)
        .name(product_mint_metadata.name)
        .uri(product_mint_metadata.uri)
        .additional_metadata(product_mint_metadata.additional_metadata)
        .invoke_signed(&[&device_seeds])?;

    Ok(())
}
