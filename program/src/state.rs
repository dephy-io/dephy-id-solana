use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::error::Error;

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    ProgramDataAccount,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct ProgramDataAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: ProgramData,
}

impl ProgramDataAccount {
    pub const LEN: usize = 1 + 32 + ProgramData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        ProgramDataAccount::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            Error::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            Error::SerializationError.into()
        })
    }
}

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramData {
    pub bump: u8,
}

impl ProgramData {
    pub const LEN: usize = 1;
}
