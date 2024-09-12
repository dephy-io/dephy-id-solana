use anchor_lang::prelude::*;

#[account]
pub struct DeviceBinding {
    pub mpl_ata: Pubkey,
    pub bump: u8,
}
