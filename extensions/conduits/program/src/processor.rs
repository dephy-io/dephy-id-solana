use std::slice;

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
use spl_associated_token_account::{
    get_associated_token_address_with_program_id, instruction::create_associated_token_account,
};
use spl_token_2022::{
    extension::{metadata_pointer, BaseStateWithExtensions, ExtensionType, StateWithExtensions},
    onchain::invoke_transfer_checked,
    state::Mint,
};
use spl_token_metadata_interface::state::{Field, TokenMetadata};

use crate::assertions::{
    assert_empty, assert_pda, assert_program_owner, assert_same_pubkeys, assert_signer,
    assert_writable,
};
use crate::error::ConduitsError;
use crate::instruction::accounts::{
    CreateAccessIdentityAccounts, DelistDeviceAccounts, EndLeaseAccounts, InitAppAccounts,
    ListDeviceAccounts, PayRentAccounts, RentDeviceAccounts,
};
use crate::instruction::ConduitsInstruction;
use crate::state::{AccessIdentity, App, Key, ListingInfo, RentalInfo};
use crate::utils::{close_account, create_account};

const SECONDS_PER_DAY: u64 = 24 * 60 * 60;

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction: ConduitsInstruction = ConduitsInstruction::try_from_slice(instruction_data)?;
    match instruction {
        ConduitsInstruction::InitApp {
            name,
            symbol,
            uri,
            additional_metadata,
        } => {
            msg!("Instruction: InitApp");
            init_app(program_id, accounts, name, symbol, uri, additional_metadata)
        }
        ConduitsInstruction::CreateAccessIdentity => {
            msg!("Instruction: CreateAccessIdentity");
            create_access_identity(program_id, accounts)
        }
        ConduitsInstruction::ListDevice {
            min_rental_days,
            max_rental_days,
            rent_per_day,
        } => {
            msg!("Instruction: ListDevice");
            list_device(
                program_id,
                accounts,
                min_rental_days,
                max_rental_days,
                rent_per_day,
            )
        }
        ConduitsInstruction::DelistDevice => {
            msg!("Instruction: DelistDevice");
            delist_device(program_id, accounts)
        }
        ConduitsInstruction::RentDevice {
            rental_days,
            prepaid_rent,
        } => {
            msg!("Instruction: RentDevice");
            rent_device(program_id, accounts, rental_days, prepaid_rent)
        }
        ConduitsInstruction::PayRent { rent_amount } => {
            msg!("Instruction: PayRent");
            pay_rent(program_id, accounts, rent_amount)
        }
        ConduitsInstruction::EndLease => {
            msg!("Instruction: EndLease");
            end_lease(program_id, accounts)
        }
    }
}

