use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo,
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_program,
    sysvar::{instructions::get_instruction_relative, Sysvar},
};
use spl_token_2022::{
    extension::{metadata_pointer, ExtensionType, StateWithExtensions},
    state::Mint,
};
use spl_token_metadata_interface::state::{Field, TokenMetadata};

use crate::{
    assertions::{
        assert_pda, assert_program_owner, assert_same_pubkeys, assert_signer, assert_writable,
    },
    instruction::{
        accounts::{
            ActivateDeviceAccounts, CreateDephyAccounts, CreateDeviceAccounts,
            CreateProductAccounts, CreateVendorAccounts,
        },
        ActivateDeviceArgs, CreateDephyArgs, CreateDeviceArgs, CreateProductArgs, CreateVendorArgs,
        DephyInstruction, KeyType,
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
        DephyInstruction::CreateDevice(args) => {
            msg!("Instruction: Create Device");
            create_device(program_id, accounts, args)
        }
        DephyInstruction::ActivateDevice(args) => {
            msg!("Instruction: Activate Device");
            activate_device(program_id, accounts, args)
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

    // Guards
    let (dephy_pubkey, _bump) = Pubkey::find_program_address(&[b"DePHY"], program_id);
    assert_same_pubkeys("dephy", ctx.accounts.dephy, &dephy_pubkey)?;

    let seeds: &[&[u8]] = &[b"DePHY", &[args.bump]];
    assert_pda("DePHY", ctx.accounts.dephy, program_id, seeds)?;
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
        data: DephyData { bump: args.bump },
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

    // Guards
    assert_program_owner("Dephy owner", ctx.accounts.dephy, program_id)?;
    let (dephy_pubkey, _bump) = Pubkey::find_program_address(&[b"DePHY"], program_id);
    assert_same_pubkeys("dephy", ctx.accounts.dephy, &dephy_pubkey)?;

    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    assert_same_pubkeys(
        "token_program_2022",
        ctx.accounts.token_program_2022,
        &token_program_id,
    )?;

    let mint_seeds: &[&[u8]] = &[b"DePHY VENDOR", vendor_pubkey.as_ref(), &[args.bump]];
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
            Some(*vendor_pubkey),
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
            vendor_pubkey,
            Some(vendor_pubkey),
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
            vendor_pubkey,
            &mint_pubkey,
            vendor_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            // [w] Metadata
            ctx.accounts.vendor_mint.clone(),
            // [] Update authority
            ctx.accounts.vendor.clone(),
            // [] Mint
            ctx.accounts.vendor_mint.clone(),
            // [s] Mint authority
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
                ctx.accounts.vendor_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.vendor.clone(),
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
            vendor_pubkey,
            &[vendor_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.vendor_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.vendor_atoken.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.vendor.clone(),
        ],
    )?;

    // disable mint
    invoke(
        &spl_token_2022::instruction::set_authority(
            &token_program_id,
            &mint_pubkey,
            None,
            spl_token_2022::instruction::AuthorityType::MintTokens,
            vendor_pubkey,
            &[vendor_pubkey],
        )?,
        &[
            // [writable] The mint or account to change the authority of.
            ctx.accounts.vendor_mint.clone(),
            // [signer] The current authority of the mint or account.
            ctx.accounts.vendor.clone(),
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
        ctx.accounts.vendor.key.as_ref(),
        &args.seed,
        &[args.bump],
    ];
    let mint_pubkey = Pubkey::create_program_address(mint_seeds, program_id)?;
    assert_same_pubkeys("product_mint", ctx.accounts.product_mint, &mint_pubkey)?;

    let (vendor_mint_pubkey, _) =
        Pubkey::find_program_address(&[b"DePHY VENDOR", vendor_pubkey.as_ref()], program_id);
    assert_same_pubkeys("vendor_mint", ctx.accounts.vendor_mint, &vendor_mint_pubkey)?;

    {
        let vendor_mint_data = ctx.accounts.vendor_mint.data.borrow();
        let vendor_mint_state = StateWithExtensions::<Mint>::unpack(&vendor_mint_data)?;
        assert!(vendor_mint_state.base.is_initialized);
        assert!(vendor_mint_state.base.mint_authority.is_none());

        let vendor_atoken_data = ctx.accounts.vendor_atoken.data.borrow();
        let vendor_atoken_state =
            StateWithExtensions::<spl_token_2022::state::Account>::unpack(&vendor_atoken_data)?;
        assert_eq!(vendor_atoken_state.base.amount, 1);
        assert_eq!(vendor_atoken_state.base.owner, *vendor_pubkey);
        assert_eq!(vendor_atoken_state.base.mint, vendor_mint_pubkey);
    }

    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::NonTransferable,
        ExtensionType::MetadataPointer,
    ])?;

    let metadata = TokenMetadata {
        name: args.name,
        symbol: args.symbol,
        uri: args.uri,
        additional_metadata: args.additional_metadata,
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
            // TODO: use PDA as authority
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

fn create_device<'a>(
    _program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    _args: CreateDeviceArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateDeviceAccounts::context(accounts)?;
    let token_program_id = spl_token_2022::id();
    let payer_pubkey = ctx.accounts.payer.key;
    let vendor_pubkey = ctx.accounts.vendor.key;
    let mint_pubkey = ctx.accounts.product_mint.key;
    let device_pubkey = ctx.accounts.device.key;

    // Guards
    assert_same_pubkeys(
        "token_program_2022",
        ctx.accounts.token_program_2022,
        &token_program_id,
    )?;

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        &device_pubkey,
        &mint_pubkey,
        &token_program_id,
    );

    assert_same_pubkeys(
        "atoken_account",
        ctx.accounts.product_atoken,
        &atoken_pubkey,
    )?;

    // TODO: check account pubkeys
    {
        let product_mint_data = ctx.accounts.product_mint.data.borrow();
        let product_mint_state = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
        assert_eq!(product_mint_state.base.decimals, 0);
    }

    // create atoken for device
    invoke(
        &spl_associated_token_account::instruction::create_associated_token_account(
            payer_pubkey,
            &device_pubkey,
            &mint_pubkey,
            &token_program_id,
        ),
        &[
            // 0. `[writeable,signer]` Funding account (must be a system account)
            ctx.accounts.payer.clone(),
            // 1. `[writeable]` Associated token account address to be created
            ctx.accounts.product_atoken.clone(),
            // 2. `[]` Wallet address for the new associated token account
            ctx.accounts.device.clone(),
            // 3. `[]` The token mint for the new associated token account
            ctx.accounts.product_mint.clone(),
            // 4. `[]` System program
            ctx.accounts.system_program.clone(),
            // 5. `[]` SPL Token program
            ctx.accounts.token_program_2022.clone(),
        ],
    )?;

    // mint to device
    invoke(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &mint_pubkey,
            &atoken_pubkey,
            vendor_pubkey,
            &[vendor_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.product_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.product_atoken.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.vendor.clone(),
        ],
    )?;

    Ok(())
}

