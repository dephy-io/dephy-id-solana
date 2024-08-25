use borsh::{BorshDeserialize, BorshSerialize};
use dephy_io_conduits::state::{AccessIdentity, App, ListingInfo, RentalInfo};
use solana_program::pubkey::Pubkey;
use solana_program_test::*;
use solana_sdk::{
    account::Account as SolanaAccount,
    clock::Clock,
    instruction::{AccountMeta, Instruction as SolanaInstruction},
    rent::Rent,
    signature::Keypair,
    signer::Signer,
    system_program,
    transaction::Transaction,
};
use spl_associated_token_account::get_associated_token_address_with_program_id;
use spl_token_2022::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::Mint,
};
use spl_token_metadata_interface::state::TokenMetadata;
use std::str::FromStr;

fn spl_token_program_id() -> Pubkey {
    Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap()
}

pub fn add_account<T: BorshSerialize>(
    program_test: &mut ProgramTest,
    address: Pubkey,
    owner: Pubkey,
    account: T,
) {
    let data = borsh::to_vec(&account).unwrap();
    program_test.add_account(
        address,
        SolanaAccount {
            lamports: Rent::default().minimum_balance(data.len()),
            data,
            owner,
            executable: false,
            rent_epoch: 0,
        },
    );
}

fn init_user_account(program_test: &mut ProgramTest, address: Pubkey, lamports: u64) {
    program_test.add_account(
        address,
        SolanaAccount {
            lamports,
            data: vec![],
            executable: false,
            rent_epoch: 0,
            owner: system_program::id(),
        },
    );
}

async fn get_account_owner(ctx: &mut ProgramTestContext, account: &Pubkey) -> Pubkey {
    let account = ctx
        .banks_client
        .get_account(*account)
        .await
        .unwrap()
        .unwrap();
    account.owner
}

async fn get_listing_info(
    ctx: &mut ProgramTestContext,
    listing_info_pubkey: &Pubkey,
) -> ListingInfo {
    let listing_info_account = ctx
        .banks_client
        .get_account(*listing_info_pubkey)
        .await
        .unwrap()
        .unwrap();
    ListingInfo::deserialize(&mut listing_info_account.data.as_ref()).unwrap()
}

async fn get_rental_info(ctx: &mut ProgramTestContext, rental_info_pubkey: &Pubkey) -> RentalInfo {
    let rental_info_account = ctx
        .banks_client
        .get_account(*rental_info_pubkey)
        .await
        .unwrap()
        .unwrap();
    RentalInfo::deserialize(&mut rental_info_account.data.as_ref()).unwrap()
}

async fn time_travel(ctx: &mut ProgramTestContext, seconds: i64) {
    let mut clock = ctx.banks_client.get_sysvar::<Clock>().await.unwrap();
    clock.epoch += 1;
    clock.unix_timestamp += seconds;
    clock.epoch_start_timestamp = clock.unix_timestamp - (clock.unix_timestamp % 86400);
    ctx.set_sysvar(&clock);
}

#[tokio::test]
async fn test_all() {
    let program_id = dephy_io_conduits::id();
    let mut program_test = ProgramTest::new("dephy_io_conduits", program_id, None);

    let tenant = Keypair::new();
    let device_mint_pubkey = Pubkey::new_unique();
    let device_atoken_pubkey = get_associated_token_address_with_program_id(
        &tenant.pubkey(),
        &device_mint_pubkey,
        &spl_token_2022::id(),
    );
    init_user_account(&mut program_test, tenant.pubkey(), 1000000000000000000);

    let rent_token_mint_pubkey = spl_token::native_mint::id();

    let mut ctx = program_test.start_with_context().await;

    let app_authority = Keypair::new();

    let (app_pubkey, _app_bump) = App::find_pda(&program_id);

    test_init_app(&mut ctx, program_id, &app_pubkey, &app_authority).await;

    let device = Keypair::new();
    let device_owner = Keypair::new();
    let (listing_info_pubkey, _) = ListingInfo::find_pda(&program_id, &device.pubkey());
    let rent_token_escrow_pubkey = get_associated_token_address_with_program_id(
        &listing_info_pubkey,
        &rent_token_mint_pubkey,
        &spl_token_program_id(),
    );

    let min_rental_days = 1;
    let max_rental_days = 10;
    let rent_per_day = 1000;
    test_list_device(
        &mut ctx,
        program_id,
        &app_pubkey,
        &device,
        &device_owner,
        &device_mint_pubkey,
        &device_atoken_pubkey,
        &rent_token_mint_pubkey,
        &listing_info_pubkey,
        &rent_token_escrow_pubkey,
        min_rental_days,
        max_rental_days,
        rent_per_day,
    )
    .await;

    let rental_days = 3;
    test_rent_device(
        &mut ctx,
        program_id,
        &app_pubkey,
        &device,
        &rent_token_mint_pubkey,
        &listing_info_pubkey,
        &tenant,
        rental_days,
        rent_per_day * min_rental_days,
    )
    .await;

    test_pay_rent(
        &mut ctx,
        program_id,
        &rent_token_mint_pubkey,
        &listing_info_pubkey,
        &tenant,
        rent_per_day * (rental_days - min_rental_days),
    )
    .await;

    time_travel(&mut ctx, 3_000_000).await;

    test_end_lease(
        &mut ctx,
        program_id,
        &device,
        &listing_info_pubkey,
        &tenant,
    )
    .await;

    test_delist(
        &mut ctx,
        program_id,
        &app_pubkey,
        &device,
        &device_owner,
        &rent_token_mint_pubkey,
        &listing_info_pubkey,
    ).await;
}


