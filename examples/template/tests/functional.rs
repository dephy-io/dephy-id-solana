use dephy_id_program_client::{find_device_mint, find_product_mint};
use dephy_io_dephy_template::{
    instruction::{CreateVirtualDeviceArgs, DemoInstruction, InitArgs},
    pda::find_device,
    state::DemoAccount,
};
use solana_program::pubkey::Pubkey;
use solana_program_test::{tokio, ProgramTest, ProgramTestContext};
use solana_sdk::{
    instruction::{AccountMeta, Instruction as SolanaInstruction},
    signature::Keypair,
    signer::Signer,
    system_program,
    transaction::Transaction,
};

#[tokio::test]
async fn test_all() {
    let program_id = dephy_io_dephy_template::id();

    let mut program_test = ProgramTest::new("dephy_io_dephy_template", program_id, None);
    program_test.add_program("dephy_id_program", dephy_id_program_client::ID, None);

    let mut ctx = program_test.start_with_context().await;

    let authority = Keypair::new();

    // Initialize the program
    let (demo_account_pubkey, _) = DemoAccount::find_pda();
    let (vendor_pubkey, _) = Pubkey::find_program_address(&[b"VENDOR"], &program_id);

    let product_name = "Demo".to_string();
    let (product_mint_pubkey, _) = find_product_mint(
        &vendor_pubkey,
        product_name.clone(),
        &dephy_id_program_client::ID,
    );

    test_init(
        &mut ctx,
        program_id,
        demo_account_pubkey,
        authority,
        vendor_pubkey,
        product_mint_pubkey,
        product_name,
    )
    .await;

    let owner = Keypair::new();

    test_create_virtual_device(
        &mut ctx,
        program_id,
        demo_account_pubkey,
        vendor_pubkey,
        product_mint_pubkey,
        owner,
    )
    .await;
}

async fn test_init(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    demo_account_pubkey: Pubkey,
    authority: Keypair,
    vendor_pubkey: Pubkey,
    product_mint_pubkey: Pubkey,
    product_name: String,
) {
    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &DemoInstruction::Init(InitArgs {
                name: product_name,
                symbol: "DEMO".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![],
            }),
            vec![
                // #[account(0, writable, name="demo", desc = "The program derived address of the demo account to create (seeds: ['DEMO'])")]
                AccountMeta::new(demo_account_pubkey, false),
                // #[account(1, signer, name="authority", desc = "The authority of the demo")]
                AccountMeta::new(authority.pubkey(), true),
                // #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
                AccountMeta::new(ctx.payer.pubkey(), true),
                // #[account(3, name="system_program", desc = "The system program")]
                AccountMeta::new(system_program::id(), false),
                // #[account(4, name="token_2022_program", desc="The SPL Token 2022 program")]
                AccountMeta::new(spl_token_2022::id(), false),
                // #[account(5, name="dephy_id", desc = "DePHY ID program id")]
                AccountMeta::new(dephy_id_program_client::ID, false),
                // #[account(6, name="vendor", desc="PDA as product vendor (seeds: ['VENDOR'])")]
                AccountMeta::new(vendor_pubkey, false),
                // #[account(7, writable, name="product_mint", desc="PDA of the product mint account (program: dephy_id, seeds: ['DePHY_ID-PRODUCT', vendor, PRODUCT_NAME])")]
                AccountMeta::new(product_mint_pubkey, false),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );
    transaction.sign(&[&ctx.payer, &authority], ctx.last_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    // Associated account now exists
    let demo_account = ctx
        .banks_client
        .get_account(demo_account_pubkey)
        .await
        .expect("get_account")
        .expect("Account not none");
    assert_eq!(demo_account.data.len(), DemoAccount::LEN);
}

async fn test_create_virtual_device(
    ctx: &mut ProgramTestContext,
    program_id: Pubkey,
    demo_account_pubkey: Pubkey,
    vendor_pubkey: Pubkey,
    product_mint_pubkey: Pubkey,
    owner: Keypair,
) {
    let (device_pubkey, _) = find_device(&owner.pubkey(), &program_id);

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &product_mint_pubkey,
            &spl_token_2022::id(),
        );
    let (device_mint_pubkey, _) = find_device_mint(
        &product_mint_pubkey,
        &device_pubkey,
        &dephy_id_program_client::ID,
    );
    let device_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &owner.pubkey(),
            &device_mint_pubkey,
            &spl_token_2022::id(),
        );

    let mut transaction = Transaction::new_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &DemoInstruction::CreateVirtualDevice(CreateVirtualDeviceArgs { challenge: 42 }),
            vec![
                // #[account(0, writable, name="demo", desc = "The program derived address of the demo account to increment (seeds: ['DEMO'])")]
                AccountMeta::new(demo_account_pubkey, false),
                // #[account(1, writable, signer, name="payer", desc = "The account paying for the storage fees")]
                AccountMeta::new(ctx.payer.pubkey(), true),
                // #[account(2, name="system_program", desc = "The system program")]
                AccountMeta::new(system_program::id(), false),
                // #[account(3, name="token_2022_program", desc = "The SPL Token 2022 program")]
                AccountMeta::new(spl_token_2022::id(), false),
                // #[account(4, name="ata_program", desc = "The associated token program")]
                AccountMeta::new(spl_associated_token_account::id(), false),
                // #[account(5, name="dephy_id", desc = "DePHY ID program id")]
                AccountMeta::new(dephy_id_program_client::ID, false),
                // #[account(6, name="vendor", desc = "PDA as product vendor (seeds: ['VENDOR'])")]
                AccountMeta::new(vendor_pubkey, false),
                // #[account(7, name="product_mint", desc = "PDA of the product mint account (program: dephy_id, seeds: ['DePHY_ID-PRODUCT', vendor, PRODUCT_NAME])")]
                AccountMeta::new(product_mint_pubkey, false),
                // #[account(8, name="owner", desc="The device's owner")]
                AccountMeta::new(owner.pubkey(), false),
                // #[account(9, name="device", desc = "PDA of the virtual device (seeds: ['DEVICE', owner])")]
                AccountMeta::new(device_pubkey, false),
                // #[account(10, writable, name="product_atoken", desc="The associated token account of the product")]
                AccountMeta::new(product_atoken_pubkey, false),
                // #[account(11, writable, name="device_mint", desc="The mint account of the device")]
                AccountMeta::new(device_mint_pubkey, false),
                // #[account(12, writable, name="device_atoken", desc="The associated token account for the device")]
                AccountMeta::new(device_atoken_pubkey, false),
            ],
        )],
        Some(&ctx.payer.pubkey()),
    );
    transaction.sign(&[&ctx.payer], ctx.last_blockhash);
    ctx.banks_client
        .process_transaction(transaction)
        .await
        .unwrap();

    let _did_account = ctx
        .banks_client
        .get_account(device_atoken_pubkey)
        .await
        .expect("get_account")
        .expect("DID account not none");
}
