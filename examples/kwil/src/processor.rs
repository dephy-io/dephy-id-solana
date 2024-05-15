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
        accounts::{CreateKwilAccounts, UpdateAclAccounts}, CreateKwilArgs, KwilExampleInstruction, UpdateAclArgs
    },
    state::{Key, KwilAccount, KwilAclAccount, KwilAclData, KwilData},
    utils::create_account,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: KwilExampleInstruction = KwilExampleInstruction::try_from_slice(instruction_data)?;

    match instruction {
        KwilExampleInstruction::CreateKwil(args) => create_kwil(program_id, accounts, args),
        KwilExampleInstruction::UpdateAcl(args) => update_acl(program_id, accounts, args),
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

    assert_same_pubkeys(
        "dephy",
        ctx.accounts.dephy_program,
        &dephy_io_dephy_id_client::ID,
    )?;

    // Create KwilAccount
    let seeds: &[&[u8]] = &[
        b"KWIL",
        authority.as_ref(),
        args.kwil_signer.as_ref(),
        &[args.bump],
    ];
    create_account(
        ctx.accounts.kwil_account,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        KwilAccount::LEN,
        program_id,
        &[seeds],
    )?;

    let kwil_account = KwilAccount {
        key: Key::KwilAccount,
        authority: *authority,
        data: KwilData {
            bump: args.bump,
            kwil_signer: args.kwil_signer,
        },
    };

    kwil_account.save(ctx.accounts.kwil_account)
}

fn update_acl<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: UpdateAclArgs,
) -> ProgramResult {
    // Accounts
    let ctx = UpdateAclAccounts::context(accounts)?;

    if ctx.accounts.kwil_account.owner != program_id {
        return Err(KwilError::InvalidProgramOwner.into());
    }

    let kwil_account_pubkey = ctx.accounts.kwil_account.key;
    let did_pubkey = ctx.accounts.did_atoken.key;

    // TODO: verify PDAs

    let kwil_account = KwilAccount::load(ctx.accounts.kwil_account)?;
    assert_same_pubkeys("authority", ctx.accounts.authority, &kwil_account.authority)?;

    let target_hash = hash::hash(args.target.as_ref()).to_bytes();
    let seeds: &[&[u8]] = &[
        b"KWIL ACL",
        kwil_account_pubkey.as_ref(),
        did_pubkey.as_ref(),
        args.subject.as_ref(),
        target_hash.as_ref(),
        &[args.bump],
    ];

    if ctx.accounts.kwil_acl_account.data_is_empty() {
        create_account(
            ctx.accounts.kwil_acl_account,
            ctx.accounts.payer,
            ctx.accounts.system_program,
            KwilAclAccount::LEN,
            program_id,
            &[seeds],
        )?;

        let kwil_acl_account = KwilAclAccount {
            key: Key::KwilAclAccount,
            authority: kwil_account.authority,
            data: KwilAclData {
                bump: args.bump,
                read_level: args.read_level,
                write_level: args.write_level,
                subject: args.subject,
                target_hash,
            },
        };

        kwil_acl_account.save(ctx.accounts.kwil_acl_account)?;
    } else {
        let kwil_acl_pubkey = Pubkey::create_program_address(seeds, program_id)?;
        assert_same_pubkeys("kwil acl", ctx.accounts.kwil_acl_account, &kwil_acl_pubkey)?;

        let mut kwil_acl_account = KwilAclAccount::load(ctx.accounts.kwil_acl_account)?;
        kwil_acl_account.data.read_level = args.read_level;
        kwil_acl_account.data.write_level = args.write_level;
        kwil_acl_account.data.subject = args.subject;
        kwil_acl_account.data.target_hash = target_hash;

        kwil_acl_account.save(ctx.accounts.kwil_acl_account)?;
    };

    Ok(())
}

