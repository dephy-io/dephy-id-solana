use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::msg;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;

use crate::error::DemoError;

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    DemoAccount,
}

#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct DemoAccount {
    pub key: Key,
    pub authority: Pubkey,
    pub product_mint: Pubkey,
}

impl DemoAccount {
    pub const LEN: usize = 1 + 32 + 32;

    pub fn seeds() -> Vec<&'static [u8]> {
        vec![b"DEMO"]
    }

    pub fn find_pda() -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::seeds(), &crate::ID)
    }

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        DemoAccount::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            DemoError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            DemoError::SerializationError.into()
        })
    }
}
