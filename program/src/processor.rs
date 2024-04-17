use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    system_program,
};
use spl_token_2022::{
    extension::{metadata_pointer, ExtensionType},
    state::Mint,
};
use spl_token_metadata_interface::state::{Field, TokenMetadata};

use crate::{
    assertions::{
        assert_pda, assert_program_owner, assert_same_pubkeys, assert_signer, assert_writable,
    },
    instruction::{
        accounts::{CreateDephyAccounts, CreateProductAccounts, CreateVendorAccounts}, CreateDephyArgs, CreateProductArgs, CreateVendorArgs, DephyInstruction
    },
    state::{DephyAccount, DephyData, Key},
    utils::create_account,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: DephyInstruction = DephyInstruction::try_from_slice(instruction_data)?;

    match instruction {
        DephyInstruction::CreateDephy(args) => {
            msg!("Instruction: Create DePHY");
            create_dephy(program_id, accounts, args)
        }
        DephyInstruction::CreateVendor(args) => {
            msg!("Instruction: Create Vendor");
            create_vendor(program_id, accounts, args)
        }
        DephyInstruction::CreateProduct(args) => {
            msg!("Instruction: Create Product");
            create_product(program_id, accounts, args)
        }
        DephyInstruction::CreateDevice() => {
            msg!("Instruction: Create Device");
            // create_device(program_id, accounts)
            Ok(())
        }
        DephyInstruction::ActivateDevice(args) => {
            msg!("Instruction: Activate Device");
            // activate_device(program_id, accounts, args)
            Ok(())
        }
    }
}

fn create_dephy<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateDephyArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateDephyAccounts::context(accounts)?;

    let seeds: &[&[u8]] = &[b"DePHY", ctx.accounts.authority.key.as_ref(), &[args.bump]];

    // Guards
    assert_pda("Dephy", ctx.accounts.dephy, program_id, seeds)?;
    assert_signer("authority", ctx.accounts.authority)?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    // CPIs
    // Create DephyAccount
    create_account(
        ctx.accounts.dephy,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        DephyAccount::LEN,
        None,
        program_id,
        &[seeds],
    )?;

    let dephy_account = DephyAccount {
        key: Key::DephyAccount,
        authority: *ctx.accounts.authority.key,
        data: DephyData { version: 1 },
    };

    dephy_account.save(ctx.accounts.dephy)
}

fn create_vendor<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateVendorArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateVendorAccounts::context(accounts)?;
    let token_program_id = spl_token_2022::id();
    let payer_pubkey = ctx.accounts.payer.key;
    let vendor_pubkey = ctx.accounts.vendor.key;
    let authority_pubkey = ctx.accounts.authority.key;

    let dephy_account = DephyAccount::load(ctx.accounts.dephy)?;

    // Guards
    assert_same_pubkeys("authority", ctx.accounts.authority, &dephy_account.authority)?;
    assert_signer("authority", ctx.accounts.authority)?;

    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    let mint_seeds: &[&[u8]] = &[b"DePHY VENDOR", &vendor_pubkey.to_bytes(), &[args.bump]];
    let mint_pubkey = Pubkey::create_program_address(mint_seeds, program_id)?;
    assert_same_pubkeys("vendor_mint", ctx.accounts.vendor_mint, &mint_pubkey)?;
    assert_writable("vendor_mint", ctx.accounts.vendor_mint)?;

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        vendor_pubkey,
        &mint_pubkey,
        &token_program_id,
    );
    assert_same_pubkeys("vendor_atoken", ctx.accounts.vendor_atoken, &atoken_pubkey)?;
    assert_writable("vendor_atoken", ctx.accounts.vendor_atoken)?;

    // calc account size
    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::NonTransferable,
        ExtensionType::MetadataPointer,
    ])?;

    // TODO: from args
    let metadata = TokenMetadata {
        name: args.name,
        symbol: args.symbol,
        uri: args.uri,
        additional_metadata: args.additional_metadata,
        ..Default::default()
    };
    let metadata_size = metadata.tlv_size_of()?;

    // CPIs
    // create mint account
    create_account(
        ctx.accounts.vendor_mint,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        base_size,
        Some(base_size + metadata_size),
        &token_program_id,
        &[&mint_seeds],
    )?;

    // init non-transferable mint
    invoke(
        &spl_token_2022::instruction::initialize_non_transferable_mint(
            &token_program_id,
            &mint_pubkey,
        )?,
        &[
            // 0. `[writable]`  The mint account to initialize.
            ctx.accounts.vendor_mint.clone(),
        ],
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &mint_pubkey,
            Some(*authority_pubkey),
            Some(mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            ctx.accounts.vendor_mint.clone(),
        ],
    )?;

    // init the mint
    invoke_signed(
        &spl_token_2022::instruction::initialize_mint2(
            &token_program_id,
            &mint_pubkey,
            authority_pubkey,
            Some(authority_pubkey),
            0,
        )?,
        &[
            // [writable] The mint to initialize.
            ctx.accounts.vendor_mint.clone(),
        ],
        &[mint_seeds],
    )?;

    // init metadata
    invoke(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &mint_pubkey,
            authority_pubkey,
            &mint_pubkey,
            authority_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            // [w] Metadata
            ctx.accounts.vendor_mint.clone(),
            // [] Update authority
            ctx.accounts.authority.clone(),
            // [] Mint
            ctx.accounts.vendor_mint.clone(),
            // [s] Mint authority
            ctx.accounts.authority.clone(),
        ],
    )?;

    for (field, value) in metadata.additional_metadata {
        invoke(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program_id,
                &mint_pubkey,
                authority_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                ctx.accounts.vendor_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.authority.clone(),
            ],
        )?;
    }

    // create atoken account
    invoke(
        &spl_associated_token_account::instruction::create_associated_token_account(
            payer_pubkey,
            vendor_pubkey,
            &mint_pubkey,
            &token_program_id,
        ),
        &[
            // 0. `[writeable,signer]` Funding account (must be a system account)
            ctx.accounts.payer.clone(),
            // 1. `[writeable]` Associated token account address to be created
            ctx.accounts.vendor_atoken.clone(),
            // 2. `[]` Wallet address for the new associated token account
            ctx.accounts.vendor.clone(),
            // 3. `[]` The token mint for the new associated token account
            ctx.accounts.vendor_mint.clone(),
            // 4. `[]` System program
            ctx.accounts.system_program.clone(),
            // 5. `[]` SPL Token program
            ctx.accounts.token_program_2022.clone(),
        ],
    )?;

    // mint to vendor
    invoke(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &mint_pubkey,
            &atoken_pubkey,
            authority_pubkey,
            &[authority_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.vendor_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.vendor_atoken.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.authority.clone(),
        ],
    )?;

    // disable mint
    invoke(
        &spl_token_2022::instruction::set_authority(
            &token_program_id,
            &mint_pubkey,
            None,
            spl_token_2022::instruction::AuthorityType::MintTokens,
            authority_pubkey,
            &[authority_pubkey],
        )?,
        &[
            // [writable] The mint or account to change the authority of.
            ctx.accounts.vendor_mint.clone(),
            // [signer] The current authority of the mint or account.
            ctx.accounts.authority.clone(),
        ],
    )?;

    Ok(())
}