fn init_app<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    name: String,
    symbol: String,
    uri: String,
    additional_metadata: Vec<(String, String)>,
) -> ProgramResult {
    // Accounts.
    let ctx = InitAppAccounts::context(accounts)?;
    let token_program_id = spl_token_2022::id();
    let authority = ctx.accounts.authority.key;
    let app_mint_pubkey = ctx.accounts.app_mint.key;

    // Guards.
    assert_same_pubkeys(
        "token_program",
        ctx.accounts.token_2022_program,
        &token_program_id,
    )?;

    assert_signer("authority", ctx.accounts.authority)?;
    assert_writable("app_account", ctx.accounts.app_account)?;
    assert_writable("app_mint", ctx.accounts.app_mint)?;

    let app_bump = assert_pda(
        "app_account",
        ctx.accounts.app_account,
        program_id,
        &App::seeds(),
    )?;

    let app_mint_bump = assert_pda(
        "app_mint",
        ctx.accounts.app_mint,
        program_id,
        &App::mint_seeds(),
    )?;

    // Create App SPL Token Mint.
    let base_size =
        ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MetadataPointer])?;

    let metadata = TokenMetadata {
        name: name.clone(),
        symbol,
        uri,
        additional_metadata,
        ..Default::default()
    };
    let metadata_size = metadata.tlv_size_of()?;

    // Create mint
    let app_mint_seeds = [App::MINT_SEEDS_PREFIX, &[app_mint_bump]];
    create_account(
        ctx.accounts.app_mint,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        base_size,
        metadata_size,
        &token_program_id,
        Some(&[&app_mint_seeds]),
    )?;

    // init metadata pointer
    invoke(
        &metadata_pointer::instruction::initialize(
            &token_program_id,
            &app_mint_pubkey,
            None,
            Some(*app_mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            ctx.accounts.app_mint.clone(),
        ],
    )?;

    invoke(
        &spl_token_2022::instruction::initialize_mint2(
            &token_program_id,
            &app_mint_pubkey,
            &app_mint_pubkey,
            None,
            0,
        )?,
        &[ctx.accounts.app_mint.clone()],
    )?;

    // Initialize metadata
    invoke_signed(
        &spl_token_metadata_interface::instruction::initialize(
            &token_program_id,
            &app_mint_pubkey,
            &app_mint_pubkey,
            &app_mint_pubkey,
            &app_mint_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            //  0. `[w]` Metadata
            ctx.accounts.app_mint.clone(),
            //  1. `[]` Update authority
            ctx.accounts.app_mint.clone(),
            //  2. `[]` Mint
            ctx.accounts.authority.clone(),
            //  3. `[s]` Mint authority
            ctx.accounts.app_mint.clone(),
        ],
        &[&app_mint_seeds],
    )?;

    for (field, value) in metadata.additional_metadata {
        invoke_signed(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program_id,
                &app_mint_pubkey,
                &app_mint_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                ctx.accounts.app_mint.clone(),
                // 1. `[s]` Update authority
                ctx.accounts.app_mint.clone(),
            ],
            &[&app_mint_seeds],
        )?;
    }

    // Create App account
    let app_seeds = [App::SEEDS_PREFIX, &[app_bump]];
    create_account(
        &ctx.accounts.app_account,
        &ctx.accounts.payer,
        &ctx.accounts.system_program,
        App::LEN,
        0,
        program_id,
        Some(&[&app_seeds]),
    )?;

    let app = App {
        key: Key::App,
        authority: *authority,
        mint: *app_mint_pubkey,
    };
    app.save(&ctx.accounts.app_account)?;

    Ok(())
}

fn create_access_identity<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
) -> ProgramResult {
    // Accounts.
    let ctx = CreateAccessIdentityAccounts::context(accounts)?;
    let device_pubkey = ctx.accounts.device.key;
    let device_owner_pubkey = ctx.accounts.device_owner.key;
    let token_program_id = ctx.accounts.token_2022_program.key;

    // Guards.
    assert_same_pubkeys(
        "token_program",
        ctx.accounts.token_2022_program,
        &spl_token_2022::id(),
    )?;
    assert_same_pubkeys(
        "ata_program",
        ctx.accounts.ata_program,
        &spl_associated_token_account::id(),
    )?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    assert_program_owner("app_mint", ctx.accounts.app_mint, token_program_id)?;

    let (app_mint_pubkey, _app_mint_bump) = App::find_pda(program_id);
    assert_same_pubkeys("app_mint", ctx.accounts.app_mint, &app_mint_pubkey)?;

    let mut access_mint_seeds = AccessIdentity::seeds(&device_pubkey);
    let access_mint_bump = assert_pda(
        "access_identity_mint",
        ctx.accounts.access_identity_mint,
        program_id,
        &access_mint_seeds,
    )?;
    access_mint_seeds.push(slice::from_ref(&access_mint_bump));
    let access_mint_pubkey = ctx.accounts.access_identity_mint.key;
    assert_empty("access_mint", ctx.accounts.access_identity_mint)?;

    let access_identity_atoken_pubkey = get_associated_token_address_with_program_id(
        device_owner_pubkey,
        access_mint_pubkey,
        token_program_id,
    );

    assert_same_pubkeys(
        "access_identity_atoken",
        ctx.accounts.access_identity_atoken,
        &access_identity_atoken_pubkey,
    )?;

    assert_empty(
        "access_identity_atoken",
        ctx.accounts.access_identity_atoken,
    )?;

    // create access identity mint
    mint_access_identity_token(
        ctx.accounts.app_mint,
        ctx.accounts.access_identity_mint,
        ctx.accounts.access_identity_atoken,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        ctx.accounts.device,
        ctx.accounts.device_owner,
        ctx.accounts.token_2022_program,
        access_mint_seeds,
    )?;

    Ok(())
}

