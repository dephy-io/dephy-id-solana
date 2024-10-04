#![cfg(feature = "test-sbf")]

use dephy_id_program::{
    instruction::{
        ActivateDeviceArgs, CreateActivatedDeviceArgs, CreateDeviceArgs, CreateProductArgs,
        DeviceActivationSignature, DeviceSigningAlgorithm, InitializeArgs, Instruction,
    },
    state::ProgramDataAccount,
    DEVICE_MESSAGE_PREFIX, DEVICE_MINT_SEED_PREFIX, EIP191_MESSAGE_PREFIX,
    PRODUCT_MINT_SEED_PREFIX, PROGRAM_PDA_SEED_PREFIX,
};
use ed25519_dalek::ed25519::signature::SignerMut;
use solana_program::pubkey::Pubkey;
use solana_program_test::*;
use solana_sdk::{
    account::ReadableAccount,
    instruction::{AccountMeta, Instruction as SolanaInstruction},
    keccak,
    signature::Keypair,
    signer::Signer,
    system_program,
    transaction::Transaction,
};
use spl_token_2022::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::{Account, Mint},
};
use spl_token_metadata_interface::state::TokenMetadata;
use std::time::{SystemTime, UNIX_EPOCH};

#[tokio::test]
async fn test_smoke() {
    let program_id = dephy_id_program::id();
    let program_test = ProgramTest::new("dephy_id_program", program_id, None);

    let mut ctx = program_test.start_with_context().await;

    let admin = Keypair::new();
    let vendor = Keypair::new();
    let user1 = Keypair::new();

    // Initialize the program
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

    let product_name = "Example Product 1".to_string();

    test_create_product(program_id, &mut ctx, &vendor, product_name.clone()).await;

    #[cfg(feature = "ed25519-sign")]
    {
        let device1 = Keypair::new();
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
    }

    let device2 = Keypair::new();

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

    let device3 = Keypair::new();

    test_create_activated_device(
        program_id,
        &mut ctx,
        &vendor,
        product_name.as_ref(),
        &device3,
        &user1,
    )
    .await;

    let device4_pubkey = Pubkey::new_unique();

    test_create_activated_device_non_signer(
        program_id,
        &mut ctx,
        &vendor,
        product_name.as_ref(),
        &device4_pubkey,
        &user1,
    )
    .await;
}

