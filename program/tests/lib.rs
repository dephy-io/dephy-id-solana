#![cfg(feature = "test-sbf")]

use dephy_id_program::{
    instruction::{
        ActivateDeviceArgs, CreateDeviceArgs, CreateProductArgs, CreateVendorArgs,
        DeviceSigningAlgorithm, InitializeArgs, Instruction,
    },
    state::ProgramDataAccount,
    DEVICE_MESSAGE_PREFIX, DEVICE_MINT_SEED_PREFIX, PRODUCT_MINT_SEED_PREFIX,
    PROGRAM_PDA_SEED_PREFIX, VENDOR_MINT_SEED_PREFIX,
};
use solana_program::pubkey::Pubkey;
use solana_program_test::*;
use solana_sdk::{
    account::ReadableAccount,
    ed25519_instruction::new_ed25519_instruction,
    instruction::{AccountMeta, Instruction as SolanaInstruction},
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
async fn test_smoke() {
    let program_id = Pubkey::from_str("DePHYtest1111111111111111111111111111111111").unwrap();

    let program_test = ProgramTest::new("dephy_id_program", program_id, None);

    let mut ctx = program_test.start_with_context().await;

    let admin = Keypair::new();
    let vendor = Keypair::new();
    let device1 = Keypair::new();
    let device2 = Keypair::new();
    let user1 = Keypair::new();

    // Create DePHY account
    let (program_pda_pubkey, bump) =
        Pubkey::find_program_address(&[PROGRAM_PDA_SEED_PREFIX], &program_id);

    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &Instruction::Initialize(InitializeArgs { bump }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(program_pda_pubkey, false),
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
        .get_account(program_pda_pubkey)
        .await
        .expect("get_account")
        .expect("Account not none");
    assert_eq!(allocated_account.data.len(), ProgramDataAccount::LEN);

    test_create_vendor(program_id, &mut ctx, &vendor).await;

    let product_name = "Example Product 1".to_string();

    test_create_product(program_id, &mut ctx, &vendor, product_name.clone()).await;

    test_create_device(
        program_id,
        &mut ctx,
        &vendor,
        &device1,
        product_name.as_ref(),
        DeviceSigningAlgorithm::Ed25519,
    )
    .await;

    test_activate_device(
        program_id,
        &mut ctx,
        &vendor,
        product_name.as_ref(),
        &device1,
        &user1,
        DeviceSigningAlgorithm::Ed25519,
        1_000,
    )
    .await;

    test_create_device(
        program_id,
        &mut ctx,
        &vendor,
        &device2,
        product_name.as_ref(),
        DeviceSigningAlgorithm::Secp256k1,
    )
    .await;

    test_activate_device(
        program_id,
        &mut ctx,
        &vendor,
        product_name.as_ref(),
        &device2,
        &user1,
        DeviceSigningAlgorithm::Secp256k1,
        2_000,
    )
    .await;
}

async fn test_create_vendor(program_id: Pubkey, ctx: &mut ProgramTestContext, vendor: &Keypair) {
    let (vendor_mint_pubkey, bump) = Pubkey::find_program_address(
        &[VENDOR_MINT_SEED_PREFIX, &vendor.pubkey().to_bytes()],
        &program_id,
    );

    let vendor_ata_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &vendor.pubkey(),
            &vendor_mint_pubkey,
            &spl_token_2022::id(),
        );

    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &Instruction::CreateVendor(CreateVendorArgs {
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
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(vendor_mint_pubkey, false),
                AccountMeta::new(vendor_ata_pubkey, false),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );

    let recent_blockhash = ctx.banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&ctx.payer, vendor], recent_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Mint account
    let vendor_mint_account = ctx
        .banks_client
        .get_account(vendor_mint_pubkey)
        .await
        .expect("get_account")
        .expect("mint account not none");

    let vendor_mint_state =
        StateWithExtensions::<Mint>::unpack(vendor_mint_account.data()).unwrap();
    assert_eq!(
        vendor_mint_state.try_get_account_len().unwrap() > 238,
        true,
        "account size"
    );
    assert_eq!(
        vendor_mint_state.try_get_account_len().unwrap() > 238,
        true,
        "account size"
    );

    let vendor_mint_metadata = vendor_mint_state
        .get_variable_len_extension::<TokenMetadata>()
        .unwrap();
    assert_eq!(
        vendor_mint_metadata.name, "DePHY Example Vendor",
        "metadata name"
    );

    // Associated account now exists
    let vendor_ata = ctx
        .banks_client
        .get_account(vendor_ata_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");

    let account_state = StateWithExtensions::<Account>::unpack(vendor_ata.data()).unwrap();
    assert_eq!(account_state.base.amount, 1, "coin not 1");
}

async fn test_create_product(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    name: String,
) {
    let (vendor_mint_pubkey, _) = Pubkey::find_program_address(
        &[VENDOR_MINT_SEED_PREFIX, &vendor.pubkey().to_bytes()],
        &program_id,
    );

    let vendor_ata_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &vendor.pubkey(),
            &vendor_mint_pubkey,
            &spl_token_2022::id(),
        );

    let (product_mint_pubkey, mint_bump) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            &vendor.pubkey().to_bytes(),
            name.as_ref(),
        ],
        &program_id,
    );

    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &Instruction::CreateProduct(CreateProductArgs {
                bump: mint_bump,
                name,
                symbol: "PD1".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![("desc".to_string(), "Product by Vendor".to_string())],
            }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(vendor_mint_pubkey, false),
                AccountMeta::new(vendor_ata_pubkey, false),
                AccountMeta::new(product_mint_pubkey, false),
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
    let product_mint_account = ctx
        .banks_client
        .get_account(product_mint_pubkey)
        .await
        .expect("get_account")
        .expect("mint account not none");

    let product_mint_state =
        StateWithExtensions::<Mint>::unpack(product_mint_account.data()).unwrap();
    assert_eq!(
        product_mint_state.try_get_account_len().unwrap() > 238,
        true,
        "account size"
    );

    let product_mint_metadata = product_mint_state
        .get_variable_len_extension::<TokenMetadata>()
        .unwrap();
    assert_eq!(
        product_mint_metadata.name, "Example Product 1",
        "metadata name"
    );
}

