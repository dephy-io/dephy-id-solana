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
use spl_associated_token_account::get_associated_token_address_with_program_id;
use spl_token_2022::{
    extension::{metadata_pointer, BaseStateWithExtensions, ExtensionType, StateWithExtensions},
    state::{Account, Mint},
};
use spl_token_metadata_interface::state::{Field, TokenMetadata};

use crate::{
    assertions::{
        assert_pda, assert_pda_without_bump, assert_same_pubkeys, assert_signer, assert_writable,
    },
    instruction::{
        accounts::{
            ActivateDeviceAccounts, CreateDeviceAccounts, CreateProductAccounts,
            CreateVendorAccounts, InitializeAccounts,
        },
        ActivateDeviceArgs, CreateDeviceArgs, CreateProductArgs, CreateVendorArgs,
        DeviceSigningAlgorithm, InitializeArgs, Instruction,
    },
    state::{Key, ProgramData, ProgramDataAccount},
    utils::create_account,
    DEVICE_MINT_SEED_PREFIX, PRODUCT_MINT_SEED_PREFIX, PROGRAM_PDA_SEED_PREFIX,
    VENDOR_MINT_SEED_PREFIX,
};

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: Instruction = Instruction::try_from_slice(instruction_data)?;

    match instruction {
        Instruction::Initialize(args) => {
            msg!("Instruction: Initialize the program");
            initialize(program_id, accounts, args)
        }
        Instruction::CreateVendor(args) => {
            msg!("Instruction: Create Vendor");
            create_vendor(program_id, accounts, args)
        }
        Instruction::CreateProduct(args) => {
            msg!("Instruction: Create Product");
            create_product(program_id, accounts, args)
        }
        Instruction::CreateDevice(args) => {
            msg!("Instruction: Create Device");
            create_device(program_id, accounts, args)
        }
        Instruction::ActivateDevice(args) => {
            msg!("Instruction: Activate Device");
            activate_device(program_id, accounts, args)
        }
    }
}