async fn test_init_app(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    app_pubkey: &Pubkey,
    app_authority: &Keypair,
) {
    let (app_mint_pubkey, _) = App::find_mint_pda(&program_id);

    let name = "Test App".to_string();
    let symbol = "TEST".to_string();
    let uri = "https://example.com/test".to_string();
    let additional_metadata = vec![("description".to_string(), "A test app".to_string())];

    let init_app_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &dephy_io_conduits::instruction::ConduitsInstruction::InitApp {
            name: name.clone(),
            symbol: symbol.clone(),
            uri: uri.clone(),
            additional_metadata: additional_metadata.clone(),
        },
        vec![
            AccountMeta::new(*app_pubkey, false),
            AccountMeta::new(app_mint_pubkey, false),
            AccountMeta::new_readonly(app_authority.pubkey(), true),
            AccountMeta::new(ctx.payer.pubkey(), true),
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[init_app_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer, app_authority],
        recent_blockhash,
    );

    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Verify the App account
    let app_account = ctx
        .banks_client
        .get_account(*app_pubkey)
        .await
        .unwrap()
        .unwrap();
    let app = App::deserialize(&mut app_account.data.as_ref()).unwrap();
    assert_eq!(app.authority, app_authority.pubkey());
    assert_eq!(app.mint, app_mint_pubkey);

    // Verify the App Mint account
    let app_mint_account = ctx
        .banks_client
        .get_account(app_mint_pubkey)
        .await
        .unwrap()
        .unwrap();
    let app_mint = StateWithExtensions::<Mint>::unpack(&app_mint_account.data).unwrap();

    // Verify mint authority
    assert_eq!(app_mint.base.mint_authority.unwrap(), app_mint_pubkey);

    // check metadata
    let metadata = app_mint
        .get_variable_len_extension::<TokenMetadata>()
        .unwrap();
    assert_eq!(metadata.name, name);
    assert_eq!(metadata.symbol, symbol);
    assert_eq!(metadata.uri, uri);

    assert_eq!(metadata.additional_metadata, additional_metadata);
}

