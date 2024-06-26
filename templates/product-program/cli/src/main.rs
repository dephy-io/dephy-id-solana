use std::{error::Error, time::Duration};

use borsh::BorshDeserialize;
use clap::{Args, Parser, Subcommand};
use dephy_id_program_client::find_device_mint;
use dephy_id_product_program::{
    instruction::{CreateVirtualDeviceArgs, InitArgs, ProgramInstruction},
    utils::find_device,
    state::ProgramAccount,
};
use solana_client::{self, rpc_client::RpcClient};
use solana_sdk::{
    commitment_config::CommitmentConfig,
    instruction::{AccountMeta, Instruction as SolanaInstruction},
    pubkey::Pubkey,
    signature::Keypair,
    signer::{EncodableKey, Signer},
    system_program,
    transaction::Transaction,
};
use spl_token_2022::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::Mint,
};
use spl_token_metadata_interface::state::TokenMetadata;

#[derive(Debug, Parser)]
#[command(name = "dephy-id-product-program-cli")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    InitProgram(InitProgramCliArgs),
    CreateVirtualDevice(CreateVirtualDeviceCliArgs),
}

#[derive(Debug, Args)]
struct InitProgramCliArgs {
    #[arg(long = "authority")]
    authority_keypair: String,
    name: String,
    symbol: String,
    uri: String,
    #[arg(short = 'm', value_parser = parse_key_val::<String, String>)]
    additional_metadata: Vec<(String, String)>,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct CreateVirtualDeviceCliArgs {
    #[arg(long = "owner")]
    owner_keypair: String,
    #[arg(long, default_value_t = 42)]
    challenge: u8,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct CommonArgs {
    #[arg(short, default_value = "http://127.0.0.1:8899")]
    url: String,
    #[arg(short)]
    program_id: Option<Pubkey>,
    #[arg(short)]
    dephy_id_program_id: Option<Pubkey>,
    #[arg(long)]
    payer: Option<String>,
}

fn parse_key_val<T, U>(s: &str) -> Result<(T, U), Box<dyn Error + Send + Sync + 'static>>
where
    T: std::str::FromStr,
    T::Err: Error + Send + Sync + 'static,
    U: std::str::FromStr,
    U::Err: Error + Send + Sync + 'static,
{
    let pos = s
        .find('=')
        .ok_or_else(|| format!("invalid KEY=value: no `=` found in `{s}`"))?;
    Ok((s[..pos].parse()?, s[pos + 1..].parse()?))
}

fn main() {
    let args = Cli::parse();

    match args.command {
        Commands::InitProgram(args) => init_program(args),
        Commands::CreateVirtualDevice(args) => create_virtual_device(args),
    }
}

fn get_client(url: &String) -> RpcClient {
    let timeout = Duration::from_secs(10);
    let commitment_config = CommitmentConfig::processed();
    let confirm_transaction_initial_timeout = Duration::from_secs(10);
    let client = RpcClient::new_with_timeouts_and_commitment(
        url,
        timeout,
        commitment_config,
        confirm_transaction_initial_timeout,
    );
    client
}

fn read_key(path: &String) -> Keypair {
    Keypair::read_from_file(path).unwrap()
}

fn init_program(args: InitProgramCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args
        .common
        .program_id
        .unwrap_or(dephy_id_product_program::ID);
    let dephy_id_program_id = args
        .common
        .dephy_id_program_id
        .unwrap_or(dephy_id_program_client::ID);

    let (program_account_pubkey, _) = ProgramAccount::find_pda();
    let (vendor_pubkey, _) = Pubkey::find_program_address(&[b"VENDOR"], &program_id);

    let product_name = "Demo".to_string();
    let (product_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            dephy_id_program_client::PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            product_name.as_ref(),
        ],
        &dephy_id_program_client::ID,
    );

    let authority = read_key(&args.authority_keypair);
    let payer = read_key(&args.common.payer.unwrap_or(args.authority_keypair));

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &ProgramInstruction::Init(InitArgs {
                name: args.name,
                symbol: "DEMO".to_string(),
                uri: "https://example.com".to_string(),
                additional_metadata: vec![],
            }),
            vec![
                // #[account(0, writable, name="program_pda", desc = "The program derived address of the program account to create (seeds: ['Program'])")]
                AccountMeta::new(program_account_pubkey, false),
                // #[account(1, signer, name="authority", desc = "The authority of the program")]
                AccountMeta::new(authority.pubkey(), true),
                // #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
                AccountMeta::new(payer.pubkey(), true),
                // #[account(3, name="system_program", desc = "The system program")]
                AccountMeta::new(system_program::id(), false),
                // #[account(4, name="token_2022_program", desc="The SPL Token 2022 program")]
                AccountMeta::new(spl_token_2022::id(), false),
                // #[account(5, name="dephy_id_program", desc = "DePHY ID program id")]
                AccountMeta::new(dephy_id_program_id, false),
                // #[account(6, name="vendor", desc="PDA as product vendor (seeds: ['VENDOR'])")]
                AccountMeta::new(vendor_pubkey, false),
                // #[account(7, writable, name="product_mint", desc="PDA of the product mint account (program: dephy_id, seeds: ['DePHY_ID-PRODUCT', vendor, PRODUCT_NAME])")]
                AccountMeta::new(product_mint_pubkey, false),
            ],
        )],
        Some(&payer.pubkey()),
        &[&authority, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("Product Created: {}", program_account_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

fn create_virtual_device(args: CreateVirtualDeviceCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args
        .common
        .program_id
        .unwrap_or(dephy_id_product_program::ID);

    let owner = read_key(&args.owner_keypair);
    let payer = read_key(&args.common.payer.unwrap_or(args.owner_keypair));

    let (program_account_pubkey, _) = ProgramAccount::find_pda();
    let (vendor_pubkey, _) = Pubkey::find_program_address(&[b"VENDOR"], &program_id);
    let (device_pubkey, _) = find_device(&owner.pubkey(), &program_id);

    let program_account_data = client.get_account_data(&program_account_pubkey).unwrap();
    let program_account = ProgramAccount::try_from_slice(program_account_data.as_ref()).unwrap();

    let product_metadata = {
        let product_mint_data = client.get_account_data(&program_account.product_mint).unwrap();
        let product_mint_state = StateWithExtensions::<Mint>::unpack(&product_mint_data).unwrap();

        product_mint_state
            .get_variable_len_extension::<TokenMetadata>()
            .unwrap()
    };

    let (product_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            dephy_id_program_client::PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            product_metadata.name.as_ref(),
        ],
        &dephy_id_program_client::ID,
    );

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &product_mint_pubkey,
            &spl_token_2022::id(),
        );
    let (device_mint_pubkey, _) =
        find_device_mint(&product_mint_pubkey, &device_pubkey, &program_id);
    let device_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &device_mint_pubkey,
            &spl_token_2022::id(),
        );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[SolanaInstruction::new_with_borsh(
            program_id,
            &ProgramInstruction::CreateVirtualDevice(CreateVirtualDeviceArgs { challenge: 42 }),
            vec![
                // #[account(0, writable, name="program_pda", desc = "The program derived address of the program account to increment (seeds: ['Program'])")]
                AccountMeta::new(program_account_pubkey, false),
                // #[account(1, writable, signer, name="payer", desc = "The account paying for the storage fees")]
                AccountMeta::new(payer.pubkey(), true),
                // #[account(2, name="system_program", desc = "The system program")]
                AccountMeta::new(system_program::id(), false),
                // #[account(3, name="token_2022_program", desc = "The SPL Token 2022 program")]
                AccountMeta::new(spl_token_2022::id(), false),
                // #[account(4, name="ata_program", desc = "The associated token program")]
                AccountMeta::new(spl_associated_token_account::id(), false),
                // #[account(5, name="dephy_id_program", desc = "DePHY ID program id")]
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
        Some(&payer.pubkey()),
        &[&payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("Virtual Device Created: {}", device_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}
