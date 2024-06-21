use std::{error::Error, str::FromStr, time::Duration};
use std::time::{SystemTime, UNIX_EPOCH};

use arrayref::array_ref;
use clap::{Args, Parser, Subcommand, ValueEnum};
use dephy_id_program_client::{instructions::{
    ActivateDeviceBuilder, CreateDeviceBuilder, CreateProductBuilder, InitializeBuilder,
}, types::{self, DeviceActivationSignature}, DEVICE_MESSAGE_PREFIX, DEVICE_MINT_SEED_PREFIX, ID as PROGRAM_ID, PRODUCT_MINT_SEED_PREFIX, PROGRAM_PDA_SEED_PREFIX, EIP191_MESSAGE_PREFIX};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig, keccak, pubkey::Pubkey, signature::{Keypair, Signature}, signer::{EncodableKey, Signer}, sysvar::instructions, transaction::Transaction
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
    GenerateMessage(GenerateMessageCliArgs),
    SignMessage(SignMessageCliArgs),
    ActivateDeviceOffchain(ActivateDeviceOffchainCliArgs),
    DevActivateDevice(DevActivateDeviceCliArgs),
}

#[derive(Debug, Args)]
struct CommonArgs {
    #[arg(short, default_value = "http://127.0.0.1:8899")]
    url: String,
    #[arg(short)]
    program_id: Option<Pubkey>,
    #[arg(long)]
    payer: Option<String>,
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
    #[arg(long = "product", value_parser = parse_pubkey)]
    product_pubkey: Pubkey,
    #[arg(long = "device", value_parser = parse_pubkey)]
    device_pubkey: Pubkey,
    #[arg(value_enum, long, default_value_t = DeviceSigningAlgorithm::Secp256k1)]
    signing_alg: DeviceSigningAlgorithm,
    name: String,
    #[arg(default_value = "")]
    metadata_uri: String,
    #[arg(short = 'm', value_parser = parse_key_val::<String, String>)]
    additional_metadata: Vec<(String, String)>,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Clone, ValueEnum)]
enum SignatureType {
    Ed25519,
    Secp256k1,
    EthSecp256k1,
}

