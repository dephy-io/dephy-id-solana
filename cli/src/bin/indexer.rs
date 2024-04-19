use clap::{command, Parser};
use solana_sdk::commitment_config::{CommitmentConfig, CommitmentLevel};
use solana_client::{pubsub_client::PubsubClient, rpc_config::RpcTransactionLogsConfig};


#[derive(Debug, Parser)]
#[command(name = "dephy-indexer")]
struct Cli {
    #[arg(short, default_value = "ws://127.0.0.1:8900")]
    url: String,
    #[arg(short)]
    dephy: Option<String>,
    /// max, recent, root, single, singlegossip, processed, confirmed, finalized
    #[arg(long, default_value_t = CommitmentLevel::Finalized)]
    commitment: CommitmentLevel,
}


#[tokio::main]
async fn main() {
    let args = Cli::parse();

    let dephy = args.dephy.unwrap_or(dephy_io_dephy_id_client::ID.to_string());
    let (_client, receiver) = PubsubClient::logs_subscribe(
        &args.url,
        solana_client::rpc_config::RpcTransactionLogsFilter::Mentions(vec![dephy]),
        RpcTransactionLogsConfig {
            commitment: Some(CommitmentConfig {
                commitment: CommitmentLevel::Confirmed,
            }),
        },
    ).unwrap();

    println!("DePHY indexer running...");

    loop {
        match receiver.recv() {
            Ok(resp) => {
                println!("Response: {:?}", resp);
            }
            Err(err) => {
                eprintln!("Error: {:?}", err);
                break;
            }
        }
    }
}