fn list_device<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    min_rental_days: u64,
    max_rental_days: u64,
    rent_per_day: u64,
) -> ProgramResult {
    let ctx = ListDeviceAccounts::context(accounts)?;
    let device_pubkey = ctx.accounts.device.key;
    // let device_mint_pubkey = ctx.accounts.device_mint.key;
    // let device_atoken_pubkey = ctx.accounts.device_associated_token.key;
    // let token_program_id = ctx.accounts.token_2022_program.key;
    let rent_token_pubkey = ctx.accounts.rent_token_mint.key;
    let app_account_pubkey = ctx.accounts.app_account.key;

    // Guards
    assert_same_pubkeys(
        "token_program",
        ctx.accounts.token_2022_program,
        &spl_token_2022::id(),
    )?;
    assert_same_pubkeys(
        "ata_program",
        ctx.accounts.ata_program,
        &spl_associated_token_account::id(),
    )?;
    assert_same_pubkeys(
        "system_program",
        ctx.accounts.system_program,
        &system_program::id(),
    )?;

    // check if rent_token_mint is a spl token
    if *ctx.accounts.rent_token_mint.owner != spl_token_2022::id()
        && *ctx.accounts.rent_token_mint.owner != spl_token::id()
    {
        return Err(ConduitsError::InvalidProgramOwner.into());
    }

    // check if listing_info is already created
    let (listing_info_pubkey, listing_info_bump) = ListingInfo::find_pda(program_id, device_pubkey);
    assert_same_pubkeys(
        "listing_info",
        ctx.accounts.listing_info,
        &listing_info_pubkey,
    )?;
    assert_empty("listing_info", ctx.accounts.listing_info)?;

    if min_rental_days == 0 {
        return Err(ProgramError::InvalidArgument);
    }
    if max_rental_days < min_rental_days {
        return Err(ProgramError::InvalidArgument);
    }

    // Create ListingInfo
    let listing_info_seeds = [
        ListingInfo::SEEDS_PREFIX,
        device_pubkey.as_ref(),
        &[listing_info_bump],
    ];

    create_account(
        &ctx.accounts.listing_info,
        &ctx.accounts.payer,
        &ctx.accounts.system_program,
        ListingInfo::LEN,
        0,
        program_id,
        Some(&[&listing_info_seeds]),
    )?;

    let listing_info = ListingInfo {
        key: Key::ListingInfo,
        min_rental_days,
        max_rental_days,
        rent_per_day,
        app_account: *app_account_pubkey,
        device: *device_pubkey,
        rent_token_mint: *rent_token_pubkey,
        renting: false,
    };

    listing_info.save(&ctx.accounts.listing_info)?;

    Ok(())
}

