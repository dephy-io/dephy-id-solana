use anchor_lang::prelude::*;

#[account]
pub struct DeviceBinding {
    pub nft: Pubkey,
    pub bump: u8,
}
