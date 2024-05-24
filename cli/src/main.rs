use std::{error::Error, time::Duration};

use clap::{Args, Parser, Subcommand, ValueEnum};
use dephy_id_program_client::{
    instructions::{
        ActivateDeviceBuilder, CreateDeviceBuilder, CreateProductBuilder, InitializeBuilder,
    },
    types, DEVICE_MESSAGE_PREFIX, DEVICE_MINT_SEED_PREFIX, ID as PROGRAM_ID,
    PRODUCT_MINT_SEED_PREFIX, PROGRAM_PDA_SEED_PREFIX,
};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::{CommitmentConfig, CommitmentLevel},
    ed25519_instruction::new_ed25519_instruction,
    keccak,
    pubkey::Pubkey,
    secp256k1_instruction::new_secp256k1_instruction,
    signature::Keypair,
    signer::{EncodableKey, Signer},
    sysvar::instructions,
    transaction::Transaction,
};

#[derive(Debug, Parser)]
#[command(name = "dephy-cli")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    Initialize(InitializeCliArgs),
    CreateProduct(CreateProductCliArgs),
    CreateDevice(CreateDeviceCliArgs),
    ActivateDevice(ActivateDeviceCliArgs),
    GenerateMessage(GenerateMessageCliArgs),
}

#[derive(Debug, Args)]
struct CommonArgs {
    #[arg(short, default_value = "http://127.0.0.1:8899")]
    url: String,
    #[arg(short)]
    program_id: Option<Pubkey>,
    #[arg(long)]
    payer: Option<String>,
    #[arg(long = "dephy")]
    dephy_pubkey: Option<Pubkey>,
}

#[derive(Debug, Args)]
struct InitializeCliArgs {
    #[arg(long = "admin")]
    admin_keypair: String,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct CreateProductCliArgs {
    #[arg(long = "vendor")]
    vendor_keypair: String,
    name: String,
    symbol: String,
    uri: String,
    #[arg(short = 'm', value_parser = parse_key_val::<String, String>)]
    additional_metadata: Vec<(String, String)>,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Clone, ValueEnum)]
enum DeviceSigningAlgorithm {
    Ed25519,
    Secp256k1,
}

impl Into<types::DeviceSigningAlgorithm> for DeviceSigningAlgorithm {
    fn into(self) -> types::DeviceSigningAlgorithm {
        match self {
            DeviceSigningAlgorithm::Ed25519 => types::DeviceSigningAlgorithm::Ed25519,
            DeviceSigningAlgorithm::Secp256k1 => types::DeviceSigningAlgorithm::Secp256k1,
        }
    }
}

