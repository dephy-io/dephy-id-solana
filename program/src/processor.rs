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
    sysvar::Sysvar,
};
use spl_associated_token_account::get_associated_token_address_with_program_id;
use spl_token_2022::{
    extension::{metadata_pointer, BaseStateWithExtensions, ExtensionType, StateWithExtensions},
    state::{Account, Mint},
};
use spl_token_metadata_interface::state::{Field, TokenMetadata};

use crate::{
    assertions::{assert_pda, assert_same_pubkeys, assert_signer},
    instruction::{
        accounts::{
            ActivateDeviceAccounts, CreateDeviceAccounts, CreateProductAccounts, InitializeAccounts,
        },
        ActivateDeviceArgs, CreateDeviceArgs, CreateProductArgs, InitializeArgs, Instruction,
    },
    state::{Key, ProgramData, ProgramDataAccount},
    utils::create_account,
    DEVICE_MESSAGE_PREFIX, DEVICE_MINT_SEED_PREFIX, PRODUCT_MINT_SEED_PREFIX,
    PROGRAM_PDA_SEED_PREFIX,
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
        ctx.accounts.program_data,
        &program_pda_pubkey,
    )?;

    let seeds: &[&[u8]] = &[PROGRAM_PDA_SEED_PREFIX, &[args.bump]];
    assert_pda("program_pda", ctx.accounts.program_data, program_id, seeds)?;
    assert_signer("authority", ctx.accounts.authority)?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    // CPIs
    // Create PDA
    create_account(
        ctx.accounts.program_data,
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

    program_pda.save(ctx.accounts.program_data)
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
    if args.name.len() == 0 {
        msg!("Name should not be empty");
        return Err(ProgramError::InvalidArgument);
    };

    let (product_mint_pubkey, product_mint_bump) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            args.name.as_ref(),
        ],
        program_id,
    );
    let product_mint_seeds: &[&[u8]] = &[
        PRODUCT_MINT_SEED_PREFIX,
        vendor_pubkey.as_ref(),
        args.name.as_ref(),
        &[product_mint_bump],
    ];
    assert_same_pubkeys(
        "product_mint",
        ctx.accounts.product_mint,
        &product_mint_pubkey,
    )?;

    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::NonTransferable,
        ExtensionType::MetadataPointer,
        ExtensionType::PermanentDelegate,
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

    // init Permanent Delegate
    invoke(
        &spl_token_2022::instruction::initialize_permanent_delegate(
            &token_program_id,
            &product_mint_pubkey,
            &product_mint_pubkey,
        )?,
        &[
            // 0. `[writable]` The mint account to initialize.
            ctx.accounts.product_mint.clone(),
        ],
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
            None,
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
            &product_mint_pubkey,
            None,
            0,
        )?,
        &[ctx.accounts.product_mint.clone()],
    )?;

    // Initialize metadata
    invoke_signed(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &product_mint_pubkey,
            &product_mint_pubkey,
            &product_mint_pubkey,
            &product_mint_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            //  0. `[w]` Metadata
            ctx.accounts.product_mint.clone(),
            //  1. `[]` Update authority
            ctx.accounts.product_mint.clone(),
            //  2. `[]` Mint
            ctx.accounts.vendor.clone(),
            //  3. `[s]` Mint authority
            ctx.accounts.product_mint.clone(),
        ],
        &[product_mint_seeds],
    )?;

    for (field, value) in metadata.additional_metadata {
        invoke_signed(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program_id,
                &product_mint_pubkey,
                &product_mint_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                ctx.accounts.product_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.product_mint.clone(),
            ],
            &[product_mint_seeds],
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
    let device_pubkey = ctx.accounts.device.key;

    // Pre-check
    // TODO: Check args.name not blank and length

    // Guards
    assert_same_pubkeys(
        "token_2022_program",
        ctx.accounts.token_2022_program,
        &token_program_id,
    )?;

    let product_metadata = {
        let product_mint_data = ctx.accounts.product_mint.data.borrow();
        let product_mint_state = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
        assert_eq!(product_mint_state.base.decimals, 0);

        product_mint_state.get_variable_len_extension::<TokenMetadata>()?
    };

    let (product_mint_pubkey, product_mint_bump) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            product_metadata.name.as_ref(),
        ],
        program_id,
    );

    assert_same_pubkeys(
        "product_mint",
        ctx.accounts.product_mint,
        &product_mint_pubkey,
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
    let product_mint_seeds: &[&[u8]] = &[
        PRODUCT_MINT_SEED_PREFIX,
        vendor_pubkey.as_ref(),
        product_metadata.name.as_ref(),
        &[product_mint_bump],
    ];

    invoke_signed(
        &spl_token_2022::instruction::mint_to(
            &token_program_id,
            &product_mint_pubkey,
            &product_ata_pubkey,
            &product_mint_pubkey,
            &[&product_mint_pubkey],
            1,
        )?,
        &[
            // [writable] The mint.
            ctx.accounts.product_mint.clone(),
            // [writable] The account to mint tokens to.
            ctx.accounts.product_associated_token.clone(),
            // [signer] The mint's minting authority.
            ctx.accounts.product_mint.clone(),
        ],
        &[product_mint_seeds],
    )?;

    // Create the Device token
    let (device_mint_pubkey, device_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
        program_id,
    );
    assert_same_pubkeys("device_mint", ctx.accounts.device_mint, &device_mint_pubkey)?;
    let device_mint_seeds: &[&[u8]] = &[
        DEVICE_MINT_SEED_PREFIX,
        product_mint_pubkey.as_ref(),
        device_pubkey.as_ref(),
        &[device_mint_bump],
    ];

    // calc account size
    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::NonTransferable,
        ExtensionType::MetadataPointer,
        ExtensionType::MintCloseAuthority,
    ])?;

    let metadata = TokenMetadata {
        name: args.name,
        symbol: product_metadata.symbol,
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

    // init Mint Close Authroity
    invoke(
        &spl_token_2022::instruction::initialize_mint_close_authority(
            &token_program_id,
            &device_mint_pubkey,
            Some(&device_mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint account to initialize.
            ctx.accounts.device_mint.clone(),
        ],
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
            None,
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
            None,
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
    let product_mint_pubkey = ctx.accounts.product_mint.key;
    let device_pubkey = ctx.accounts.device.key;
    let device_mint_pubkey = ctx.accounts.device_mint.key;
    let owner_pubkey = ctx.accounts.owner.key;

    // Guards
    assert_signer("owner", ctx.accounts.owner)?;

    let message = [
        DEVICE_MESSAGE_PREFIX,
        device_mint_pubkey.as_ref(),
        owner_pubkey.as_ref(),
        &args.message_slot.to_le_bytes(),
    ]
    .concat();

    args.signature.verify(device_pubkey, &message)?;
    let clock = Clock::get()?;
    assert!(clock.slot >= args.message_slot);
    assert!(clock.slot < args.message_slot + 1500); // ~10min

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

    {
        let device_account_data = ctx.accounts.product_associated_token.data.borrow();
        let product_device_account = StateWithExtensions::<Account>::unpack(&device_account_data)?;
        assert_same_pubkeys(
            "device_owner",
            ctx.accounts.device,
            &product_device_account.base.owner,
        )?;
        assert_same_pubkeys(
            "product_mint",
            ctx.accounts.product_mint,
            &product_device_account.base.mint,
        )?;
        assert_eq!(product_device_account.base.amount, 1);
    }

    let product_mint_data = ctx.accounts.product_mint.data.borrow();
    let product_mint = StateWithExtensions::<Mint>::unpack(&product_mint_data)?;
    let _product_mint_metadata = product_mint.get_variable_len_extension::<TokenMetadata>()?;

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
    let (device_mint_pubkey, device_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
        program_id,
    );
    assert_same_pubkeys("device_mint", ctx.accounts.device_mint, &device_mint_pubkey)?;
    let device_mint_seeds: &[&[u8]] = &[
        DEVICE_MINT_SEED_PREFIX,
        product_mint_pubkey.as_ref(),
        device_pubkey.as_ref(),
        &[device_mint_bump],
    ];

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