async fn test_list_device(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    app_pubkey: &Pubkey,
    device: &Keypair,
    device_owner: &Keypair,
    device_mint_pubkey: &Pubkey,
    device_atoken_pubkey: &Pubkey,
    rent_token_mint_pubkey: &Pubkey,
    listing_info_pubkey: &Pubkey,
    rent_token_escrow_pubkey: &Pubkey,
    min_rental_days: u64,
    max_rental_days: u64,
    rent_per_day: u64,
) {
    // Create the ListDevice instruction
    let list_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &dephy_io_conduits::instruction::ConduitsInstruction::ListDevice {
            min_rental_days,
            max_rental_days,
            rent_per_day,
        },
        vec![
            // #[account(0, writable, name="listing_info", desc = "The PDA of the listing info account to create")]
            AccountMeta::new(*listing_info_pubkey, false),
            // #[account(1, name="app_account", desc = "The app account")]
            AccountMeta::new_readonly(*app_pubkey, false),
            // #[account(2, name="device", desc = "The device account")]
            AccountMeta::new_readonly(device.pubkey(), false),
            // #[account(3, signer, name="authority", desc = "The device authority")]
            AccountMeta::new_readonly(device_owner.pubkey(), true),
            // #[account(4, name="device_mint", desc="The mint account for the device")]
            AccountMeta::new_readonly(*device_mint_pubkey, false),
            // #[account(5, name="device_associated_token", desc = "DID associated token owned by authority")]
            AccountMeta::new_readonly(*device_atoken_pubkey, false),
            // #[account(6, name="rent_token_mint", desc = "The token mint used for rent payments")]
            AccountMeta::new_readonly(*rent_token_mint_pubkey, false),
            // #[account(7, name="rent_token_program", desc="The token program for rent token")]
            AccountMeta::new_readonly(spl_token_program_id(), false),
            // #[account(8, name="rent_token_escrow", desc="The destination account for rent token")]
            AccountMeta::new_readonly(*rent_token_escrow_pubkey, false),
            // #[account(9, writable, signer, name="payer", desc = "The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(10, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(11, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
            // #[account(12, name="system_program", desc = "The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
        ],
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[list_device_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer, device_owner],
        recent_blockhash,
    );

    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Verify the ListingInfo account
    let listing_info = get_listing_info(ctx, listing_info_pubkey).await;

    assert_eq!(listing_info.min_rental_days, min_rental_days);
    assert_eq!(listing_info.max_rental_days, max_rental_days);
    assert_eq!(listing_info.rent_per_day, rent_per_day);
    assert_eq!(listing_info.app_account, *app_pubkey);
    assert_eq!(listing_info.device, device.pubkey());
    assert_eq!(listing_info.rent_token_mint, *rent_token_mint_pubkey);
}

async fn test_rent_device(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    app_pubkey: &Pubkey,
    device: &Keypair,
    rent_token_mint_pubkey: &Pubkey,
    listing_info_pubkey: &Pubkey,
    tenant: &Keypair,
    rental_days: u64,
    prepaid_rent: u64,
) {
    let (app_mint_pubkey, _) = App::find_mint_pda(&program_id);
    let (rental_info_pubkey, _) = RentalInfo::find_pda(&listing_info_pubkey);

    let (access_mint_pubkey, _) = AccessIdentity::find_pda(&program_id, &device.pubkey());
    let access_atoken_pubkey = get_associated_token_address_with_program_id(
        &tenant.pubkey(),
        &access_mint_pubkey,
        &spl_token_2022::id(),
    );

    let rent_token_program_id = get_account_owner(ctx, rent_token_mint_pubkey).await;

    let rent_token_escrow_pubkey = get_associated_token_address_with_program_id(
        &listing_info_pubkey,
        rent_token_mint_pubkey,
        &rent_token_program_id,
    );

    let tenant_rent_token_pubkey = get_associated_token_address_with_program_id(
        &tenant.pubkey(),
        rent_token_mint_pubkey,
        &rent_token_program_id,
    );

    let transfer_sol_ix = solana_program::system_instruction::transfer(
        &ctx.payer.pubkey(),
        &tenant_rent_token_pubkey,
        1_000_000_000,
    );

    let create_tenant_ata_ix =
        spl_associated_token_account::instruction::create_associated_token_account(
            &ctx.payer.pubkey(),
            &tenant.pubkey(),
            rent_token_mint_pubkey,
            &rent_token_program_id,
        );

    let create_listing_wallet_ix =
        spl_associated_token_account::instruction::create_associated_token_account(
            &ctx.payer.pubkey(),
            &listing_info_pubkey,
            rent_token_mint_pubkey,
            &rent_token_program_id,
        );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[
            transfer_sol_ix,
            create_tenant_ata_ix,
            create_listing_wallet_ix,
        ],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer],
        recent_blockhash,
    );
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    let rent_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &dephy_io_conduits::instruction::ConduitsInstruction::RentDevice {
            rental_days,
            prepaid_rent,
        },
        vec![
            // #[account(0, writable, name="listing_info", desc = "The listing info account")]
            AccountMeta::new(*listing_info_pubkey, false),
            // #[account(1, writable, name="rental_info", desc = "The PDA of the rental agreement account to create")]
            AccountMeta::new(rental_info_pubkey, false),
            // #[account(2, name="app_account", desc = "The app account")]
            AccountMeta::new_readonly(*app_pubkey, false),
            // #[account(3, name="app_mint", desc = "The template mint account for the app")]
            AccountMeta::new_readonly(app_mint_pubkey, false),
            // #[account(4, name="device", desc = "The device account")]
            AccountMeta::new_readonly(device.pubkey(), false),
            // #[account(5, signer, name="tenant", desc="The tenant account")]
            AccountMeta::new_readonly(tenant.pubkey(), true),
            // #[account(6, writable, name="access_identity_mint", desc="The mint account for the access identity")]
            AccountMeta::new(access_mint_pubkey, false),
            // #[account(7, writable, name="access_identity_atoken", desc="The associated token account for the access identity")]
            AccountMeta::new(access_atoken_pubkey, false),
            // #[account(8, name="rent_token_mint", desc = "The rent token")]
            AccountMeta::new_readonly(*rent_token_mint_pubkey, false),
            // #[account(9, name="rent_token_program", desc="The token program for rent token")]
            AccountMeta::new_readonly(spl_token_program_id(), false),
            // #[account(10, writable, name="rent_token_src", desc = "The source account for rent payment")]
            AccountMeta::new(tenant_rent_token_pubkey, false),
            // #[account(11, writable, name="rent_token_escrow", desc = "The destination account for rent payment")]
            AccountMeta::new(rent_token_escrow_pubkey, false),
            // #[account(12, writable, signer, name="payer", desc = "The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(13, name="system_program", desc = "The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(14, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(15, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
        ],
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[rent_device_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer, &tenant],
        recent_blockhash,
    );

    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Verify the RentalInfo account
    let rental_info = get_rental_info(ctx, &rental_info_pubkey).await;

    assert_eq!(rental_info.listing_info, *listing_info_pubkey);
    assert_eq!(rental_info.tenant, tenant.pubkey());
    assert_eq!(rental_info.rental_days, rental_days);
    assert_eq!(rental_info.total_paid_rent, prepaid_rent);
}

