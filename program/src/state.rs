use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::error::DephyError;

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    DephyAccount,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct DephyAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub data: DephyData,
}

impl DephyAccount {
    pub const LEN: usize = 1 + 32 + DephyData::LEN;

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        DephyAccount::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            DephyError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            DephyError::SerializationError.into()
        })
    }
}

///
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub struct DephyData {
    pub bump: u8,
}

impl DephyData {
    pub const LEN: usize = 1;
}