async fn test_create_product(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    name: String,
) {
    let (product_mint_pubkey, _mint_bump) = Pubkey::find_program_address(
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
                name,
                symbol: "PD1".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![("desc".to_string(), "Product by Vendor".to_string())],
            }),
            vec![
                AccountMeta::new_readonly(system_program::id(), false),
                AccountMeta::new_readonly(spl_token_2022::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new_readonly(vendor.pubkey(), true),
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
            let hashed_pubkey = keccak::hash(&pubkey.serialize()[1..]);
            Pubkey::new_from_array(hashed_pubkey.to_bytes())
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

    let (device_mint_pubkey, _did_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
        &program_id,
    );

    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &Instruction::CreateDevice(CreateDeviceArgs {
                name: "DePHY Device DID".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![
                    ("description".to_string(), "Example DID Device".to_string()),
                    ("device".to_string(), device_pubkey.to_string()),
                ],
                signing_alg,
            }),
            vec![
                AccountMeta::new_readonly(system_program::id(), false),
                AccountMeta::new_readonly(spl_token_2022::id(), false),
                AccountMeta::new_readonly(spl_associated_token_account::id(), false),
                AccountMeta::new(ctx.payer.pubkey(), true),
                AccountMeta::new_readonly(vendor.pubkey(), true),
                AccountMeta::new(product_mint_pubkey, false),
                AccountMeta::new(product_ata_pubkey, false),
                AccountMeta::new_readonly(device_pubkey, false),
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

    let (device_mint_pubkey, _device_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
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

    // - 60s should make the test more reliable
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .ok()
        .unwrap()
        .as_secs()
        - 60;
    let signature = match key_type {
        DeviceSigningAlgorithm::Ed25519 => {
            let message = [
                DEVICE_MESSAGE_PREFIX,
                device_mint_pubkey.as_ref(),
                user.pubkey().as_ref(),
                &timestamp.to_le_bytes(),
            ]
            .concat();

            let mut device_ed25519_keypair =
                ed25519_dalek::Keypair::from_bytes(&device.to_bytes()).unwrap();
            DeviceActivationSignature::Ed25519(device_ed25519_keypair.sign(&message).to_bytes())
        }
        DeviceSigningAlgorithm::Secp256k1 => {
            let device_secp256k1_priv_key =
                libsecp256k1::SecretKey::parse(device.secret().as_bytes()).unwrap();

            let message = timestamp.to_le_bytes();
            let eth_message = [
                EIP191_MESSAGE_PREFIX,
                message.len().to_string().as_bytes(),
                &message,
            ]
            .concat();
            let message_hash = keccak::hash(&eth_message);
            let (signature, recovery_id) = libsecp256k1::sign(
                &libsecp256k1::Message::parse(&message_hash.to_bytes()),
                &device_secp256k1_priv_key,
            );
            DeviceActivationSignature::EthSecp256k1(signature.serialize(), recovery_id.serialize())
        }
    };

    let activate_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &Instruction::ActivateDevice(ActivateDeviceArgs {
            signature,
            timestamp,
        }),
        vec![
            // #[account(0, name="system_program", desc="The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(2, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
            // #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(4, name="vendor", desc="The vendor")]
            AccountMeta::new_readonly(vendor.pubkey(), false),
            // #[account(5, name="product_program_data", desc="The PDA for the product to store mint data")]
            AccountMeta::new_readonly(product_mint_pubkey, false),
            // #[account(6, name="product_associated_token", desc="The ATA for the product")]
            AccountMeta::new_readonly(product_ata_pubkey, false),
            // #[account(7, name="device", desc="The device")]
            AccountMeta::new_readonly(device_pubkey, false),
            // #[account(8, writable, name="device_program_data", desc="The PDA for the device to store mint data")]
            AccountMeta::new(device_mint_pubkey, false),
            // #[account(9, writable, name="device_associated_token", desc="The ATA for the device")]
            AccountMeta::new(device_ata_pubkey, false),
            // #[account(10, name="owner", desc="The device's owner")]
            AccountMeta::new_readonly(user.pubkey(), true),
        ],
    );

    let mut transaction =
        Transaction::new_with_payer(&[activate_device_ix.clone()], Some(&ctx.payer.pubkey()));

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

async fn test_create_activated_device(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    product_name: &[u8],
    device: &Keypair,
    owner: &Keypair,
) {
    ctx.warp_forward_force_reward_interval_end().unwrap();

    let (product_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor.pubkey().as_ref(),
            product_name,
        ],
        &program_id,
    );

    let device_pubkey = device.pubkey();

    let (device_mint_pubkey, _device_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
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
            &owner.pubkey(),
            &device_mint_pubkey,
            &spl_token_2022::id(),
        );

    let create_activated_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &Instruction::CreateActivatedDevice(CreateActivatedDeviceArgs {
            name: "Test Device".to_string(),
            uri: "https://example.com".to_string(),
            additional_metadata: vec![],
        }),
        vec![
            // #[account(0, name="system_program", desc="The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(2, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
            // #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(4, signer, name="vendor", desc="The vendor")]
            AccountMeta::new_readonly(vendor.pubkey(), true),
            // #[account(5, writable, name="product_mint", desc="The mint account for the product")]
            AccountMeta::new(product_mint_pubkey, false),
            // #[account(6, writable, name="product_associated_token", desc="The associated token account for the product")]
            AccountMeta::new(product_ata_pubkey, false),
            // #[account(7, name="device", desc="The device")]
            AccountMeta::new_readonly(device_pubkey, true),
            // #[account(8, writable, name="device_program_data", desc="The PDA for the device to store mint data")]
            AccountMeta::new(device_mint_pubkey, false),
            // #[account(9, writable, name="device_associated_token", desc="The ATA for the device")]
            AccountMeta::new(device_ata_pubkey, false),
            // #[account(10, name="owner", desc="The device's owner")]
            AccountMeta::new_readonly(owner.pubkey(), false),
        ],
    );

    let mut transaction = Transaction::new_with_payer(
        &[create_activated_device_ix.clone()],
        Some(&ctx.payer.pubkey()),
    );

    ctx.warp_forward_force_reward_interval_end().unwrap();
    transaction.sign(&[&ctx.payer, &device, &vendor], ctx.last_blockhash);
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

async fn test_create_activated_device_non_signer(
    program_id: Pubkey,
    ctx: &mut ProgramTestContext,
    vendor: &Keypair,
    product_name: &[u8],
    device_pubkey: &Pubkey,
    owner: &Keypair,
) {
    ctx.warp_forward_force_reward_interval_end().unwrap();

    let (product_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor.pubkey().as_ref(),
            product_name,
        ],
        &program_id,
    );

    let (device_mint_pubkey, _device_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
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
            &owner.pubkey(),
            &device_mint_pubkey,
            &spl_token_2022::id(),
        );

    let create_activated_device_ix = SolanaInstruction::new_with_borsh(
        program_id,
        &Instruction::CreateActivatedDeviceNonSigner(CreateActivatedDeviceArgs {
            name: "Test Device".to_string(),
            uri: "https://example.com".to_string(),
            additional_metadata: vec![],
        }),
        vec![
            // #[account(0, name="system_program", desc="The system program")]
            AccountMeta::new_readonly(system_program::id(), false),
            // #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
            AccountMeta::new_readonly(spl_token_2022::id(), false),
            // #[account(2, name="ata_program", desc="The associated token program")]
            AccountMeta::new_readonly(spl_associated_token_account::id(), false),
            // #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
            AccountMeta::new(ctx.payer.pubkey(), true),
            // #[account(4, signer, name="vendor", desc="The vendor")]
            AccountMeta::new_readonly(vendor.pubkey(), true),
            // #[account(5, writable, name="product_mint", desc="The mint account for the product")]
            AccountMeta::new(product_mint_pubkey, false),
            // #[account(6, writable, name="product_associated_token", desc="The associated token account for the product")]
            AccountMeta::new(product_ata_pubkey, false),
            // #[account(7, name="device", desc="The device")]
            AccountMeta::new_readonly(*device_pubkey, false),
            // #[account(8, writable, name="device_program_data", desc="The PDA for the device to store mint data")]
            AccountMeta::new(device_mint_pubkey, false),
            // #[account(9, writable, name="device_associated_token", desc="The ATA for the device")]
            AccountMeta::new(device_ata_pubkey, false),
            // #[account(10, name="owner", desc="The device's owner")]
            AccountMeta::new_readonly(owner.pubkey(), false),
        ],
    );

    let mut transaction = Transaction::new_with_payer(
        &[create_activated_device_ix.clone()],
        Some(&ctx.payer.pubkey()),
    );

    ctx.warp_forward_force_reward_interval_end().unwrap();
    transaction.sign(&[&ctx.payer, &vendor], ctx.last_blockhash);
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
