use anchor_lang::prelude::*;

#[account]
pub struct DeviceCollectionBinding {
    pub nft_collection: Pubkey,
    pub bump: u8,
}
