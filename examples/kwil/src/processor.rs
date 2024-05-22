use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_token_2022::{extension::StateWithExtensions, state::Account};

use crate::{
    assertions::assert_same_pubkeys,
    instruction::{
        accounts::{LinkAccounts, PublishAccounts, SubscribeAccounts},
        KwilExampleInstruction, PublishArgs,
    },
    state::{
        Key, LinkedAccount, LinkedData, PublisherAccount, PublisherData, SubscriberAccount,
        SubscriberData,
    },
    utils::create_account,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: KwilExampleInstruction =
        KwilExampleInstruction::try_from_slice(instruction_data)?;

    match instruction {
        KwilExampleInstruction::Publish(args) => process_publish(program_id, accounts, args),
        KwilExampleInstruction::Link(args) => process_link(program_id, accounts, args),
        KwilExampleInstruction::Subscribe(args) => process_subscribe(program_id, accounts, args),
    }
}

fn process_publish<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: PublishArgs,
) -> Result<(), ProgramError> {
    let ctx = PublishAccounts::context(accounts)?;
    let did_atoken = ctx.accounts.did_atoken.key;
    let owner = ctx.accounts.owner.key;

    let seeds: &[&[u8]] = &[b"PUBLISHER", did_atoken.as_ref(), &[args.bump]];
    let publisher_pubkey = Pubkey::create_program_address(seeds, program_id)?;
    assert_same_pubkeys("publisher", ctx.accounts.publisher, &publisher_pubkey)?;

    {
        let did_account_data = ctx.accounts.did_atoken.data.borrow();
        let did_account = StateWithExtensions::<Account>::unpack(&did_account_data)?;
        assert_same_pubkeys("DID Owner", ctx.accounts.owner, &did_account.base.owner)?;
    }

    create_account(
        ctx.accounts.publisher,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        PublisherAccount::LEN,
        program_id,
        &[seeds],
    )?;

    let publisher_account = PublisherAccount {
        key: Key::PublisherAccount,
        authority: *owner,
        data: PublisherData {
            bump: args.bump,
            eth_address: args.eth_address,
        },
    };

    publisher_account.save(ctx.accounts.publisher)
}

fn process_link<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: crate::instruction::LinkArgs,
) -> Result<(), ProgramError> {
    let ctx = LinkAccounts::context(accounts)?;
    let user_pubkey = ctx.accounts.user.key;

    let seeds: &[&[u8]] = &[
        b"LINKED",
        user_pubkey.as_ref(),
        &args.eth_address,
        &[args.bump],
    ];
    let linked_pubkey = Pubkey::create_program_address(seeds, program_id)?;
    assert_same_pubkeys("linked", ctx.accounts.linked, &linked_pubkey)?;

    create_account(
        ctx.accounts.linked,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        LinkedAccount::LEN,
        program_id,
        &[seeds],
    )?;

    let linked_account = LinkedAccount {
        key: Key::LinkedAccount,
        authority: *user_pubkey,
        data: LinkedData {
            bump: args.bump,
            eth_address: args.eth_address,
        },
    };

    linked_account.save(ctx.accounts.linked)
}

fn process_subscribe<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: crate::instruction::SubscribeArgs,
) -> Result<(), ProgramError> {
    let ctx = SubscribeAccounts::context(accounts)?;
    let user_pubkey = ctx.accounts.user.key;
    let publisher_pubkey = ctx.accounts.publisher.key;
    let linked_pubkey = ctx.accounts.linked.key;

    let seeds: &[&[u8]] = &[
        b"SUBSCRIBER",
        publisher_pubkey.as_ref(),
        linked_pubkey.as_ref(),
        &[args.bump],
    ];
    let subscriber_pubkey = Pubkey::create_program_address(seeds, program_id)?;
    assert_same_pubkeys("subscriber", ctx.accounts.subscriber, &subscriber_pubkey)?;

    let linked_account = LinkedAccount::load(ctx.accounts.linked)?;
    assert_same_pubkeys(
        "Linked Account",
        ctx.accounts.user,
        &linked_account.authority,
    )?;
    let _publisher_account = PublisherAccount::load(ctx.accounts.publisher)?;

    create_account(
        ctx.accounts.subscriber,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        SubscriberAccount::LEN,
        program_id,
        &[seeds],
    )?;

    let subscriber_account = SubscriberAccount {
        key: Key::LinkedAccount,
        authority: *user_pubkey,
        data: SubscriberData {
            bump: args.bump,
            publisher: *publisher_pubkey,
            linked: *linked_pubkey,
        },
    };

    subscriber_account.save(ctx.accounts.subscriber)
}
