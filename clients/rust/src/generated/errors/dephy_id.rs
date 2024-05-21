//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use num_derive::FromPrimitive;
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum DephyIdError {
    /// 0 - Error deserializing an account
    #[error("Error deserializing an account")]
    DeserializationError = 0x0,
    /// 1 - Error serializing an account
    #[error("Error serializing an account")]
    SerializationError = 0x1,
    /// 2 - Invalid program owner. This likely mean the provided account does not exist
    #[error("Invalid program owner. This likely mean the provided account does not exist")]
    InvalidProgramOwner = 0x2,
    /// 3 - Invalid PDA derivation
    #[error("Invalid PDA derivation")]
    InvalidPda = 0x3,
    /// 4 - Expected empty account
    #[error("Expected empty account")]
    ExpectedEmptyAccount = 0x4,
    /// 5 - Expected non empty account
    #[error("Expected non empty account")]
    ExpectedNonEmptyAccount = 0x5,
    /// 6 - Expected signer account
    #[error("Expected signer account")]
    ExpectedSignerAccount = 0x6,
    /// 7 - Expected writable account
    #[error("Expected writable account")]
    ExpectedWritableAccount = 0x7,
    /// 8 - Account mismatch
    #[error("Account mismatch")]
    AccountMismatch = 0x8,
    /// 9 - Invalid account key
    #[error("Invalid account key")]
    InvalidAccountKey = 0x9,
    /// 10 - Numerical overflow
    #[error("Numerical overflow")]
    NumericalOverflow = 0xA,
    /// 11 - Missing instruction
    #[error("Missing instruction")]
    MissingInstruction = 0xB,
}

impl solana_program::program_error::PrintProgramError for DephyIdError {
    fn print<E>(&self) {
        solana_program::msg!(&self.to_string());
    }
}