fn delist_device<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    let ctx = DelistDeviceAccounts::context(accounts)?;
    let device_pubkey = ctx.accounts.device.key;
    let rent_token_program = ctx.accounts.rent_token_program.key;

    // Guards
    assert_signer("device_owner", ctx.accounts.device_owner)?;
    assert_writable("listing_info", ctx.accounts.listing_info)?;
    assert_program_owner("listing_info", ctx.accounts.listing_info, program_id)?;

    let mut listing_info_seeds = ListingInfo::seeds(device_pubkey);
    let listing_info_bump = assert_pda(
        "listing_info",
        ctx.accounts.listing_info,
        program_id,
        &listing_info_seeds,
    )?;

    let listing_info = ListingInfo::load(&ctx.accounts.listing_info)?;
    if listing_info.renting {
        return Err(ConduitsError::LeaseNotExpired.into());
    }
    assert_same_pubkeys(
        "app_account",
        ctx.accounts.app_account,
        &listing_info.app_account,
    )?;
    assert_same_pubkeys("device", ctx.accounts.device, &listing_info.device)?;

    // transfer escrowed rent tokens to device owner
    let rent_token_amount = {
        let rent_token_escrow_data = ctx.accounts.rent_token_escrow.data.borrow();
        let rent_token_escrow =
            StateWithExtensions::<spl_token_2022::state::Account>::unpack(&rent_token_escrow_data)?;
        rent_token_escrow.base.amount
    };

    ensure_atoken_account(
        ctx.accounts.rent_token_program,
        ctx.accounts.rent_token_mint,
        ctx.accounts.device_owner,
        ctx.accounts.rent_token_dst,
        ctx.accounts.payer,
        ctx.accounts.system_program,
    )?;

    listing_info_seeds.push(slice::from_ref(&listing_info_bump));
    transfer_tokens(
        &ctx.accounts.rent_token_program.clone(),
        &ctx.accounts.rent_token_escrow.clone(),
        &ctx.accounts.rent_token_mint.clone(),
        &ctx.accounts.rent_token_dst.clone(),
        &ctx.accounts.listing_info.clone(),
        rent_token_amount,
        &listing_info_seeds,
    )?;

    close_token_account(
        rent_token_program,
        &ctx.accounts.rent_token_escrow.clone(),
        &ctx.accounts.device_owner.clone(),
        &ctx.accounts.listing_info.clone(),
        &listing_info_seeds,
    )?;

    // Close the ListingInfo account
    close_account(&ctx.accounts.listing_info, &ctx.accounts.device_owner)?;

    Ok(())
}

