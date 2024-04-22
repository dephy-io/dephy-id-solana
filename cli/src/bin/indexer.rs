use clap::{command, Parser};
use migration::{tx, Migrator, MigratorTrait};
use sea_orm::{ActiveModelTrait, ConnectOptions, Database};
use solana_client::{
    pubsub_client::PubsubClient,
    rpc_config::RpcTransactionLogsConfig,
    rpc_response::{Response, RpcLogsResponse, RpcResponseContext},
};
use solana_sdk::{
    commitment_config::{CommitmentConfig, CommitmentLevel},
    signature::Signature,
};
use std::str::FromStr;

#[derive(Debug, Parser)]
#[command(name = "dephy-indexer")]
struct Cli {
    #[arg(short, default_value = "ws://127.0.0.1:8900")]
    url: String,
    #[arg(short)]
    dephy: Option<String>,
    #[arg(long = "db", default_value = "sqlite://dephy_id.sqlite?mode=rwc")]
    database_url: String,
    /// max, recent, root, single, singlegossip, processed, confirmed, finalized
    #[arg(long, default_value_t = CommitmentLevel::Finalized)]
    commitment: CommitmentLevel,
}

#[tokio::main]
async fn main() {
    let args = Cli::parse();

    let dephy = args
        .dephy
        .unwrap_or(dephy_io_dephy_id_client::ID.to_string());

    let db_opts = ConnectOptions::new(args.database_url);
    let db = Database::connect(db_opts)
        .await
        .expect("Can't open database connection");
    Migrator::up(&db, None).await.expect("DB migration failed");

    let (_client, receiver) = PubsubClient::logs_subscribe(
        &args.url,
        solana_client::rpc_config::RpcTransactionLogsFilter::Mentions(vec![dephy]),
        RpcTransactionLogsConfig {
            commitment: Some(CommitmentConfig {
                commitment: args.commitment,
            }),
        },
    )
    .expect("Can't connect to server");

    println!("DePHY indexer running...");

    loop {
        match receiver.recv() {
            Ok(Response {
                context:
                    RpcResponseContext {
                        slot,
                        api_version: _,
                    },
                value:
                    RpcLogsResponse {
                        signature,
                        err,
                        logs,
                    },
            }) => {
                println!("{} {} {:?}", slot, signature, err);
                let signature = Signature::from_str(&signature.to_string())
                    .expect("bad signature")
                    .as_ref()
                    .to_vec();
                let tx = tx::new(slot, signature, err, logs);
                tx.insert(&db).await.expect("Insert failed");
            }
            Err(err) => {
                eprintln!("Error: {:?}", err);
                break;
            }
        }
    }
}