fn initialize<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: InitializeArgs,
) -> ProgramResult {
    // Accounts
    let ctx = InitializeAccounts::context(accounts)?;

    // Guards
    let (program_pda_pubkey, _bump) =
        Pubkey::find_program_address(&[PROGRAM_PDA_SEED_PREFIX], program_id);
    assert_same_pubkeys(
        "program_pda",
        ctx.accounts.program_program_data,
        &program_pda_pubkey,
    )?;

    let seeds: &[&[u8]] = &[PROGRAM_PDA_SEED_PREFIX, &[args.bump]];
    assert_pda(
        "program_pda",
        ctx.accounts.program_program_data,
        program_id,
        seeds,
    )?;
    assert_signer("authority", ctx.accounts.authority)?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    // CPIs
    // Create PDA
    create_account(
        ctx.accounts.program_program_data,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        ProgramDataAccount::LEN,
        None,
        program_id,
        &[seeds],
    )?;

    let program_pda = ProgramDataAccount {
        key: Key::ProgramDataAccount,
        authority: *ctx.accounts.authority.key,
        data: ProgramData { bump: args.bump },
    };

    program_pda.save(ctx.accounts.program_program_data)
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
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    assert_same_pubkeys(
        "token_2022_program",
        ctx.accounts.token_2022_program,
        &token_program_id,
    )?;

    let vendor_mint_seeds: &[&[u8]] = &[
        VENDOR_MINT_SEED_PREFIX,
        vendor_pubkey.as_ref(),
        &[args.bump],
    ];
    let vendor_mint_pubkey = Pubkey::create_program_address(vendor_mint_seeds, program_id)?;
    assert_same_pubkeys("vendor_mint", ctx.accounts.vendor_mint, &vendor_mint_pubkey)?;
    assert_writable("vendor_mint", ctx.accounts.vendor_mint)?;

    let vendor_ata_pubkey = get_associated_token_address_with_program_id(
        vendor_pubkey,
        &vendor_mint_pubkey,
        &token_program_id,
    );
    assert_same_pubkeys(
        "vendor_ata",
        ctx.accounts.vendor_associated_token,
        &vendor_ata_pubkey,
    )?;
    assert_writable("vendor_ata", ctx.accounts.vendor_associated_token)?;

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
    // Create mint account
    create_account(
        ctx.accounts.vendor_mint,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        base_size,
        Some(base_size + metadata_size),
        &token_program_id,
        &[&vendor_mint_seeds],
    )?;

    // init non-transferable mint
    invoke(
        &spl_token_2022::instruction::initialize_non_transferable_mint(
            &token_program_id,
            &vendor_mint_pubkey,
        )?,
        &[
            // 0. `[writable]` The mint account to initialize.
            ctx.accounts.vendor_mint.clone(),
        ],
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &vendor_mint_pubkey,
            Some(*vendor_pubkey),
            Some(vendor_mint_pubkey),
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
            &vendor_mint_pubkey,
            vendor_pubkey,
            Some(vendor_pubkey),
            0,
        )?,
        &[
            // [writable] The mint account to initialize.
            ctx.accounts.vendor_mint.clone(),
        ],
        &[vendor_mint_seeds],
    )?;

    // init metadata
    invoke(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &vendor_mint_pubkey,
            vendor_pubkey,
            &vendor_mint_pubkey,
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
                &vendor_mint_pubkey,
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
            &vendor_mint_pubkey,
            &token_program_id,
        ),
        &[
            // 0. `[writeable,signer]` Funding account (must be a system account)
            ctx.accounts.payer.clone(),
            // 1. `[writeable]` Associated token account address to be created
            ctx.accounts.vendor_associated_token.clone(),
            // 2. `[]` Wallet address for the new associated token account
            ctx.accounts.vendor.clone(),
            // 3. `[]` The token mint for the new associated token account
            ctx.accounts.vendor_mint.clone(),
            // 4. `[]` System program
            ctx.accounts.system_program.clone(),
            // 5. `[]` SPL Token program
            ctx.accounts.token_2022_program.clone(),
        ],
    )?;

    // mint to vendor
    invoke(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &vendor_mint_pubkey,
            &vendor_ata_pubkey,
            vendor_pubkey,
            &[vendor_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.vendor_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.vendor_associated_token.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.vendor.clone(),
        ],
    )?;

    // disable mint
    invoke(
        &spl_token_2022::instruction::set_authority(
            &token_program_id,
            &vendor_mint_pubkey,
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

    let product_mint_seeds: &[&[u8]] = &[
        PRODUCT_MINT_SEED_PREFIX,
        vendor_pubkey.as_ref(),
        args.name.as_ref(),
        &[args.bump],
    ];
    let product_mint_pubkey = Pubkey::create_program_address(product_mint_seeds, program_id)?;
    assert_same_pubkeys(
        "product_mint",
        ctx.accounts.product_mint,
        &product_mint_pubkey,
    )?;

    let (vendor_mint_pubkey, _) = Pubkey::find_program_address(
        &[VENDOR_MINT_SEED_PREFIX, vendor_pubkey.as_ref()],
        program_id,
    );
    assert_same_pubkeys("vendor_mint", ctx.accounts.vendor_mint, &vendor_mint_pubkey)?;

    {
        let vendor_mint_data = ctx.accounts.vendor_mint.data.borrow();
        let vendor_mint_state = StateWithExtensions::<Mint>::unpack(&vendor_mint_data)?;
        assert!(vendor_mint_state.base.is_initialized);
        assert!(vendor_mint_state.base.mint_authority.is_none());

        let vendor_atoken_data = ctx.accounts.vendor_associated_token.data.borrow();
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
        name: args.name.clone(),
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
        &[&product_mint_seeds],
    )?;

    // init non-transferable mint
    invoke(
        &spl_token_2022::instruction::initialize_non_transferable_mint(
            &token_program_id,
            &product_mint_pubkey,
        )?,
        &[
            // 0. `[writable]` The mint account to initialize.
            ctx.accounts.product_mint.clone(),
        ],
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &product_mint_pubkey,
            Some(*vendor_pubkey),
            Some(product_mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            ctx.accounts.product_mint.clone(),
        ],
    )?;

    invoke(
        &spl_token_2022::instruction::initialize_mint2(
            &token_program_id,
            &product_mint_pubkey,
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
            &product_mint_pubkey,
            vendor_pubkey,
            &product_mint_pubkey,
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
                &product_mint_pubkey,
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
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    args: CreateDeviceArgs,
) -> ProgramResult {
    // Accounts
    let ctx = CreateDeviceAccounts::context(accounts)?;
    let token_program_id = spl_token_2022::id();
    let payer_pubkey = ctx.accounts.payer.key;
    let vendor_pubkey = ctx.accounts.vendor.key;
    let product_mint_pubkey = ctx.accounts.product_mint.key;
    let device_pubkey = ctx.accounts.device.key;

    // Guards
    assert_same_pubkeys(
        "token_2022_program",
        ctx.accounts.token_2022_program,
        &token_program_id,
    )?;

    let product_ata_pubkey = get_associated_token_address_with_program_id(
        &device_pubkey,
        &product_mint_pubkey,
        &token_program_id,
    );

    assert_same_pubkeys(
        "product_ata",
        ctx.accounts.product_associated_token,
        &product_ata_pubkey,
    )?;

    // TODO: check account pubkeys
    {
        let product_mint_data = ctx.accounts.product_mint.data.borrow();
        let product_mint_state = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
        assert_eq!(product_mint_state.base.decimals, 0);
        assert!(product_mint_state
            .base
            .mint_authority
            .contains(vendor_pubkey));
    }

    // create atoken for device
    invoke(
        &spl_associated_token_account::instruction::create_associated_token_account(
            payer_pubkey,
            &device_pubkey,
            &product_mint_pubkey,
            &token_program_id,
        ),
        &[
            // 0. `[writable,signer]` Funding account (must be a system account)
            ctx.accounts.payer.clone(),
            // 1. `[writable]` Associated token account address to be created
            ctx.accounts.product_associated_token.clone(),
            // 2. `[]` Wallet address for the new associated token account
            ctx.accounts.device.clone(),
            // 3. `[]` The token mint for the new associated token account
            ctx.accounts.product_mint.clone(),
            // 4. `[]` System program
            ctx.accounts.system_program.clone(),
            // 5. `[]` SPL Token program
            ctx.accounts.token_2022_program.clone(),
        ],
    )?;

    // mint to device
    invoke(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &product_mint_pubkey,
            &product_ata_pubkey,
            vendor_pubkey,
            &[vendor_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.product_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.product_associated_token.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.vendor.clone(),
        ],
    )?;

    // Create the DID token
    let device_mint_seeds: &[&[u8]] = &[
        DEVICE_MINT_SEED_PREFIX,
        device_pubkey.as_ref(),
        &[args.bump],
    ];
    let device_mint_pubkey = Pubkey::create_program_address(device_mint_seeds, program_id)?;
    assert_same_pubkeys("device_mint", ctx.accounts.device_mint, &device_mint_pubkey)?;

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

    // create DID mint account
    create_account(
        ctx.accounts.device_mint,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        base_size,
        Some(base_size + metadata_size),
        &token_program_id,
        &[&device_mint_seeds],
    )?;

    // init non-transferable mint
    invoke(
        &spl_token_2022::instruction::initialize_non_transferable_mint(
            &token_program_id,
            &device_mint_pubkey,
        )?,
        &[
            // 0. `[writable]` The mint account to initialize.
            ctx.accounts.device_mint.clone(),
        ],
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &device_mint_pubkey,
            Some(device_mint_pubkey),
            Some(device_mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            ctx.accounts.device_mint.clone(),
        ],
    )?;

    // init the mint
    invoke_signed(
        &spl_token_2022::instruction::initialize_mint2(
            &token_program_id,
            &device_mint_pubkey,
            &device_mint_pubkey,
            Some(&device_mint_pubkey),
            0,
        )?,
        &[
            // [writable] The mint to initialize.
            ctx.accounts.device_mint.clone(),
        ],
        &[device_mint_seeds],
    )?;

    // init metadata
    invoke_signed(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &device_mint_pubkey,
            &device_mint_pubkey,
            &device_mint_pubkey,
            &device_mint_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            // [w] Metadata
            ctx.accounts.device_mint.clone(),
            // [] Update authority
            ctx.accounts.device_mint.clone(),
            // [] Mint
            ctx.accounts.device_mint.clone(),
            // [s] Mint authority
            ctx.accounts.device_mint.clone(),
        ],
        &[device_mint_seeds],
    )?;

    for (field, value) in metadata.additional_metadata {
        invoke_signed(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program_id,
                &device_mint_pubkey,
                &device_mint_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                ctx.accounts.device_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.device_mint.clone(),
            ],
            &[device_mint_seeds],
        )?;
    }

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
    let vendor_pubkey = ctx.accounts.vendor.key;
    let product_mint_pubkey = ctx.accounts.product_mint.key;
    let product_ata_pubkey = ctx.accounts.product_associated_token.key;
    let device_pubkey = ctx.accounts.device.key;
    let owner_pubkey = ctx.accounts.owner.key;

    // Guards
    assert_signer("owner", ctx.accounts.owner)?;

    // ed25519 or secp256k1 program should be called to verify signature
    let sign_ix = get_instruction_relative(-1, ctx.accounts.instructions)?;
    let (key, message) = match args.signing_alg {
        DeviceSigningAlgorithm::Ed25519 => {
            if sign_ix.program_id != solana_program::ed25519_program::id() {
                return Err(ProgramError::IncorrectProgramId);
            }
            args.signing_alg.decode(&sign_ix.data)?
        }
        DeviceSigningAlgorithm::Secp256k1 => {
            if sign_ix.program_id != solana_program::secp256k1_program::id() {
                return Err(ProgramError::IncorrectProgramId);
            }
            args.signing_alg.decode(&sign_ix.data)?
        }
    };
    assert_eq!(key, device_pubkey.to_bytes());
    assert_eq!(message[0..32], product_ata_pubkey.to_bytes());
    assert_eq!(message[32..64], owner_pubkey.to_bytes());
    let clock = Clock::get()?;
    let slot = u64::from_le_bytes(message[64..72].try_into().unwrap());
    assert!(clock.slot >= slot);
    assert!(clock.slot < slot + 1500); // ~10min

    // TODO: verify Device/Product/Vendor
    {
        let device_account_data = ctx.accounts.product_associated_token.data.borrow();
        let product_device_account = StateWithExtensions::<Account>::unpack(&device_account_data)?;
        assert_same_pubkeys(
            "device_owner",
            ctx.accounts.device,
            &product_device_account.base.owner,
        )?;
    }

    let product_mint_data = ctx.accounts.product_mint.data.borrow();
    let product_mint = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
    let product_mint_metadata = product_mint.get_variable_len_extension::<TokenMetadata>()?;

    // Product from Vendor
    assert_pda_without_bump(
        "product_mint",
        ctx.accounts.product_mint,
        program_id,
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            product_mint_metadata.name.as_ref(),
        ],
    )?;

    // Device from Product
    assert_same_pubkeys(
        "product_ata",
        ctx.accounts.product_associated_token,
        &get_associated_token_address_with_program_id(
            device_pubkey,
            product_mint_pubkey,
            &token_program_id,
        ),
    )?;

    // Mint Device
    let device_mint_seeds: &[&[u8]] = &[
        DEVICE_MINT_SEED_PREFIX,
        device_pubkey.as_ref(),
        &[args.bump],
    ];
    let device_mint_pubkey = Pubkey::create_program_address(device_mint_seeds, program_id)?;
    assert_same_pubkeys("device_mint", ctx.accounts.device_mint, &device_mint_pubkey)?;

    let device_ata_pubkey = get_associated_token_address_with_program_id(
        owner_pubkey,
        &device_mint_pubkey,
        &token_program_id,
    );
    assert_same_pubkeys(
        "device_ata",
        ctx.accounts.device_associated_token,
        &device_ata_pubkey,
    )?;

    // CPIs

    // create atoken account
    invoke(
        &spl_associated_token_account::instruction::create_associated_token_account(
            payer_pubkey,
            owner_pubkey,
            &device_mint_pubkey,
            &token_program_id,
        ),
        &[
            // 0. `[writeable,signer]` Funding account (must be a system account)
            ctx.accounts.payer.clone(),
            // 1. `[writeable]` Associated token account address to be created
            ctx.accounts.device_associated_token.clone(),
            // 2. `[]` Wallet address for the new associated token account
            ctx.accounts.owner.clone(),
            // 3. `[]` The token mint for the new associated token account
            ctx.accounts.device_mint.clone(),
            // 4. `[]` System program
            ctx.accounts.system_program.clone(),
            // 5. `[]` SPL Token program
            ctx.accounts.token_2022_program.clone(),
        ],
    )?;

    // mint to user
    invoke_signed(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &device_mint_pubkey,
            &device_ata_pubkey,
            &device_mint_pubkey,
            &[&device_mint_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.device_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.device_associated_token.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.device_mint.clone(),
        ],
        &[device_mint_seeds],
    )?;

    // disable mint
    invoke_signed(
        &spl_token_2022::instruction::set_authority(
            &token_program_id,
            &device_mint_pubkey,
            None,
            spl_token_2022::instruction::AuthorityType::MintTokens,
            &device_mint_pubkey,
            &[&device_mint_pubkey],
        )?,
        &[
            // [writable] The mint or account to change the authority of.
            ctx.accounts.device_mint.clone(),
            // [signer] The current authority of the mint or account.
            ctx.accounts.device_mint.clone(),
        ],
        &[device_mint_seeds],
    )?;

    Ok(())
}