fn rent_device<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    rental_days: u64,
    prepaid_rent: u64,
) -> ProgramResult {
    let ctx = RentDeviceAccounts::context(accounts)?;
    let device_pubkey = ctx.accounts.device.key;
    let rent_token_program = ctx.accounts.rent_token_program.key;
    let tenant_pubkey = ctx.accounts.tenant.key;
    let token_program_id = ctx.accounts.token_2022_program.key;

    // Guards
    assert_same_pubkeys(
        "token_program",
        ctx.accounts.token_2022_program,
        &spl_token_2022::id(),
    )?;

    assert_pda(
        "app_account",
        ctx.accounts.app_account,
        program_id,
        &App::seeds(),
    )?;
    assert_pda(
        "app_mint",
        ctx.accounts.app_mint,
        program_id,
        &App::mint_seeds(),
    )?;
    let app_account = App::load(&ctx.accounts.app_account)?;
    assert_same_pubkeys("app_mint", ctx.accounts.app_mint, &app_account.mint)?;
    assert_program_owner("app_mint", ctx.accounts.app_mint, token_program_id)?;

    if ctx.accounts.rent_token_mint.owner != rent_token_program {
        return Err(ConduitsError::InvalidProgramOwner.into());
    }

    let (listing_info_pubkey, _) = ListingInfo::find_pda(program_id, device_pubkey);
    assert_same_pubkeys(
        "listing_info",
        ctx.accounts.listing_info,
        &listing_info_pubkey,
    )?;
    let mut listing_info = ListingInfo::load(&ctx.accounts.listing_info)?;
    if listing_info.renting {
        return Err(ConduitsError::LeaseNotExpired.into());
    }
    assert_same_pubkeys("device", ctx.accounts.device, &listing_info.device)?;

    let mut access_mint_seeds = AccessIdentity::seeds(&device_pubkey);
    let access_mint_bump = assert_pda(
        "access_identity_mint",
        ctx.accounts.access_identity_mint,
        program_id,
        &access_mint_seeds,
    )?;
    let access_identity_mint_pubkey = ctx.accounts.access_identity_mint.key;

    let access_identity_atoken_pubkey = get_associated_token_address_with_program_id(
        &tenant_pubkey,
        &access_identity_mint_pubkey,
        &spl_token_2022::id(),
    );
    assert_same_pubkeys(
        "access_identity_atoken",
        ctx.accounts.access_identity_atoken,
        &access_identity_atoken_pubkey,
    )?;

    let (rental_info_pubkey, rental_info_bump) = RentalInfo::find_pda(&listing_info_pubkey);
    assert_same_pubkeys("rental_info", ctx.accounts.rental_info, &rental_info_pubkey)?;
    assert_empty("rental_info", ctx.accounts.rental_info)?;

    assert_same_pubkeys(
        "rent_token_mint",
        ctx.accounts.rent_token_mint,
        &listing_info.rent_token_mint,
    )?;
    assert_program_owner(
        "rent_token_mint",
        ctx.accounts.rent_token_mint,
        &rent_token_program,
    )?;

    if rental_days == 0
        || rental_days < listing_info.min_rental_days
        || rental_days > listing_info.max_rental_days
    {
        return Err(ProgramError::InvalidArgument);
    }

    if prepaid_rent < listing_info.rent_per_day * listing_info.min_rental_days {
        return Err(ConduitsError::InsufficientRent.into());
    }

    // prepay rent
    transfer_tokens(
        ctx.accounts.rent_token_program,
        ctx.accounts.rent_token_src,
        ctx.accounts.rent_token_mint,
        ctx.accounts.rent_token_escrow,
        ctx.accounts.tenant,
        prepaid_rent,
        &[],
    )?;

    // Mint access identity token for tenant
    access_mint_seeds.push(slice::from_ref(&access_mint_bump));

    mint_access_identity_token(
        ctx.accounts.app_mint,
        ctx.accounts.access_identity_mint,
        ctx.accounts.access_identity_atoken,
        ctx.accounts.payer,
        ctx.accounts.system_program,
        ctx.accounts.device,
        ctx.accounts.tenant,
        ctx.accounts.token_2022_program,
        access_mint_seeds,
    )?;

    // Create RentalInfo
    let rental_info_seeds = [
        RentalInfo::SEEDS_PREFIX,
        listing_info_pubkey.as_ref(),
        &[rental_info_bump],
    ];
    create_account(
        &ctx.accounts.rental_info,
        &ctx.accounts.payer,
        &ctx.accounts.system_program,
        RentalInfo::LEN,
        0,
        program_id,
        Some(&[&rental_info_seeds]),
    )?;

    let start_time = Clock::get()?.unix_timestamp as u64;
    let end_time = start_time + (rental_days * SECONDS_PER_DAY);
    let rental_info = RentalInfo {
        key: Key::RentalInfo,
        listing_info: listing_info_pubkey,
        tenant: *tenant_pubkey,
        start_time,
        end_time,
        rental_days,
        total_paid_rent: prepaid_rent,
    };
    rental_info.save(ctx.accounts.rental_info)?;

    listing_info.renting = true;
    listing_info.save(ctx.accounts.listing_info)?;

    Ok(())
}

