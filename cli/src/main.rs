use std::{error::Error, time::Duration};

use clap::{Args, Parser, Subcommand};
use dephy_io_dephy_id_client::instructions::{
    ActivateDeviceBuilder, CreateDephyBuilder, CreateDeviceBuilder, CreateProductBuilder,
    CreateVendorBuilder,
};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig, hash, pubkey::Pubkey, signature::Keypair, signer::{EncodableKey, Signer}, transaction::Transaction
};

#[derive(Debug, Parser)]
#[command(name = "dephy-cli")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    CreateDephy(CreateDephyCliArgs),
    CreateVendor(CreateVendorCliArgs),
    CreateProduct(CreateProductCliArgs),
    CreateDevice(CreateDeviceCliArgs),
    ActivateDevice(ActivateDeviceCliArgs),
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
    dephy_pubkey: Option<Pubkey>
}

#[derive(Debug, Args)]
struct CreateDephyCliArgs {
    #[arg(long = "admin")]
    admin_keypair: String,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct CreateVendorCliArgs {
    #[arg(long = "admin")]
    admin_keypair: String,
    #[arg(long = "vendor")]
    vendor_pubkey: Pubkey,
    name: String,
    symbol: String,
    uri: String,
    #[arg(short = 'm', value_parser = parse_key_val::<String, String>)]
    additional_metadata: Vec<(String, String)>,
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

#[derive(Debug, Args)]
struct CreateDeviceCliArgs {
    #[arg(long = "vendor")]
    vendor_keypair: String,
    #[arg(long = "device")]
    device_keypair: String,
    #[arg(long = "product")]
    product_pubkey: Pubkey,
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

    println!("{:?}", args);

    match args.command {
        Commands::CreateDephy(args) => create_dephy(args),
        Commands::CreateVendor(args) => create_vendor(args),
        Commands::CreateProduct(args) => create_product(args),
        Commands::CreateDevice(args) => create_device(args),
        Commands::ActivateDevice(args) => activate_device(args),
    }
}

fn get_client(url: &String) -> RpcClient {
    let timeout = Duration::from_secs(1);
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

fn create_dephy(args: CreateDephyCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args
        .common
        .program_id
        .unwrap_or(dephy_io_dephy_id_client::ID);

    let admin = read_key(&args.admin_keypair);
    let (dephy_pubkey, bump) = Pubkey::find_program_address(&[b"DePHY"], &program_id);

    let payer = read_key_or(args.common.payer, &args.admin_keypair);

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[CreateDephyBuilder::new()
            .payer(payer.pubkey())
            .authority(admin.pubkey())
            .dephy(dephy_pubkey)
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

fn create_vendor(args: CreateVendorCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args
        .common
        .program_id
        .unwrap_or(dephy_io_dephy_id_client::ID);
    let token_program_id = spl_token_2022::ID;

    let admin = read_key(&args.admin_keypair);
    let payer = read_key_or(args.common.payer, &args.admin_keypair);

    let dephy_pubkey = if let Some(dephy_pubkey) = args.common.dephy_pubkey {
        dephy_pubkey
    } else {
        let (dephy_pubkey, _) = Pubkey::find_program_address(&[b"DePHY"], &program_id);
        dephy_pubkey
    };

    let (vendor_mint_pubkey, bump) =
        Pubkey::find_program_address(&[b"DePHY VENDOR", args.vendor_pubkey.as_ref()], &program_id);

    let vendor_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &args.vendor_pubkey,
            &vendor_mint_pubkey,
            &token_program_id,
        );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[CreateVendorBuilder::new()
            .token_program2022(token_program_id)
            .payer(payer.pubkey())
            .authority(admin.pubkey())
            .dephy(dephy_pubkey)
            .vendor(args.vendor_pubkey)
            .vendor_mint(vendor_mint_pubkey)
            .vendor_atoken(vendor_atoken_pubkey)
            .bump(bump)
            .name(args.name)
            .symbol(args.symbol)
            .uri(args.uri)
            .additional_metadata(args.additional_metadata)
            .instruction()],
        Some(&payer.pubkey()),
        &[&admin, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("Vendor Token Created: {}", vendor_mint_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

fn create_product(args: CreateProductCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args
        .common
        .program_id
        .unwrap_or(dephy_io_dephy_id_client::ID);
    let token_program_id = spl_token_2022::ID;

    let vendor = read_key(&args.vendor_keypair);
    let payer = read_key_or(args.common.payer, &args.vendor_keypair);

    let seed = hash::hash(args.name.as_ref());
    let (product_mint_pubkey, bump) = Pubkey::find_program_address(
        &[b"DePHY PRODUCT", vendor.pubkey().as_ref(), seed.as_ref()],
        &program_id,
    );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[CreateProductBuilder::new()
            .token_program2022(token_program_id)
            .payer(payer.pubkey())
            .vendor(vendor.pubkey())
            .product_mint(product_mint_pubkey)
            .seed(seed.to_bytes())
            .bump(bump)
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

fn create_device(args: CreateDeviceCliArgs) {
    let client = get_client(&args.common.url);
    let token_program_id = spl_token_2022::ID;

    let vendor = read_key(&args.vendor_keypair);
    let device = read_key(&args.device_keypair);
    let payer = read_key_or(args.common.payer, &args.vendor_keypair);

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device.pubkey(),
            &args.product_pubkey,
            &token_program_id,
        );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[CreateDeviceBuilder::new()
            .token_program2022(token_program_id)
            .payer(payer.pubkey())
            .vendor(vendor.pubkey())
            .device(device.pubkey())
            .product_mint(args.product_pubkey)
            .product_atoken(product_atoken_pubkey)
            .instruction()],
        Some(&payer.pubkey()),
        &[&vendor, &device, &payer],
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
    let program_id = args
        .common
        .program_id
        .unwrap_or(dephy_io_dephy_id_client::ID);
    let token_program_id = spl_token_2022::ID;

    let device = read_key(&args.device_keypair);
    let user = read_key(&args.user_keypair);
    let payer = read_key_or(args.common.payer, &args.user_keypair);

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device.pubkey(),
            &args.product_pubkey,
            &token_program_id,
        );

    let (did_mint_pubkey, bump) = Pubkey::find_program_address(
        &[
            b"DePHY DID",
            device.pubkey().as_ref(),
            user.pubkey().as_ref(),
        ],
        &program_id,
    );

    let did_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &user.pubkey(),
            &did_mint_pubkey,
            &token_program_id,
        );

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[ActivateDeviceBuilder::new()
            .token_program2022(token_program_id)
            .payer(payer.pubkey())
            .device(device.pubkey())
            .vendor(args.vendor_pubkey)
            .product_mint(args.product_pubkey)
            .product_atoken(product_atoken_pubkey)
            .user(user.pubkey())
            .did_mint(did_mint_pubkey)
            .did_atoken(did_atoken_pubkey)
            .bump(bump)
            .instruction()],
        Some(&payer.pubkey()),
        &[&user, &device, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("User {} activated Device {}, Token: {}", user.pubkey(), device.pubkey(), did_mint_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

