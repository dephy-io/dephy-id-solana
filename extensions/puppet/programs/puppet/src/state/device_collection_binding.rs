use anchor_lang::prelude::*;

#[account]
pub struct DeviceCollectionBinding {
    pub mpl_collection: Pubkey,
    pub bump: u8,
}