fn mint_access_identity_token<'a>(
    app_mint_account: &AccountInfo<'a>,
    access_identity_mint_account: &AccountInfo<'a>,
    access_identity_atoken_account: &AccountInfo<'a>,
    payer_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    device_account: &AccountInfo<'a>,
    owner_account: &AccountInfo<'a>,
    token_program_account: &AccountInfo<'a>,
    access_mint_seeds: Vec<&[u8]>,
) -> Result<(), ProgramError> {
    let app_mint_data = app_mint_account.data.borrow();
    let app_mint = StateWithExtensions::<Mint>::unpack(&app_mint_data)?;
    let token_program_id = token_program_account.key;
    let access_identity_mint_pubkey = access_identity_mint_account.key;
    let device_pubkey = device_account.key;

    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::MetadataPointer,
        ExtensionType::PermanentDelegate,
        ExtensionType::MintCloseAuthority,
    ])?;
    let mut metadata = app_mint.get_variable_len_extension::<TokenMetadata>()?;
    metadata
        .additional_metadata
        .push(("Device".to_string(), device_pubkey.to_string()));
    let metadata_size = metadata.tlv_size_of()?;
    create_account(
        access_identity_mint_account,
        payer_account,
        system_program_account,
        base_size,
        metadata_size,
        token_program_id,
        Some(&[&access_mint_seeds]),
    )?;
    invoke(
        &spl_token_2022::instruction::initialize_mint_close_authority(
            token_program_id,
            access_identity_mint_pubkey,
            Some(access_identity_mint_pubkey),
        )?,
        &[access_identity_mint_account.clone()],
    )?;
    invoke(
        &spl_token_2022::instruction::initialize_permanent_delegate(
            token_program_id,
            access_identity_mint_pubkey,
            access_identity_mint_pubkey,
        )?,
        &[access_identity_mint_account.clone()],
    )?;
    invoke(
        &metadata_pointer::instruction::initialize(
            token_program_id,
            access_identity_mint_pubkey,
            None,
            Some(*access_identity_mint_pubkey),
        )?,
        &[
            // 0. `[writable]` The mint to initialize.
            access_identity_mint_account.clone(),
        ],
    )?;
    invoke(
        &spl_token_2022::instruction::initialize_mint2(
            token_program_id,
            access_identity_mint_pubkey,
            access_identity_mint_pubkey,
            None,
            0,
        )?,
        &[access_identity_mint_account.clone()],
    )?;
    invoke_signed(
        &spl_token_metadata_interface::instruction::initialize(
            token_program_id,
            access_identity_mint_pubkey,
            access_identity_mint_pubkey,
            access_identity_mint_pubkey,
            access_identity_mint_pubkey,
            metadata.name,
            metadata.symbol,
            metadata.uri,
        ),
        &[
            //  0. `[w]` Metadata
            access_identity_mint_account.clone(),
            //  1. `[]` Update authority
            access_identity_mint_account.clone(),
            //  2. `[]` Mint
            access_identity_mint_account.clone(),
            //  3. `[s]` Mint authority
            access_identity_mint_account.clone(),
        ],
        &[&access_mint_seeds],
    )?;
    for (field, value) in metadata.additional_metadata {
        invoke_signed(
            &spl_token_metadata_interface::instruction::update_field(
                token_program_id,
                access_identity_mint_pubkey,
                access_identity_mint_pubkey,
                Field::Key(field),
                value,
            ),
            &[
                // 0. `[w]` Metadata account
                access_identity_mint_account.clone(),
                // 1. `[s]` Update authority
                access_identity_mint_account.clone(),
            ],
            &[&access_mint_seeds],
        )?;
    }
    invoke(
        &create_associated_token_account(
            payer_account.key,
            owner_account.key,
            access_identity_mint_account.key,
            token_program_id,
        ),
        &[
            // 0. `[writable,signer]` Funding account (must be a system account)
            payer_account.clone(),
            // 1. `[writable]` Associated token account address to be created
            access_identity_atoken_account.clone(),
            // 2. `[]` Wallet address for the new associated token account
            owner_account.clone(),
            // 3. `[]` The token mint for the new associated token account
            access_identity_mint_account.clone(),
            // 4. `[]` System program
            system_program_account.clone(),
            // 5. `[]` SPL Token program
            token_program_account.clone(),
        ],
    )?;
    invoke_signed(
        &spl_token_2022::instruction::mint_to(
            token_program_account.key,
            access_identity_mint_account.key,
            access_identity_atoken_account.key,
            access_identity_mint_account.key,
            &[access_identity_mint_account.key],
            1,
        )?,
        &[
            // [writable] The mint.
            access_identity_mint_account.clone(),
            // [writable] The account to mint tokens to.
            access_identity_atoken_account.clone(),
            // [signer] The mint's minting authority.
            access_identity_mint_account.clone(),
        ],
        &[&access_mint_seeds],
    )?;
    Ok(())
}