#[derive(Debug, Args)]
struct DevActivateDeviceCliArgs {
    #[arg(long = "device")]
    device_keypair: String,
    #[arg(long = "user")]
    user_keypair: String,
    #[arg(long = "vendor", value_parser = parse_pubkey)]
    vendor_pubkey: Pubkey,
    #[arg(long = "product", value_parser = parse_pubkey)]
    product_mint_pubkey: Pubkey,
    #[arg(value_enum, long, default_value_t = SignatureType::Secp256k1)]
    signature_type: SignatureType,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct GenerateMessageCliArgs {
    #[arg(long = "user", value_parser = parse_pubkey)]
    user_pubkey: Pubkey,
    #[arg(long = "product", value_parser = parse_pubkey)]
    product_pubkey: Pubkey,
    #[arg(long = "device", value_parser = parse_pubkey)]
    device_pubkey: Pubkey,
    #[arg(long)]
    no_prefix: bool,
    #[command(flatten)]
    common: CommonArgs,
}

#[derive(Debug, Args)]
struct SignMessageCliArgs {
    #[arg(short, long)]
    keypair: String,
    #[arg()]
    message: String,
    #[arg(value_enum, long, default_value_t = SignatureType::Secp256k1)]
    signature_type: SignatureType,
}

#[derive(Debug, Args)]
struct ActivateDeviceOffchainCliArgs {
    #[arg(long = "device", value_parser = parse_pubkey)]
    device_pubkey: Pubkey,
    #[arg(long = "user")]
    user_keypair: String,
    #[arg(long = "vendor", value_parser = parse_pubkey)]
    vendor_pubkey: Pubkey,
    #[arg(long = "product", value_parser = parse_pubkey)]
    product_mint_pubkey: Pubkey,
    #[arg(value_enum, long, default_value_t = SignatureType::Secp256k1)]
    signature_type: SignatureType,
    #[arg(short, long)]
    signature: String,
    #[arg(short, long)]
    message: String,
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

fn parse_pubkey(s: &str) -> Result<Pubkey, solana_sdk::pubkey::ParsePubkeyError> {
    Keypair::read_from_file(s).map_or_else(|_e| Pubkey::from_str(s), |keypair| Ok(keypair.pubkey()))
}

fn main() {
    let args = Cli::parse();

    match args.command {
        Commands::Initialize(args) => initialize_program(args),
        Commands::CreateProduct(args) => create_product(args),
        Commands::CreateDevice(args) => create_device(args),
        Commands::GenerateMessage(args) => generate_message(args),
        Commands::SignMessage(args) => sign_message(args),
        Commands::ActivateDeviceOffchain(args) => activate_device_offchain(args),
        Commands::DevActivateDevice(args) => dev_activate_device(args),
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

fn initialize_program(args: InitializeCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);

    let admin = read_key(&args.admin_keypair);
    let (dephy_account_pubkey, bump) =
        Pubkey::find_program_address(&[PROGRAM_PDA_SEED_PREFIX], &program_id);

    let payer = read_key(&args.common.payer.unwrap_or(args.admin_keypair));

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[InitializeBuilder::new()
            .payer(payer.pubkey())
            .authority(admin.pubkey())
            .program_data(dephy_account_pubkey)
            .bump(bump)
            .instruction()],
        Some(&payer.pubkey()),
        &[&admin, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("DePHY Created: {}", dephy_account_pubkey);
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
    let payer = read_key(&args.common.payer.unwrap_or(args.vendor_keypair));

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

fn get_device_pubkey(device: &Keypair, signature_type: &SignatureType) -> Pubkey {
    match signature_type {
        SignatureType::Ed25519 => device.pubkey(),
        SignatureType::Secp256k1 | SignatureType::EthSecp256k1 => {
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
    let payer = read_key(&args.common.payer.unwrap_or(args.vendor_keypair));

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &args.device_pubkey,
            &args.product_pubkey,
            &token_program_id,
        );

    let (did_mint_pubkey, _bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            args.product_pubkey.as_ref(),
            args.device_pubkey.as_ref(),
        ],
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
            .name(args.name)
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
            println!("DID Mint: {}", did_mint_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

fn dev_activate_device(args: DevActivateDeviceCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);
    let token_program_id = spl_token_2022::ID;
    let instructions_id = instructions::ID;

    let device = read_key(&args.device_keypair);
    let user = read_key(&args.user_keypair);
    let payer = read_key(&args.common.payer.unwrap_or(args.user_keypair));

    let device_pubkey = get_device_pubkey(&device, &args.signature_type);
    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &args.product_mint_pubkey,
            &token_program_id,
        );

    let (did_mint_pubkey, _did_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            args.product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
        &program_id,
    );

    let did_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &user.pubkey(),
            &did_mint_pubkey,
            &token_program_id,
        );

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).ok().unwrap().as_secs();
    let message = [
        DEVICE_MESSAGE_PREFIX,
        args.product_mint_pubkey.as_ref(),
        user.pubkey().as_ref(),
        &timestamp.to_le_bytes(),
    ].concat();

    let latest_block = client.get_latest_blockhash().unwrap();
    let signature = sign(args.signature_type, &device, &message);

    let transaction = Transaction::new_signed_with_payer(
        &[ActivateDeviceBuilder::new()
            .token2022_program(token_program_id)
            .instructions(instructions_id)
            .payer(payer.pubkey())
            .device(device_pubkey)
            .vendor(args.vendor_pubkey)
            .product_mint(args.product_mint_pubkey)
            .product_associated_token(product_atoken_pubkey)
            .owner(user.pubkey())
            .device_mint(did_mint_pubkey)
            .device_associated_token(did_atoken_pubkey)
            .signature(signature)
            .timestamp(timestamp)
            .instruction()],
        Some(&payer.pubkey()),
        &[&user, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("User:    {}", user.pubkey());
            println!("Device:  {}", device_pubkey);
            println!("Mint:    {}", did_mint_pubkey);
            println!("AToken:  {}", did_atoken_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}

fn sign(signature_type: SignatureType, keypair: &Keypair, message: &[u8]) -> DeviceActivationSignature {
    match signature_type {
        SignatureType::Ed25519 => {
            let signature = keypair.sign_message(message);
            DeviceActivationSignature::Ed25519(*array_ref![signature.as_ref(), 0, 64])
        }
        SignatureType::Secp256k1 => {
            let device_secp256k1_priv_key =
                libsecp256k1::SecretKey::parse(keypair.secret().as_bytes()).unwrap();
            let message_hash = keccak::hash(message);
            let (signature, recovery_id) = libsecp256k1::sign(
                &libsecp256k1::Message::parse(&message_hash.to_bytes()),
                &device_secp256k1_priv_key,
            );
            DeviceActivationSignature::Secp256k1(signature.serialize(), recovery_id.serialize())
        }
        SignatureType::EthSecp256k1 => {
            let device_secp256k1_priv_key =
                libsecp256k1::SecretKey::parse(keypair.secret().as_bytes()).unwrap();
            let eth_message = [
                EIP191_MESSAGE_PREFIX,
                message.len().to_string().as_bytes(),
                message,
            ].concat();
            let message_hash = keccak::hash(&eth_message);
            let (signature, recovery_id) = libsecp256k1::sign(
                &libsecp256k1::Message::parse(&message_hash.to_bytes()),
                &device_secp256k1_priv_key,
            );
            DeviceActivationSignature::EthSecp256k1(signature.serialize(), recovery_id.serialize())
        }
    }
}

fn generate_message(args: GenerateMessageCliArgs) {
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);
    let product_mint_pubkey = args.product_pubkey;
    let device_pubkey = args.device_pubkey;

    let (did_mint_pubkey, _did_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
        &program_id,
    );

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).ok().unwrap().as_secs();
    let message = [
        DEVICE_MESSAGE_PREFIX,
        did_mint_pubkey.as_ref(),
        args.user_pubkey.as_ref(),
        &timestamp.to_le_bytes(),
    ].concat();

    assert_eq!(message.len(), 96);
    assert_eq!(array_ref![message, 0, 24], DEVICE_MESSAGE_PREFIX);
    assert_eq!(array_ref![message, 24, 32], did_mint_pubkey.as_ref());
    assert_eq!(array_ref![message, 56, 32], args.user_pubkey.as_ref());
    assert_eq!(array_ref![message, 88, 8], &timestamp.to_le_bytes());

    eprintln!("Device Mint: {}", did_mint_pubkey);
    eprintln!("User Pubkey: {}", args.user_pubkey);
    eprintln!("Timestamp: {}", timestamp);

    let msg = hex::encode(&message);

    if args.no_prefix {
        println!("{}", msg);
    } else {
        println!("0x{}", msg);
    }
}

fn decode_hex(hex_string: String) -> Vec<u8> {
    if hex_string.starts_with("0x") {
        hex::decode(&hex_string.as_bytes()[2..]).unwrap()
    } else {
        hex::decode(hex_string).unwrap()
    }
}

fn sign_message(args: SignMessageCliArgs) {
    let keypair = read_key(&args.keypair);
    let message = decode_hex(args.message);

    match sign(args.signature_type, &keypair, &message) {
        DeviceActivationSignature::Ed25519(signature_bytes) => {
            eprintln!("Pubkey: {}", keypair.pubkey());
            println!("Signature: 0x{}", hex::encode(signature_bytes));
        },
        DeviceActivationSignature::Secp256k1(signature_bytes, recovery_id) |
        DeviceActivationSignature::EthSecp256k1(signature_bytes, recovery_id) => {
            println!("Signature: {}{}", hex::encode(&signature_bytes), hex::encode(&[recovery_id]));
        },
    }
}

fn activate_device_offchain(args: ActivateDeviceOffchainCliArgs) {
    let client = get_client(&args.common.url);
    let program_id = args.common.program_id.unwrap_or(PROGRAM_ID);
    let token_program_id = spl_token_2022::ID;
    let instructions_id = instructions::ID;

    let device_pubkey = args.device_pubkey;
    let user = read_key(&args.user_keypair);
    let payer = read_key(&args.common.payer.unwrap_or(args.user_keypair));

    let product_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &device_pubkey,
            &args.product_mint_pubkey,
            &token_program_id,
        );

    let (did_mint_pubkey, _did_mint_bump) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            args.product_mint_pubkey.as_ref(),
            device_pubkey.as_ref(),
        ],
        &program_id,
    );

    let did_atoken_pubkey =
        spl_associated_token_account::get_associated_token_address_with_program_id(
            &user.pubkey(),
            &did_mint_pubkey,
            &token_program_id,
        );

    let decoded_message = decode_hex(args.message);
    let message = match args.signature_type {
        SignatureType::Ed25519 => decoded_message.as_slice(),
        SignatureType::Secp256k1 => decoded_message.as_slice(),
        SignatureType::EthSecp256k1 => decoded_message.as_slice().last_chunk::<96>().unwrap(),
    };

    assert_eq!(message.len(), 96);
    assert_eq!(array_ref![message, 0, 24], DEVICE_MESSAGE_PREFIX);
    assert_eq!(array_ref![message, 24, 32], did_mint_pubkey.as_ref());
    assert_eq!(array_ref![message, 56, 32], user.pubkey().as_ref());

    let timestamp = u64::from_le_bytes(*array_ref![message, 88, 8]);

    let signature = match args.signature_type {
        SignatureType::Ed25519 => {
            let decoded_signature = Signature::try_from(decode_hex(args.signature)).unwrap();
            assert!(decoded_signature.verify(device_pubkey.as_ref(), message));
            DeviceActivationSignature::Ed25519(*array_ref![decoded_signature.as_ref(), 0, 64])
        }
        SignatureType::Secp256k1 => {
            let decoded_signature = decode_hex(args.signature);
            assert_eq!(decoded_signature.len(), 65);
            let signature_bytes = *array_ref![decoded_signature, 0, 64];
            let recovery_id = decoded_signature[64];
            DeviceActivationSignature::Secp256k1(signature_bytes, recovery_id)
        }
        SignatureType::EthSecp256k1 => {
            let decoded_signature = decode_hex(args.signature);
            assert_eq!(decoded_signature.len(), 65);
            let signature_bytes = *array_ref![decoded_signature, 0, 64];
            let recovery_id = decoded_signature[64];
            DeviceActivationSignature::EthSecp256k1(signature_bytes, recovery_id)
        }
    };

    let latest_block = client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[ActivateDeviceBuilder::new()
            .token2022_program(token_program_id)
            .instructions(instructions_id)
            .payer(payer.pubkey())
            .device(device_pubkey)
            .vendor(args.vendor_pubkey)
            .product_mint(args.product_mint_pubkey)
            .product_associated_token(product_atoken_pubkey)
            .owner(user.pubkey())
            .device_mint(did_mint_pubkey)
            .device_associated_token(did_atoken_pubkey)
            .signature(signature)
            .timestamp(timestamp)
            .instruction()],
        Some(&payer.pubkey()),
        &[&user, &payer],
        latest_block,
    );

    match client.send_and_confirm_transaction(&transaction) {
        Ok(sig) => {
            println!("Success: {:?}", sig);
            println!("User   {}", user.pubkey());
            println!("Device {}", device_pubkey);
            println!("Mint   {}", did_mint_pubkey);
            println!("AToken {}", did_atoken_pubkey);
        }
        Err(err) => {
            eprintln!("Error: {:?}", err);
        }
    };
}
