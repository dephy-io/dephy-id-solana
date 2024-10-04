pub mod assertions;
pub mod constants;
#[cfg(feature = "ed25519-sign")]
mod ed25519;
pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
mod secp256k1;
pub mod state;
pub mod utils;

pub use constants::*;
pub use solana_program;

solana_program::declare_id!("hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1");
