use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::error::KwilError;

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    KwilAccount,
    KwilAclAccount,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct KwilAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: KwilData,
}

impl KwilAccount {
    pub const LEN: usize = 1 + 32 + KwilData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        KwilAccount::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            KwilError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            KwilError::SerializationError.into()
        })
    }
}

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub struct KwilData {
    pub bump: u8,
    pub kwil_signer: [u8; 20],
}

impl KwilData {
    pub const LEN: usize = 1 + 20;
}


#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct KwilAclAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: KwilAclData,
}

impl KwilAclAccount {
    pub const LEN: usize = 1 + 32 + KwilAclData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        KwilAclAccount::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            KwilError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            KwilError::SerializationError.into()
        })
    }
}

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub struct KwilAclData {
    pub bump: u8,
    pub read_level: u8,
    pub write_level: u8,
    pub subject: [u8; 20],
    pub target_hash: [u8; 32],
}

impl KwilAclData {
    pub const LEN: usize = 1 + 1 + 1 + 20 + 32;
}

