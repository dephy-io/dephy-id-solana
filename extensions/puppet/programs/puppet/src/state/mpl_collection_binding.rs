use anchor_lang::prelude::*;

#[account]
pub struct MplCollectionBinding {
    pub device_collection: Pubkey,
    pub bump: u8,
}