#[derive(Debug, Args)]
struct CreateDeviceCliArgs {
    #[arg(long = "vendor")]
    vendor_keypair: String,
    #[arg(long = "product")]
    product_pubkey: Pubkey,
    #[arg(long = "device")]
    device_pubkey: Pubkey,
    #[arg(value_enum, long, default_value_t = DeviceSigningAlgorithm::Ed25519)]
    signing_alg: DeviceSigningAlgorithm,
    metadata_uri: String,
    #[arg(short = 'm', value_parser = parse_key_val::<String, String>)]
    additional_metadata: Vec<(String, String)>,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct ActivateDeviceCliArgs {
    #[arg(long = "device")]
    device_keypair: String,
    #[arg(long = "user")]
    user_keypair: String,
    #[arg(long = "vendor")]
    vendor_pubkey: Pubkey,
    #[arg(long = "product")]
    product_pubkey: Pubkey,
    #[arg(value_enum, long, default_value_t = DeviceSigningAlgorithm::Ed25519)]
    signing_alg: DeviceSigningAlgorithm,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct GenerateMessageCliArgs {
    #[arg(long = "user")]
    owner_pubkey: Pubkey,
    #[arg(long = "product")]
    product_pubkey: Pubkey,
    #[arg(long = "device")]
    device_pubkey: Pubkey,
    #[arg(value_enum, long, default_value_t = DeviceSigningAlgorithm::Ed25519)]
    signing_alg: DeviceSigningAlgorithm,
    #[command(flatten)]
    common: CommonArgs,
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
        Commands::Initialize(args) => initialize_program(args),
        Commands::CreateProduct(args) => create_product(args),
        Commands::CreateDevice(args) => create_device(args),
        Commands::GenerateMessage(args) => generate_message(args),
        Commands::ActivateDevice(args) => activate_device(args),
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

fn read_key_or(path: Option<String>, default_path: &String) -> Keypair {
    if let Some(f) = path {
        Keypair::read_from_file(&f).unwrap()
    } else {
        Keypair::read_from_file(default_path).unwrap()
    }
}

fn initialize_program(args: InitializeCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);

    let admin = read_key(&args.admin_keypair);
    let (dephy_pubkey, bump) =
        Pubkey::find_program_address(&[PROGRAM_PDA_SEED_PREFIX], &program_id);

    let payer = read_key_or(args.common.payer, &args.admin_keypair);

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[InitializeBuilder::new()
            .payer(payer.pubkey())
            .authority(admin.pubkey())
            .program_data(dephy_pubkey)
            .bump(bump)
            .instruction()],
        Some(&payer.pubkey()),
        &[&admin, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("DePHY Created: {}", dephy_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}


fn create_product(args: CreateProductCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);
    let token_program_id = spl_token_2022::ID;

    let vendor = read_key(&args.vendor_keypair);
    let payer = read_key_or(args.common.payer, &args.vendor_keypair);

    let (product_mint_pubkey, _bump) = Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor.pubkey().as_ref(),
            args.name.as_ref(),
        ],
        &program_id,
    );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[CreateProductBuilder::new()
            .token2022_program(token_program_id)
            .payer(payer.pubkey())
            .vendor(vendor.pubkey())
            .product_mint(product_mint_pubkey)
            .name(args.name)
            .symbol(args.symbol)
            .uri(args.uri)
            .additional_metadata(args.additional_metadata)
            .instruction()],
        Some(&payer.pubkey()),
        &[&vendor, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("Product Token Created: {}", product_mint_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
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

fn create_device(args: CreateDeviceCliArgs) {
    let client = get_client(&args.common.url);
    let token_program_id = spl_token_2022::ID;
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);

    let vendor = read_key(&args.vendor_keypair);
    let payer = read_key_or(args.common.payer, &args.vendor_keypair);

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &args.device_pubkey,
            &args.product_pubkey,
            &token_program_id,
        );

    let (did_mint_pubkey, _bump) = Pubkey::find_program_address(
        &[DEVICE_MINT_SEED_PREFIX, args.device_pubkey.as_ref()],
        &program_id,
    );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[CreateDeviceBuilder::new()
            .token2022_program(token_program_id)
            .payer(payer.pubkey())
            .vendor(vendor.pubkey())
            .product_mint(args.product_pubkey)
            .device(args.device_pubkey)
            .product_associated_token(product_atoken_pubkey)
            .signing_alg(args.signing_alg.into())
            .device_mint(did_mint_pubkey)
            .uri(args.metadata_uri)
            .additional_metadata(args.additional_metadata)
            .instruction()],
        Some(&payer.pubkey()),
        &[&vendor, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("Device Token: {}", product_atoken_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

fn activate_device(args: ActivateDeviceCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);
    let token_program_id = spl_token_2022::ID;
    let instructions_id = instructions::ID;

    let device = read_key(&args.device_keypair);
    let user = read_key(&args.user_keypair);
    let payer = read_key_or(args.common.payer, &args.user_keypair);

    let device_pubkey = get_device_pubkey(&device, args.signing_alg.clone());
    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &args.product_pubkey,
            &token_program_id,
        );

    let (did_mint_pubkey, _did_mint_bump) = Pubkey::find_program_address(
        &[DEVICE_MINT_SEED_PREFIX, device_pubkey.as_ref()],
        &program_id,
    );

    let did_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &user.pubkey(),
            &did_mint_pubkey,
            &token_program_id,
        );

    let slot: u64 = client
        .get_slot_with_commitment(CommitmentConfig {
            commitment: CommitmentLevel::Finalized,
        })
        .unwrap();
    let message = [
        b"DEPHY_ID",
        product_atoken_pubkey.as_ref(),
        user.pubkey().as_ref(),
        &slot.to_le_bytes(),
    ]
    .concat();

    let latest_block = client.get_latest_blockhash().unwrap();
    let verify_signature_ix = match args.signing_alg {
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

    let transaction = Transaction::new_signed_with_payer(
        &[
            verify_signature_ix,
            ActivateDeviceBuilder::new()
                .token2022_program(token_program_id)
                .instructions(instructions_id)
                .payer(payer.pubkey())
                .device(device_pubkey)
                .vendor(args.vendor_pubkey)
                .product_mint(args.product_pubkey)
                .product_associated_token(product_atoken_pubkey)
                .owner(user.pubkey())
                .device_mint(did_mint_pubkey)
                .device_associated_token(did_atoken_pubkey)
                .signing_alg(args.signing_alg.into())
                .instruction(),
        ],
        Some(&payer.pubkey()),
        &[&user, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!(
                "User {} activated Device {}, Mint: {}, AToken: {}",
                user.pubkey(),
                device_pubkey,
                did_mint_pubkey,
                did_atoken_pubkey,
            );
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

fn generate_message(args: GenerateMessageCliArgs) {
    let client = get_client(&args.common.url);
    let token_program_id = spl_token_2022::ID;

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &args.device_pubkey,
            &args.product_pubkey,
            &token_program_id,
        );

    let slot: u64 = client
        .get_slot_with_commitment(CommitmentConfig {
            commitment: CommitmentLevel::Finalized,
        })
        .unwrap();
    let message = [
        DEVICE_MESSAGE_PREFIX,
        product_atoken_pubkey.as_ref(),
        args.owner_pubkey.as_ref(),
        &slot.to_le_bytes(),
    ]
    .concat();

    let msg = message
        .iter()
        .map(|b| format!("{:0x?}", b))
        .collect::<Vec<_>>()
        .join("");
    println!("0x{}", msg);
}
