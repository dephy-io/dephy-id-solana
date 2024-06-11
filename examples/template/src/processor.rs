use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey, system_program,
};

use crate::assertions::{
    assert_pda, assert_program_owner, assert_same_pubkeys, assert_signer, assert_writable,
};
use crate::instruction::accounts::{IncrementAccounts, InitAccounts};
use crate::instruction::{DemoInstruction, InitArgs};
use crate::state::{DemoAccount, Key};
use crate::utils::create_account;

use dephy_id_program_client::instructions::CreateProductCpiBuilder;

pub fn process_instruction<'a>(
    _program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: DemoInstruction = DemoInstruction::try_from_slice(instruction_data)?;
    match instruction {
        DemoInstruction::Init(args) => {
            msg!("Instruction: Create");
            init(accounts, args)
        }
        DemoInstruction::Increment { amount } => {
            msg!("Instruction: Increment");
            increment(accounts, amount)
        }
    }
}

fn init<'a>(accounts: &'a [AccountInfo<'a>], args: InitArgs) -> ProgramResult {
    // Accounts.
    let ctx = InitAccounts::context(accounts)?;

    // Guards.
    let mut seeds = DemoAccount::seeds();
    let bump = assert_pda(
        "counter",
        ctx.accounts.demo,
        &crate::ID,
        &seeds,
    )?;
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
    let bump = [bump];
    seeds.push(&bump);
    create_account(
        ctx.accounts.demo,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        DemoAccount::LEN,
        &crate::ID,
        Some(&[&seeds]),
    )?;

    account.save(ctx.accounts.demo)?;

    let mut vendor_seeds: Vec<&[u8]> = vec![b"VENDOR"];
    let vendor_bump = [assert_pda(
        "vendor",
        ctx.accounts.vendor,
        &dephy_id_program_client::ID,
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

fn increment<'a>(accounts: &'a [AccountInfo<'a>], amount: Option<u32>) -> ProgramResult {
    // Accounts.
    let ctx = IncrementAccounts::context(accounts)?;

    Ok(())
}