async fn test_pay_rent(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    rent_token_mint_pubkey: &Pubkey,
    listing_info_pubkey: &Pubkey,
    tenant: &Keypair,
    rent_amount: u64,
) {
    let (rental_info_pubkey, _) = RentalInfo::find_pda(listing_info_pubkey);
    let rent_token_program_id = get_account_owner(ctx, rent_token_mint_pubkey).await;

    let tenant_rent_token_pubkey = get_associated_token_address_with_program_id(
        &tenant.pubkey(),
        rent_token_mint_pubkey,
        &rent_token_program_id,
    );
    let rent_token_escrow_pubkey = get_associated_token_address_with_program_id(
        listing_info_pubkey,
        rent_token_mint_pubkey,
        &rent_token_program_id,
    );

    let rental_info = get_rental_info(ctx, &rental_info_pubkey).await;

    let pay_rent_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &dephy_io_conduits::instruction::ConduitsInstruction::PayRent { rent_amount },
        vec![
            // #[account(0, writable, name="rental_info", desc = "The rental info account")]
            AccountMeta::new(rental_info_pubkey, false),
            // #[account(1, name="listing_info", desc = "The listing info account")]
            AccountMeta::new(*listing_info_pubkey, false),
            // #[account(2, signer, name="tenant", desc="The tenant account")]
            AccountMeta::new_readonly(tenant.pubkey(), true),
            // #[account(3, name="rent_token_mint", desc = "The rent token")]
            AccountMeta::new(*rent_token_mint_pubkey, false),
            // #[account(4, name="rent_token_program", desc="The token program for rent token")]
            AccountMeta::new_readonly(rent_token_program_id, false),
            // #[account(5, writable, name="rent_token_src", desc = "The source account for rent payment")]
            AccountMeta::new(tenant_rent_token_pubkey, false),
            // #[account(6, writable, name="rent_token_escrow", desc = "The destination account for rent payment")]
            AccountMeta::new(rent_token_escrow_pubkey, false),
            // #[account(7, writable, signer, name="payer", desc = "The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(8, name="system_program", desc = "The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(9, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(10, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
        ],
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[pay_rent_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer, tenant],
        recent_blockhash,
    );

    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Verify the updated RentalInfo account
    let new_rental_info = get_rental_info(ctx, &rental_info_pubkey).await;

    assert_eq!(
        new_rental_info.total_paid_rent,
        rental_info.total_paid_rent + rent_amount
    );
}

