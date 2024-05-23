pub mod assertions;
pub mod constants;
pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;
#[cfg(feature = "ed25519-sign")]
mod ed25519;
mod secp256k1;

pub use constants::*;
pub use solana_program;

solana_program::declare_id!("DiSU1nme5VJvMdry5FYhfw6LLFb3HUFLkCLZDe53x3PV");