fn activate_device<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: ActivateDeviceArgs,
) -> ProgramResult {
    // Accounts
    let ctx = ActivateDeviceAccounts::context(accounts)?;
    let token_program_id = spl_token_2022::id();
    let payer_pubkey = ctx.accounts.payer.key;
    let product_atoken_pubkey = ctx.accounts.product_atoken.key;
    let device_pubkey = ctx.accounts.device.key;
    let user_pubkey = ctx.accounts.user.key;

    // Guards
    assert_signer("user", ctx.accounts.user)?;

    // ed25519 or secp256k1 program should be called to verify signature
    let sign_ix = get_instruction_relative(-1, ctx.accounts.instructions)?;
    let (key, message) = match args.key_type {
        KeyType::Ed25519 => {
            if sign_ix.program_id != solana_program::ed25519_program::id() {
                return Err(ProgramError::IncorrectProgramId);
            }
            args.key_type.decode(&sign_ix.data)?
        }
        KeyType::Secp256k1 => {
            if sign_ix.program_id != solana_program::secp256k1_program::id() {
                return Err(ProgramError::IncorrectProgramId);
            }
            args.key_type.decode(&sign_ix.data)?
        }
    };
    assert_eq!(key, device_pubkey.to_bytes());
    assert_eq!(message[0..32], product_atoken_pubkey.to_bytes());
    assert_eq!(message[32..64], user_pubkey.to_bytes());
    let clock = Clock::get()?;
    let slot = u64::from_le_bytes(message[64..72].try_into().unwrap());
    assert!(clock.slot >= slot);
    assert!(clock.slot < slot + 500);

    // TODO: verify Device/Product/Vendor

    // Create the DID token
    let mint_seeds: &[&[u8]] = &[
        b"DePHY DID",
        device_pubkey.as_ref(),
        user_pubkey.as_ref(),
        &[args.bump],
    ];

    let mint_pubkey = Pubkey::create_program_address(mint_seeds, program_id)?;
    assert_same_pubkeys("did_mint", ctx.accounts.did_mint, &mint_pubkey)?;

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        user_pubkey,
        &mint_pubkey,
        &token_program_id,
    );
    assert_same_pubkeys("did_atoken", ctx.accounts.did_atoken, &atoken_pubkey)?;

    // calc account size
    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::NonTransferable,
        ExtensionType::MetadataPointer,
    ])?;

    // TODO: calc metadata
    let metadata = TokenMetadata {
        name: "DePHY Device DID".to_string(),
        symbol: "DDID".to_string(),
        uri: "https://example.com".to_string(),
        additional_metadata: [
            ("description".to_string(), "Example DID Device".to_string()),
            ("device".to_string(), device_pubkey.to_string()),
        ]
        .to_vec(),
        ..Default::default()
    };
    let metadata_size = metadata.tlv_size_of()?;

    // CPIs
    // create mint account
    create_account(
        ctx.accounts.did_mint,
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
            ctx.accounts.did_mint.clone(),
        ],
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &mint_pubkey,
            Some(mint_pubkey),
            Some(mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            ctx.accounts.did_mint.clone(),
        ],
    )?;

    // init the mint
    invoke_signed(
        &spl_token_2022::instruction::initialize_mint2(
            &token_program_id,
            &mint_pubkey,
            &mint_pubkey,
            Some(&mint_pubkey),
            0,
        )?,
        &[
            // [writable] The mint to initialize.
            ctx.accounts.did_mint.clone(),
        ],
        &[mint_seeds],
    )?;

    // init metadata
    invoke_signed(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &mint_pubkey,
            &mint_pubkey,
            &mint_pubkey,
            &mint_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            // [w] Metadata
            ctx.accounts.did_mint.clone(),
            // [] Update authority
            ctx.accounts.did_mint.clone(),
            // [] Mint
            ctx.accounts.did_mint.clone(),
            // [s] Mint authority
            ctx.accounts.did_mint.clone(),
        ],
        &[mint_seeds],
    )?;

    for (field, value) in metadata.additional_metadata {
        invoke_signed(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program_id,
                &mint_pubkey,
                &mint_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                ctx.accounts.did_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.did_mint.clone(),
            ],
            &[mint_seeds],
        )?;
    }

    // create atoken account
    invoke(
        &spl_associated_token_account::instruction::create_associated_token_account(
            payer_pubkey,
            user_pubkey,
            &mint_pubkey,
            &token_program_id,
        ),
        &[
            // 0. `[writeable,signer]` Funding account (must be a system account)
            ctx.accounts.payer.clone(),
            // 1. `[writeable]` Associated token account address to be created
            ctx.accounts.did_atoken.clone(),
            // 2. `[]` Wallet address for the new associated token account
            ctx.accounts.user.clone(),
            // 3. `[]` The token mint for the new associated token account
            ctx.accounts.did_mint.clone(),
            // 4. `[]` System program
            ctx.accounts.system_program.clone(),
            // 5. `[]` SPL Token program
            ctx.accounts.token_program_2022.clone(),
        ],
    )?;

    // mint to user
    invoke_signed(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &mint_pubkey,
            &atoken_pubkey,
            &mint_pubkey,
            &[&mint_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.did_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.did_atoken.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.did_mint.clone(),
        ],
        &[mint_seeds],
    )?;

    // disable mint
    invoke_signed(
        &spl_token_2022::instruction::set_authority(
            &token_program_id,
            &mint_pubkey,
            None,
            spl_token_2022::instruction::AuthorityType::MintTokens,
            &mint_pubkey,
            &[&mint_pubkey],
        )?,
        &[
            // [writable] The mint or account to change the authority of.
            ctx.accounts.did_mint.clone(),
            // [signer] The current authority of the mint or account.
            ctx.accounts.did_mint.clone(),
        ],
        &[mint_seeds],
    )?;

    Ok(())
}