async fn test_end_lease(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    device: &Keypair,
    listing_info_pubkey: &Pubkey,
    tenant: &Keypair,
) {
    let (rental_info_pubkey, _) = RentalInfo::find_pda(&listing_info_pubkey);

    let (access_mint_pubkey, _) = AccessIdentity::find_pda(&program_id, &device.pubkey());
    let access_atoken_pubkey = get_associated_token_address_with_program_id(
        &tenant.pubkey(),
        &access_mint_pubkey,
        &spl_token_2022::id(),
    );

    let end_lease_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &dephy_io_conduits::instruction::ConduitsInstruction::EndLease,
        vec![
            // #[account(0, writable, name="rental_info", desc = "The rental info account")]
            AccountMeta::new(rental_info_pubkey, false),
            // #[account(1, writable, name="listing_info", desc = "The listing info account")]
            AccountMeta::new(*listing_info_pubkey, false),
            // #[account(2, writable, name="tenant", desc="The tenant account")]
            AccountMeta::new(tenant.pubkey(), false),
            // #[account(3, writable, name="access_identity_mint", desc="The mint account for the access identity")]
            AccountMeta::new(access_mint_pubkey, false),
            // #[account(4, writable, name="access_identity_atoken", desc="The associated token account for the access identity")]
            AccountMeta::new(access_atoken_pubkey, false),
            // #[account(5, writable, signer, name="payer", desc = "The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(6, name="system_program", desc = "The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(7, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
        ],
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[end_lease_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer],
        recent_blockhash,
    );

    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Verify the RentalInfo account is closed
    let rental_info_account = ctx
        .banks_client
        .get_account(rental_info_pubkey)
        .await
        .unwrap();
    assert!(rental_info_account.is_none());
}


async fn test_delist(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    app_pubkey: &Pubkey,
    device: &Keypair,
    device_owner: &Keypair,
    rent_token_mint_pubkey: &Pubkey,
    listing_info_pubkey: &Pubkey,
) {

    let rent_token_program_id = get_account_owner(ctx, rent_token_mint_pubkey).await;

    let rent_token_escrow_pubkey = get_associated_token_address_with_program_id(
        listing_info_pubkey,
        rent_token_mint_pubkey,
        &rent_token_program_id,
    );

    let rent_token_dst_pubkey = get_associated_token_address_with_program_id(
        &device_owner.pubkey(),
        rent_token_mint_pubkey,
        &rent_token_program_id,
    );

    let delist_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &dephy_io_conduits::instruction::ConduitsInstruction::DelistDevice,
        vec![
            // #[account(0, writable, name="listing_info", desc = "The listing info account")]
            AccountMeta::new(*listing_info_pubkey, false),
            // #[account(1, name="app_account", desc = "The app account")]
            AccountMeta::new_readonly(*app_pubkey, false),
            // #[account(2, name="device", desc = "The device account")]
            AccountMeta::new_readonly(device.pubkey(), false),
            // #[account(3, name="rent_token_mint", desc="The rent token mint")]
            AccountMeta::new_readonly(*rent_token_mint_pubkey, false),
            // #[account(4, name="rent_token_program", desc="The token program for rent token")]
            AccountMeta::new_readonly(rent_token_program_id, false),
            // #[account(5, writable, name="rent_token_escrow", desc="The destination account for rent token")]
            AccountMeta::new(rent_token_escrow_pubkey, false),
            // #[account(6, writable, name="rent_token_dst", desc="The destination account for rent token")]
            AccountMeta::new(rent_token_dst_pubkey, false),
            // #[account(7, writable, signer, name="device_owner", desc = "The device owner")]
            AccountMeta::new(device_owner.pubkey(), true),
            // #[account(8, writable, signer, name="payer", desc = "The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(9, name="system_program", desc = "The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(10, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(11, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
        ],
    );

    println!("delist_device_ix: {:?}", delist_device_ix.accounts);

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[delist_device_ix],
        Some(&ctx.payer.pubkey()),
        &[&ctx.payer, device_owner],
        recent_blockhash,
    );

    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Verify the ListingInfo account is closed
    let listing_info_account = ctx
        .banks_client
        .get_account(*listing_info_pubkey)
        .await
        .unwrap();
    assert!(listing_info_account.is_none());
}

