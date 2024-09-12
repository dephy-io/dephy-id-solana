use anchor_lang::prelude::*;

#[account]
pub struct NFTCollectionBinding {
    pub device_collection: Pubkey,
    pub bump: u8,
}