fn pay_rent<'a>(
    _program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    rent_amount: u64,
) -> ProgramResult {
    let ctx = PayRentAccounts::context(accounts)?;

    // Guards
    let listing_info = ListingInfo::load(&ctx.accounts.listing_info)?;
    let mut rental_info = RentalInfo::load(&ctx.accounts.rental_info)?;

    assert_same_pubkeys(
        "rent_token_mint",
        ctx.accounts.rent_token_mint,
        &listing_info.rent_token_mint,
    )?;
    assert_same_pubkeys(
        "rent_token_program",
        ctx.accounts.rent_token_program,
        ctx.accounts.rent_token_mint.owner,
    )?;

    if rent_amount == 0 {
        return Err(ConduitsError::InvalidRentAmount.into());
    }

    if rental_info.total_paid_rent + rent_amount
        > rental_info.rental_days * listing_info.rent_per_day
    {
        return Err(ConduitsError::InvalidRentAmount.into());
    }

    transfer_tokens(
        ctx.accounts.rent_token_program,
        ctx.accounts.rent_token_src,
        ctx.accounts.rent_token_mint,
        ctx.accounts.rent_token_escrow,
        ctx.accounts.tenant,
        rent_amount,
        &[],
    )?;

    rental_info.total_paid_rent += rent_amount;
    rental_info.save(&ctx.accounts.rental_info)?;

    Ok(())
}

fn end_lease<'a>(program_id: &Pubkey, accounts: &'a [AccountInfo<'a>]) -> ProgramResult {
    let ctx = EndLeaseAccounts::context(accounts)?;
    let token_program_id = ctx.accounts.token_2022_program.key;
    let access_mint_pubkey = ctx.accounts.access_identity_mint.key;
    let access_atoken_pubkey = ctx.accounts.access_identity_atoken.key;

    // Guards
    let rental_info = RentalInfo::load(&ctx.accounts.rental_info)?;
    let mut listing_info = ListingInfo::load(&ctx.accounts.listing_info)?;

    assert_same_pubkeys("tenant", ctx.accounts.tenant, &rental_info.tenant)?;

    let now = Clock::get()?.unix_timestamp as u64;
    let days_passed = (now - rental_info.start_time) / SECONDS_PER_DAY;
    let rent_needed = listing_info.rent_per_day * days_passed;
    if rental_info.total_paid_rent >= rent_needed && rental_info.end_time > now {
        return Err(ConduitsError::LeaseNotExpired.into());
    }

    // burn access identity token
    let mut access_mint_seeds = AccessIdentity::seeds(&listing_info.device);
    let access_mint_bump = assert_pda(
        "access_identity_mint",
        ctx.accounts.access_identity_mint,
        program_id,
        &access_mint_seeds,
    )?;
    access_mint_seeds.push(slice::from_ref(&access_mint_bump));

    invoke_signed(
        &spl_token_2022::instruction::burn(
            token_program_id,
            access_atoken_pubkey,
            access_mint_pubkey,
            access_mint_pubkey,
            &[access_mint_pubkey],
            1,
        )?,
        &[
            //   0. `[writable]` The account to burn from.
            ctx.accounts.access_identity_atoken.clone(),
            //   1. `[writable]` The token mint.
            ctx.accounts.access_identity_mint.clone(),
            //   2. `[signer]` The account's owner/delegate.
            ctx.accounts.access_identity_mint.clone(),
        ],
        &[&access_mint_seeds],
    )?;

    // close access identity mint
    close_token_account(
        token_program_id,
        ctx.accounts.access_identity_mint,
        ctx.accounts.tenant,
        ctx.accounts.access_identity_mint,
        &access_mint_seeds,
    )?;

    close_account(ctx.accounts.rental_info, ctx.accounts.tenant)?;

    listing_info.renting = false;
    listing_info.save(ctx.accounts.listing_info)?;

    Ok(())
}

