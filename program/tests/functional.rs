// #![cfg(feature = "test-sbf")]

use dephy_io_dephy_id::{
    instruction::{
        ActivateDeviceArgs, CreateDephyArgs, CreateProductArgs, CreateVendorArgs, DephyInstruction,
    },
    state::DephyAccount,
};
use solana_program::pubkey::Pubkey;
use solana_program_test::*;
use solana_sdk::{
    account::ReadableAccount, hash::hash, instruction::{AccountMeta, Instruction}, signature::Keypair, signer::Signer, system_program, transaction::Transaction
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

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    let admin = Keypair::new();
    let vendor = Keypair::new();
    let device1 = Keypair::new();
    let user1 = Keypair::new();

    // Create DePHY account
    let (dephy_pubkey, bump) =
        Pubkey::find_program_address(&[b"DePHY"], &program_id);

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::CreateDephy(CreateDephyArgs { bump }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new(dephy_pubkey, false),
                AccountMeta::new(admin.pubkey(), true),
            ],
        )],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer, &admin], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();

    // Associated account now exists
    let allocated_account = banks_client
        .get_account(dephy_pubkey)
        .await
        .expect("get_account")
        .expect("DePHY account not none");
    assert_eq!(allocated_account.data.len(), DephyAccount::LEN);

    test_create_vendor(
        program_id,
        &mut banks_client,
        &payer,
        dephy_pubkey,
        &admin,
        &vendor,
    )
    .await;

    test_create_product(program_id, &mut banks_client, &payer, &vendor, b"Product1").await;

    test_create_device(
        program_id,
        &mut banks_client,
        &payer,
        &vendor,
        &device1,
        b"Product1",
    )
    .await;

    test_activate_device(program_id, &mut banks_client, &payer, &device1, &user1).await;
}

async fn test_create_vendor(
    program_id: Pubkey,
    banks_client: &mut BanksClient,
    payer: &Keypair,
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
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new(admin.pubkey(), true),
                AccountMeta::new(dephy, false),
                AccountMeta::new(vendor.pubkey(), false),
                AccountMeta::new(mint_pubkey, false),
                AccountMeta::new(atoken_pubkey, false),
            ],
        )],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&payer, &admin], recent_blockhash);
    banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Mint account
    let mint_account = banks_client
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
    let atoken_account = banks_client
        .get_account(atoken_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");

    let account_state = StateWithExtensions::<Account>::unpack(atoken_account.data()).unwrap();
    assert_eq!(account_state.base.amount, 1, "coin not 1");
}

async fn test_create_product(
    program_id: Pubkey,
    banks_client: &mut BanksClient,
    payer: &Keypair,
    vendor: &Keypair,
    product_seed: &[u8],
) {
    let seed = hash(product_seed);

    let (mint_pubkey, mint_bump) = Pubkey::find_program_address(
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
                additional_metadata: vec![
                    ("desc".to_string(), "Product by Vendor".to_string())
                ],
            }),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(mint_pubkey, false),
            ],
        )],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&payer, &vendor], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();

    // Mint account
    let mint_account = banks_client
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

    let mint_metadata = mint_state
        .get_variable_len_extension::<TokenMetadata>()
        .unwrap();
    assert_eq!(
        mint_metadata.name, "Example Product 1",
        "metadata name"
    );
}

async fn test_create_device(
    program_id: Pubkey,
    banks_client: &mut BanksClient,
    payer: &Keypair,
    vendor: &Keypair,
    device: &Keypair,
    product_seed: &[u8; 8],
) {
    let seed = hash(product_seed);

    let (product_mint_pubkey, _mint_bump) = Pubkey::find_program_address(
        &[b"DePHY PRODUCT", &vendor.pubkey().to_bytes(), seed.as_ref()],
        &program_id,
    );

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        &device.pubkey(),
        &product_mint_pubkey,
        &spl_token_2022::id(),
    );

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::CreateDevice(),
            vec![
                AccountMeta::new(system_program::id(), false),
                AccountMeta::new(spl_token_2022::id(), false),
                AccountMeta::new(spl_associated_token_account::id(), false),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new(vendor.pubkey(), true),
                AccountMeta::new(device.pubkey(), true),
                AccountMeta::new(product_mint_pubkey, false),
                AccountMeta::new(atoken_pubkey, false),
            ],
        )],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&payer, &vendor, &device], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();

    let atoken_account = banks_client
        .get_account(atoken_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");
    let account_data = StateWithExtensions::<Account>::unpack(atoken_account.data()).unwrap();
    assert_eq!(account_data.base.amount, 1, "Token amount is 1");
}

async fn test_activate_device(
    program_id: Pubkey,
    banks_client: &mut BanksClient,
    payer: &Keypair,
    device: &Keypair,
    user: &Keypair,
) {
    let (mint_pubkey, mint_bump) = Pubkey::find_program_address(
        &[
            b"DePHY DID",
            &device.pubkey().to_bytes(),
            &user.pubkey().to_bytes(),
        ],
        &program_id,
    );

    let atoken_pubkey = spl_associated_token_account::get_associated_token_address_with_program_id(
        &user.pubkey(),
        &mint_pubkey,
        &spl_token_2022::id(),
    );

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_borsh(
            program_id,
            &DephyInstruction::ActivateDevice(ActivateDeviceArgs { bump: mint_bump }),
            vec![
                // #[account(0, name="system_program", desc = "The system program")]
                AccountMeta::new(system_program::id(), false),
                // #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
                AccountMeta::new(spl_token_2022::id(), false),
                // #[account(2, name="atoken_program", desc = "The associated token program")]
                AccountMeta::new(spl_associated_token_account::id(), false),
                // #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
                AccountMeta::new(payer.pubkey(), true),
                // #[account(4, signer, name="device_account", desc = "The Device")]
                AccountMeta::new(device.pubkey(), true),
                // #[account(5, name="user_account", desc = "The Device Owner pubkey")]
                AccountMeta::new(user.pubkey(), true),
                // #[account(6, name="mint_account", desc = "The NFT mint account")]
                AccountMeta::new(mint_pubkey, false),
                // #[account(7, name="atoken_account", desc = "The NFT atoken account")]
                AccountMeta::new(atoken_pubkey, false),
            ],
        )],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[&payer, &device, &user], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();

    let atoken_account = banks_client
        .get_account(atoken_pubkey)
        .await
        .expect("get_account")
        .expect("atoken account not none");
    let account_data = StateWithExtensions::<Account>::unpack(atoken_account.data()).unwrap();
    assert_eq!(account_data.base.amount, 1, "Token amount is 1");
}
