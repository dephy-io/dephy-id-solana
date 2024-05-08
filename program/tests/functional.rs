// #![cfg(feature = "test-sbf")]

use dephy_io_dephy_id::{
    instruction::{
        ActivateDeviceArgs, CreateDephyArgs, CreateDeviceArgs, CreateProductArgs, CreateVendorArgs,
        DephyInstruction, KeyType,
    },
    state::DephyAccount,
};
use solana_program::pubkey::Pubkey;
use solana_program_test::*;
use solana_sdk::{
    account::ReadableAccount,
    ed25519_instruction::new_ed25519_instruction,
    hash::hash,
    instruction::{AccountMeta, Instruction},
    keccak,
    secp256k1_instruction::new_secp256k1_instruction,
    signature::Keypair,
    signer::Signer,
    system_program, sysvar,
    transaction::Transaction,
};
use spl_token_2022::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::{Account, Mint},
};
use spl_token_metadata_interface::state::TokenMetadata;
use std::str::FromStr;

#[tokio::test]
async fn test_dephy() {
    let program_id = Pubkey::from_str("DePHYtest1111111111111111111111111111111111").unwrap();

    let program_test = ProgramTest::new("dephy_io_dephy_id", program_id, None);

    let mut ctx = program_test.start_with_context().await;

    let admin = Keypair::new();
    let vendor = Keypair::new();
    let device1 = Keypair::new();
    let device2 = Keypair::new();
    let user1 = Keypair::new();

    // Create DePHY account
    let (dephy_pubkey, bump) = Pubkey::find_program_address(&[b"DePHY"], &program_id);

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::CreateDephy(CreateDephyArgs { bump }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(dephy_pubkey, false),
                AccountMeta::new(admin.pubkey(), true),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );
    transaction.sign(&[&ctx.payer, &admin], ctx.last_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Associated account now exists
    let allocated_account = ctx
        .banks_client
        .get_account(dephy_pubkey)
        .await
        .expect("get_account")
        .expect("DePHY account not none");
    assert_eq!(allocated_account.data.len(), DephyAccount::LEN);

    test_create_vendor(program_id, &mut ctx, dephy_pubkey, &admin, &vendor).await;

    test_create_product(program_id, &mut ctx, &vendor, b"Product1").await;

    test_create_device(
        program_id,
        &mut ctx,
        &vendor,
        &device1,
        b"Product1",
        KeyType::Ed25519,
    )
    .await;

    test_activate_device(
        program_id,
        &mut ctx,
        &vendor,
        b"Product1",
        &device1,
        &user1,
        KeyType::Ed25519,
        1_000,
    )
    .await;

    test_create_device(
        program_id,
        &mut ctx,
        &vendor,
        &device2,
        b"Product1",
        KeyType::Secp256k1,
    )
    .await;

    test_activate_device(
        program_id,
        &mut ctx,
        &vendor,
        b"Product1",
        &device2,
        &user1,
        KeyType::Secp256k1,
        2_000,
    )
    .await;
}

async fn test_create_vendor(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    dephy: Pubkey,
    admin: &Keypair,
    vendor: &Keypair,
) {
    let (mint_pubkey, bump) =
        Pubkey::find_program_address(&[b"DePHY VENDOR", &vendor.pubkey().to_bytes()], &program_id);

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        &vendor.pubkey(),
        &mint_pubkey,
        &spl_token_2022::id(),
    );

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::CreateVendor(CreateVendorArgs {
                bump,
                name: "DePHY Example Vendor".to_string(),
                symbol: "DEV".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![("desc".to_string(), "Example Vendor".to_string())],
            }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(spl_associated_token_account::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(admin.pubkey(), true),
                AccountMeta::new(dephy, false),
                AccountMeta::new(vendor.pubkey(), false),
                AccountMeta::new(mint_pubkey, false),
                AccountMeta::new(atoken_pubkey, false),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&ctx.payer, &admin], recent_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Mint account
    let mint_account = ctx
        .banks_client
        .get_account(mint_pubkey)
        .await
        .expect("get_account")
        .expect("mint account not none");

    let mint_state = StateWithExtensions::<Mint>::unpack(mint_account.data()).unwrap();
    assert_eq!(
        mint_state.try_get_account_len().unwrap() > 238,
        true,
        "account size"
    );
    assert_eq!(
        mint_state.try_get_account_len().unwrap() > 238,
        true,
        "account size"
    );

    let mint_metadata = mint_state
        .get_variable_len_extension::<TokenMetadata>()
        .unwrap();
    assert_eq!(mint_metadata.name, "DePHY Example Vendor", "metadata name");

    // Associated account now exists
    let atoken_account = ctx
        .banks_client
        .get_account(atoken_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");

    let account_state = StateWithExtensions::<Account>::unpack(atoken_account.data()).unwrap();
    assert_eq!(account_state.base.amount, 1, "coin not 1");
}

async fn test_create_product(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    product_seed: &[u8],
) {
    let seed = hash(product_seed);

    let (vendor_mint_pubkey, _) =
        Pubkey::find_program_address(&[b"DePHY VENDOR", &vendor.pubkey().to_bytes()], &program_id);

    let vendor_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &vendor.pubkey(),
            &vendor_mint_pubkey,
            &spl_token_2022::id(),
        );

    let (product_mint_pubkey, mint_bump) = Pubkey::find_program_address(
        &[b"DePHY PRODUCT", &vendor.pubkey().to_bytes(), seed.as_ref()],
        &program_id,
    );

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::CreateProduct(CreateProductArgs {
                seed: seed.to_bytes(),
                bump: mint_bump,
                name: "Example Product 1".to_string(),
                symbol: "PD1".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![("desc".to_string(), "Product by Vendor".to_string())],
            }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(product_mint_pubkey, false),
                AccountMeta::new(vendor_mint_pubkey, false),
                AccountMeta::new(vendor_atoken_pubkey, false),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&ctx.payer, &vendor], recent_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Mint account
    let mint_account = ctx
        .banks_client
        .get_account(product_mint_pubkey)
        .await
        .expect("get_account")
        .expect("mint account not none");

    let mint_state = StateWithExtensions::<Mint>::unpack(mint_account.data()).unwrap();
    assert_eq!(
        mint_state.try_get_account_len().unwrap() > 238,
        true,
        "account size"
    );

    let mint_metadata = mint_state
        .get_variable_len_extension::<TokenMetadata>()
        .unwrap();
    assert_eq!(mint_metadata.name, "Example Product 1", "metadata name");
}

fn get_device_pubkey(device: &Keypair, key_type: KeyType) -> Pubkey {
    match key_type {
        KeyType::Ed25519 => device.pubkey(),
        KeyType::Secp256k1 => {
            let privkey = libsecp256k1::SecretKey::parse(device.secret().as_bytes()).unwrap();
            let pubkey = libsecp256k1::PublicKey::from_secret_key(&privkey);
            let hash = keccak::hash(&pubkey.serialize()[1..]);
            Pubkey::new_from_array(keccak::hash(&hash.as_ref()[12..]).to_bytes())
        }
    }
}

async fn test_create_device(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    device: &Keypair,
    product_seed: &[u8],
    key_type: KeyType,
) {
    let seed = hash(product_seed);

    let (product_mint_pubkey, _mint_bump) = Pubkey::find_program_address(
        &[b"DePHY PRODUCT", &vendor.pubkey().to_bytes(), seed.as_ref()],
        &program_id,
    );

    let device_pubkey = get_device_pubkey(device, key_type.clone());
    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        &device_pubkey,
        &product_mint_pubkey,
        &spl_token_2022::id(),
    );

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::CreateDevice(CreateDeviceArgs { key_type }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(spl_associated_token_account::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(device_pubkey, false),
                AccountMeta::new(product_mint_pubkey, false),
                AccountMeta::new(atoken_pubkey, false),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&ctx.payer, &vendor], recent_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    let atoken_account = ctx
        .banks_client
        .get_account(atoken_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");
    let account_data = StateWithExtensions::<Account>::unpack(atoken_account.data()).unwrap();
    assert_eq!(account_data.base.amount, 1, "Token amount is 1");
}

async fn test_activate_device(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    product_seed: &[u8],
    device: &Keypair,
    user: &Keypair,
    key_type: KeyType,
    slot: u64,
) {
    ctx.warp_to_slot(slot).unwrap();

    let (product_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            b"DePHY PRODUCT",
            vendor.pubkey().as_ref(),
            product_seed.as_ref(),
        ],
        &program_id,
    );

    let device_pubkey = get_device_pubkey(device, key_type.clone());

    let (mint_pubkey, mint_bump) = Pubkey::find_program_address(
        &[b"DePHY DID", device_pubkey.as_ref(), user.pubkey().as_ref()],
        &program_id,
    );

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &product_mint_pubkey,
            &spl_token_2022::id(),
        );

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        &user.pubkey(),
        &mint_pubkey,
        &spl_token_2022::id(),
    );

    let activate_device_ix = Instruction::new_with_borsh(
        program_id,
        &DephyInstruction::ActivateDevice(ActivateDeviceArgs {
            bump: mint_bump,
            key_type: key_type.clone(),
        }),
        vec![
            // #[account(0, name="system_program", desc = "The system program")]
            AccountMeta::new(system_program::id(), false),
            // #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
            AccountMeta::new(spl_token_2022::id(), false),
            // #[account(2, name="ata_program", desc = "The associated token program")]
            AccountMeta::new(spl_associated_token_account::id(), false),
            // #[account(3, name="instructions", desc = "The Instructions sysvar")]
            AccountMeta::new(sysvar::instructions::id(), false),
            // #[account(4, writable, signer, name="payer", desc = "The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(5, signer, name="device", desc = "The Device pubkey")]
            AccountMeta::new(device_pubkey, false),
            // #[account(6, name="vendor", desc = "Vendor of the Device")]
            AccountMeta::new(vendor.pubkey(), false),
            // #[account(7, name="product_mint", desc = "Product of the Device")]
            AccountMeta::new(product_mint_pubkey, false),
            // #[account(8, name="product_atoken", desc = "The Product atoken for Device")]
            AccountMeta::new(product_atoken_pubkey, false),
            // #[account(9, name="user", desc = "The Device Owner pubkey")]
            AccountMeta::new(user.pubkey(), true),
            // #[account(10, writable, name="did_mint", desc = "The NFT mint account")]
            AccountMeta::new(mint_pubkey, false),
            // #[account(11, writable, name="did_atoken", desc = "The NFT atoken account")]
            AccountMeta::new(atoken_pubkey, false),
        ],
    );

    let mut transaction =
        Transaction::new_with_payer(&[activate_device_ix.clone()], Some(&ctx.payer.pubkey()));

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&ctx.payer, &user], recent_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .expect_err("should fail");

    let message = [
        b"DEPHY_ID",
        product_atoken_pubkey.as_ref(),
        user.pubkey().as_ref(),
        &slot.to_le_bytes(),
    ]
    .concat();

    let sign_ix = match key_type {
        KeyType::Ed25519 => {
            let device_ed25519_keypair =
                ed25519_dalek::Keypair::from_bytes(&device.to_bytes()).unwrap();
            new_ed25519_instruction(&device_ed25519_keypair, &message)
        }
        KeyType::Secp256k1 => {
            let device_secp256k1_priv_key =
                libsecp256k1::SecretKey::parse(device.secret().as_bytes()).unwrap();
            new_secp256k1_instruction(&device_secp256k1_priv_key, &message)
        }
    };

    let mut transaction =
        Transaction::new_with_payer(&[sign_ix, activate_device_ix], Some(&ctx.payer.pubkey()));

    ctx.warp_forward_force_reward_interval_end().unwrap();
    transaction.sign(&[&ctx.payer, &user], ctx.last_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    let atoken_account = ctx
        .banks_client
        .get_account(atoken_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");
    let account_data = StateWithExtensions::<Account>::unpack(atoken_account.data()).unwrap();
    assert_eq!(account_data.base.amount, 1, "Token amount is 1");
}