fn create_product<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateProductArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateProductAccounts::context(accounts)?;
    let token_program_id = spl_token_2022::id();
    let vendor_pubkey = ctx.accounts.vendor.key;

    // Guards
    assert_signer("vendor", ctx.accounts.vendor)?;

    let mint_seeds: &[&[u8]] = &[
        b"DePHY PRODUCT",
        &ctx.accounts.vendor.key.to_bytes(),
        &args.seed,
        &[args.bump],
    ];
    let mint_pubkey = Pubkey::create_program_address(mint_seeds, program_id)?;
    assert_same_pubkeys("product_mint", ctx.accounts.product_mint, &mint_pubkey)?;

    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::NonTransferable,
        ExtensionType::MetadataPointer,
    ])?;

    // TODO: from args
    let metadata = TokenMetadata {
        name: "Example Vendor Product 1".to_string(),
        symbol: "PD1".to_string(),
        uri: "https://example.com/metadata.json".to_string(),
        additional_metadata: [(
            "description".to_string(),
            "Example Vendor Product 1".to_string(),
        )]
        .to_vec(),
        ..Default::default()
    };
    let metadata_size = metadata.tlv_size_of()?;

    // Create mint
    create_account(
        ctx.accounts.product_mint,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        base_size,
        Some(base_size + metadata_size),
        &token_program_id,
        &[&mint_seeds],
    )?;

    // init non-transferable mint
    invoke(
        &spl_token_2022::instruction::initialize_non_transferable_mint(
            &token_program_id,
            &mint_pubkey,
        )?,
        &[
            // 0. `[writable]`  The mint account to initialize.
            ctx.accounts.product_mint.clone(),
        ],
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &mint_pubkey,
            Some(*vendor_pubkey),
            Some(mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            ctx.accounts.product_mint.clone(),
        ],
    )?;

    invoke(
        &spl_token_2022::instruction::initialize_mint2(
            &token_program_id,
            &mint_pubkey,
            vendor_pubkey,
            Some(vendor_pubkey),
            0,
        )?,
        &[ctx.accounts.product_mint.clone()],
    )?;

    // Initialize metadata
    invoke(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &mint_pubkey,
            vendor_pubkey,
            &mint_pubkey,
            vendor_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            ctx.accounts.product_mint.clone(),
            ctx.accounts.vendor.clone(),
            ctx.accounts.vendor.clone(),
            ctx.accounts.vendor.clone(),
        ],
    )?;

    for (field, value) in metadata.additional_metadata {
        invoke(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program_id,
                &mint_pubkey,
                vendor_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                ctx.accounts.product_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.vendor.clone(),
            ],
        )?;
    }

    Ok(())
}
