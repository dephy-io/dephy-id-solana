use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankAccount;
use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::msg;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;

use crate::error::ConduitsError;

#[derive(Clone, BorshSerialize, BorshDeserialize, Debug)]
pub enum Key {
    Uninitialized,
    App,
    ListingInfo,
    RentalInfo,
}


#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct App {
    pub key: Key,
    pub authority: Pubkey,
    pub mint: Pubkey,
}

impl App {
    pub const LEN: usize = 1 + 32 + 32;

    pub const SEEDS_PREFIX: &'static [u8] = b"CONDUITS_APP";

    pub const MINT_SEEDS_PREFIX: &'static [u8] = b"CONDUITS_APP_MINT";

    pub fn seeds<'a>() -> Vec<&'a [u8]> {
        vec![Self::SEEDS_PREFIX]
    }

    pub fn find_pda(program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::seeds(), program_id)
    }

    pub fn mint_seeds<'a>() -> Vec<&'a [u8]> {
        vec![Self::MINT_SEEDS_PREFIX]
    }

    pub fn find_mint_pda(program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::mint_seeds(), program_id)
    }

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        App::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            ConduitsError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            ConduitsError::SerializationError.into()
        })
    }
}


#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct ListingInfo {
    pub key: Key,
    pub app_account: Pubkey,
    pub device: Pubkey,
    pub rent_token_mint: Pubkey,
    pub min_rental_days: u64,
    pub max_rental_days: u64,
    pub rent_per_day: u64,
    pub renting: bool,
}

impl ListingInfo {
    pub const LEN: usize = 1 + 32 + 32 + 32 + 8 + 8 + 8 + 1;

    pub const SEEDS_PREFIX: &'static [u8] = b"CONDUITS_LISTING";

    pub fn seeds<'a>(device: &'a Pubkey) -> Vec<&'a [u8]> {
        vec![
            Self::SEEDS_PREFIX,
            device.as_ref(),
        ]
    }

    pub fn find_pda(program_id: &Pubkey, device: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::seeds(device), program_id)
    }

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        ListingInfo::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            ConduitsError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            ConduitsError::SerializationError.into()
        })
    }
}


#[repr(C)]
#[derive(Clone, BorshSerialize, BorshDeserialize, Debug, ShankAccount)]
pub struct RentalInfo {
    pub key: Key,
    pub listing_info: Pubkey,
    pub tenant: Pubkey,
    pub start_time: u64,
    pub end_time: u64,
    pub rental_days: u64,
    pub total_paid_rent: u64,
}

impl RentalInfo {
    pub const LEN: usize = 1 + 32 + 32 + 8 + 8 + 8 + 8;

    pub const SEEDS_PREFIX: &'static [u8] = b"CONDUITS_RENTAL";

    pub fn seeds<'a>(listing_info: &'a Pubkey) -> Vec<&'a [u8]> {
        vec![
            Self::SEEDS_PREFIX,
            listing_info.as_ref(),
        ]
    }

    pub fn find_pda(listing_info: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::seeds(listing_info), &crate::ID)
    }

    pub fn load(account: &AccountInfo) -> Result<Self, ProgramError> {
        let mut bytes: &[u8] = &(*account.data).borrow();
        RentalInfo::deserialize(&mut bytes).map_err(|error| {
            msg!("Error: {}", error);
            ConduitsError::DeserializationError.into()
        })
    }

    pub fn save(&self, account: &AccountInfo) -> ProgramResult {
        borsh::to_writer(&mut account.data.borrow_mut()[..], self).map_err(|error| {
            msg!("Error: {}", error);
            ConduitsError::SerializationError.into()
        })
    }
}


pub struct AccessIdentity {
}

impl AccessIdentity {
    pub const SEEDS_PREFIX: &'static [u8] = b"CONDUITS_ACCESS_IDENTITY";

    pub fn seeds<'a>(device: &'a Pubkey) -> Vec<&'a [u8]> {
        vec![
            Self::SEEDS_PREFIX,
            device.as_ref(),
        ]
    }

    pub fn find_pda(program_id: &Pubkey, device: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&Self::seeds(device), program_id)
    }
}
