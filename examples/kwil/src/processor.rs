use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    hash, pubkey::Pubkey,
};

use crate::{
    assertions::assert_same_pubkeys,
    error::KwilError,
    instruction::{
        accounts::{CreateAclAccounts, CreateKwilAccounts},
        CreateAclArgs, CreateKwilArgs, DephyKwilInstruction,
    },
    state::{Key, KwilAccount, KwilData},
    utils::create_account,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: DephyKwilInstruction = DephyKwilInstruction::try_from_slice(instruction_data)?;

    match instruction {
        DephyKwilInstruction::CreateKwil(args) => create_kwil(program_id, accounts, args),
        DephyKwilInstruction::CreateAcl(args) => create_acl(program_id, accounts, args),
    }
}

fn create_kwil<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateKwilArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateKwilAccounts::context(accounts)?;
    let authority = ctx.accounts.authority.key;
    let did_pubkey = ctx.accounts.did_atoken.key;

    assert_same_pubkeys(
        "dephy",
        ctx.accounts.dephy_program,
        &dephy_io_dephy_id_client::ID,
    )?;

    // Create KwilAccount
    let seeds: &[&[u8]] = &[
        b"KWIL",
        authority.as_ref(),
        did_pubkey.as_ref(),
        &[args.bump],
    ];
    create_account(
        ctx.accounts.kwil_account,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        KwilAccount::LEN,
        None,
        program_id,
        &[seeds],
    )?;

    let kwil_account = KwilAccount {
        key: Key::DephyKwilAccount,
        authority: *authority,
        data: KwilData {
            bump: args.bump,
            hash: ctx.accounts.kwil_account.key.to_bytes(),
        },
    };

    kwil_account.save(ctx.accounts.kwil_account)
}

fn create_acl<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateAclArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateAclAccounts::context(accounts)?;

    if ctx.accounts.kwil_account.owner != program_id {
        return Err(KwilError::InvalidProgramOwner.into());
    }
    // TODO: verify PDAs

    let mut kwil_account = KwilAccount::load(ctx.accounts.kwil_account)?;
    assert_same_pubkeys("authority", ctx.accounts.authority, &kwil_account.authority)?;

    let data = borsh::to_vec(&args)?;
    kwil_account.data.hash = hash::hashv(&[&kwil_account.data.hash, data.as_ref()]).to_bytes();
    kwil_account.save(ctx.accounts.kwil_account)
}