fn get_device_pubkey(device: &Keypair, signing_alg: DeviceSigningAlgorithm) -> Pubkey {
    match signing_alg {
        DeviceSigningAlgorithm::Ed25519 => device.pubkey(),
        DeviceSigningAlgorithm::Secp256k1 => {
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
    product_name: &[u8],
    signing_alg: DeviceSigningAlgorithm,
) {
    let (product_mint_pubkey, _bump) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            &vendor.pubkey().to_bytes(),
            product_name,
        ],
        &program_id,
    );

    let device_pubkey = get_device_pubkey(device, signing_alg.clone());
    let product_ata_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &product_mint_pubkey,
            &spl_token_2022::id(),
        );

    let device_pubkey = get_device_pubkey(device, signing_alg.clone());
    let (device_mint_pubkey, did_mint_bump) = Pubkey::find_program_address(
        &[DEVICE_MINT_SEED_PREFIX, device_pubkey.as_ref()],
        &program_id,
    );

    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &Instruction::CreateDevice(CreateDeviceArgs {
                signing_alg,
                bump: did_mint_bump,
                uri: "https://example.com".to_string(),
                additional_metadata: vec![
                    ("description".to_string(), "Example DID Device".to_string()),
                    ("device".to_string(), device_pubkey.to_string()),
                ],
            }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(spl_associated_token_account::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(product_mint_pubkey, false),
                AccountMeta::new(product_ata_pubkey, false),
                AccountMeta::new(device_pubkey, false),
                AccountMeta::new(device_mint_pubkey, false),
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

    let product_ata_account = ctx
        .banks_client
        .get_account(product_ata_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");
    let account_data = StateWithExtensions::<Account>::unpack(product_ata_account.data()).unwrap();
    assert_eq!(account_data.base.amount, 1, "Token amount is 1");
}

async fn test_activate_device(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    product_name: &[u8],
    device: &Keypair,
    user: &Keypair,
    key_type: DeviceSigningAlgorithm,
    slot: u64,
) {
    ctx.warp_to_slot(slot).unwrap();

    let (product_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor.pubkey().as_ref(),
            product_name,
        ],
        &program_id,
    );

    let device_pubkey = get_device_pubkey(device, key_type.clone());

    let (device_mint_pubkey, device_mint_bump) = Pubkey::find_program_address(
        &[DEVICE_MINT_SEED_PREFIX, device_pubkey.as_ref()],
        &program_id,
    );

    let product_ata_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &product_mint_pubkey,
            &spl_token_2022::id(),
        );

    let device_ata_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &user.pubkey(),
            &device_mint_pubkey,
            &spl_token_2022::id(),
        );

    let activate_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &Instruction::ActivateDevice(ActivateDeviceArgs {
            bump: device_mint_bump,
            signing_alg: key_type.clone(),
        }),
        vec![
            // #[account(0, name="system_program", desc="The system program")]
            AccountMeta::new(system_program::id(), false),
            // #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new(spl_token_2022::id(), false),
            // #[account(2, name="ata_program", desc="The associated token program")]
            AccountMeta::new(spl_associated_token_account::id(), false),
            // #[account(3, name="instructions", desc="The instructions sys var")]
            AccountMeta::new(sysvar::instructions::id(), false),
            // #[account(4, writable, signer, name="payer", desc="The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(5, name="vendor", desc="The vendor")]
            AccountMeta::new(vendor.pubkey(), false),
            // #[account(6, name="product_program_data", desc="The PDA for the product to store mint data")]
            AccountMeta::new(product_mint_pubkey, false),
            // #[account(7, name="product_associated_token", desc="The ATA for the product")]
            AccountMeta::new(product_ata_pubkey, false),
            // #[account(8, name="device", desc="The device")]
            AccountMeta::new(device_pubkey, false),
            // #[account(9, writable, name="device_program_data", desc="The PDA for the device to store mint data")]
            AccountMeta::new(device_mint_pubkey, false),
            // #[account(10, writable, name="device_associated_token", desc="The ATA for the device")]
            AccountMeta::new(device_ata_pubkey, false),
            // #[account(11, name="owner", desc="The device's owner")]
            AccountMeta::new(user.pubkey(), true),
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
        DEVICE_MESSAGE_PREFIX,
        product_ata_pubkey.as_ref(),
        user.pubkey().as_ref(),
        &slot.to_le_bytes(),
    ]
    .concat();

    let sign_ix = match key_type {
        DeviceSigningAlgorithm::Ed25519 => {
            let device_ed25519_keypair =
                ed25519_dalek::Keypair::from_bytes(&device.to_bytes()).unwrap();
            new_ed25519_instruction(&device_ed25519_keypair, &message)
        }
        DeviceSigningAlgorithm::Secp256k1 => {
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

    let device_ata = ctx
        .banks_client
        .get_account(device_ata_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");
    let device_ata_data = StateWithExtensions::<Account>::unpack(device_ata.data()).unwrap();
    assert_eq!(device_ata_data.base.amount, 1, "Token amount is 1");
}