fn ensure_atoken_account<'a>(
    token_program: &AccountInfo<'a>,
    token_mint: &AccountInfo<'a>,
    owner: &AccountInfo<'a>,
    token_account: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
) -> ProgramResult {
    invoke(
        &create_associated_token_account(payer.key, owner.key, token_mint.key, token_program.key),
        &[
            // 0. `[writable,signer]` Funding account (must be a system account)
            payer.clone(),
            // 1. `[writable]` Associated token account address to be created
            token_account.clone(),
            // 2. `[]` Wallet address for the new associated token account
            owner.clone(),
            // 3. `[]` The token mint for the new associated token account
            token_mint.clone(),
            // 4. `[]` System program
            system_program.clone(),
            // 5. `[]` SPL Token program
            token_program.clone(),
        ],
    )
}

fn transfer_tokens<'a>(
    token_program: &AccountInfo<'a>,
    token_src: &AccountInfo<'a>,
    token_mint: &AccountInfo<'a>,
    token_dst: &AccountInfo<'a>,
    authority: &AccountInfo<'a>,
    amount: u64,
    seeds: &[&[u8]],
) -> ProgramResult {
    match *token_program.key {
        spl_token_2022::ID => {
            invoke_transfer_checked(
                &token_program.key,
                token_src.clone(),
                token_mint.clone(),
                token_dst.clone(),
                authority.clone(),
                &[],
                amount,
                0,
                &[seeds],
            )?;
        }
        spl_token::ID => {
            let ix = &spl_token::instruction::transfer(
                token_program.key,
                token_src.key,
                token_dst.key,
                authority.key,
                &[authority.key],
                amount,
            )?;
            let accounts = [
                //   0. `[writable]` The source account.
                token_src.clone(),
                //   1. `[writable]` The destination account.
                token_dst.clone(),
                //   2. `[signer]` The source account's owner/delegate.
                authority.clone(),
            ];

            if seeds.len() > 0 {
                invoke_signed(ix, &accounts, &[seeds])?;
            } else {
                invoke(ix, &accounts)?;
            }
        }
        _ => {
            return Err(ConduitsError::InvalidTokenProgram.into());
        }
    }

    Ok(())
}

fn close_token_account<'a>(
    token_program: &Pubkey,
    account_pubkey: &AccountInfo<'a>,
    destination_pubkey: &AccountInfo<'a>,
    owner_pubkey: &AccountInfo<'a>,
    seeds: &[&[u8]],
) -> ProgramResult {
    let ix = match *token_program {
        spl_token_2022::ID => spl_token_2022::instruction::close_account(
            token_program,
            account_pubkey.key,
            destination_pubkey.key,
            owner_pubkey.key,
            &[owner_pubkey.key],
        ),
        spl_token::ID => spl_token::instruction::close_account(
            token_program,
            account_pubkey.key,
            destination_pubkey.key,
            owner_pubkey.key,
            &[owner_pubkey.key],
        ),
        _ => Err(ConduitsError::InvalidTokenProgram.into()),
    }?;

    let accounts = [
        account_pubkey.clone(),
        destination_pubkey.clone(),
        owner_pubkey.clone(),
    ];

    if seeds.len() > 0 {
        invoke_signed(&ix, &accounts, &[seeds])
    } else {
        invoke(&ix, &accounts)
    }
}
