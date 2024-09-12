use anchor_lang::prelude::*;

#[account]
pub struct MplBinding {
    pub device_ata: Pubkey,
    pub bump: u8,
}
