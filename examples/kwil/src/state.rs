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
    PublisherAccount,
    LinkedAccount,
    SubscriberAccount,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct PublisherAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: PublisherData,
}

impl PublisherAccount {
    pub const LEN: usize = 1 + 32 + PublisherData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        PublisherAccount::deserialize(&mut bytes).map_err(|error| {
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
pub struct PublisherData {
    pub bump: u8,
    pub eth_address: [u8; 20],
}

impl PublisherData {
    pub const LEN: usize = 1 + 20;
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct LinkedAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: LinkedData,
}

impl LinkedAccount {
    pub const LEN: usize = 1 + 32 + LinkedData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        LinkedAccount::deserialize(&mut bytes).map_err(|error| {
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
pub struct LinkedData {
    pub bump: u8,
    pub eth_address: [u8; 20],
}

impl LinkedData {
    pub const LEN: usize = 1 + 20;
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct SubscriberAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: SubscriberData,
}

impl SubscriberAccount {
    pub const LEN: usize = 1 + 32 + SubscriberData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        SubscriberAccount::deserialize(&mut bytes).map_err(|error| {
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
pub struct SubscriberData {
    pub bump: u8,
    pub publisher: Pubkey,
    pub linked: Pubkey,
}

impl SubscriberData {
    pub const LEN: usize = 1 + 32 + 32;
}
