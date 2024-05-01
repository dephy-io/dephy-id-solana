//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use num_derive::FromPrimitive;
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum DephyIdError {
    /// 0 (0x0) - Error deserializing an account
    #[error("Error deserializing an account")]
    DeserializationError,
    /// 1 (0x1) - Error serializing an account
    #[error("Error serializing an account")]
    SerializationError,
    /// 2 (0x2) - Invalid program owner. This likely mean the provided account does not exist
    #[error("Invalid program owner. This likely mean the provided account does not exist")]
    InvalidProgramOwner,
    /// 3 (0x3) - Invalid PDA derivation
    #[error("Invalid PDA derivation")]
    InvalidPda,
    /// 4 (0x4) - Expected empty account
    #[error("Expected empty account")]
    ExpectedEmptyAccount,
    /// 5 (0x5) - Expected non empty account
    #[error("Expected non empty account")]
    ExpectedNonEmptyAccount,
    /// 6 (0x6) - Expected signer account
    #[error("Expected signer account")]
    ExpectedSignerAccount,
    /// 7 (0x7) - Expected writable account
    #[error("Expected writable account")]
    ExpectedWritableAccount,
    /// 8 (0x8) - Account mismatch
    #[error("Account mismatch")]
    AccountMismatch,
    /// 9 (0x9) - Invalid account key
    #[error("Invalid account key")]
    InvalidAccountKey,
    /// 10 (0xA) - Numerical overflow
    #[error("Numerical overflow")]
    NumericalOverflow,
    /// 11 (0xB) - Missing instruction
    #[error("Missing instruction")]
    MissingInstruction,
}

impl solana_program::program_error::PrintProgramError for DephyIdError {
    fn print<E>(&self) {
        solana_program::msg!(&self.to_string());
    }
}
