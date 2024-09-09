use anchor_lang::prelude::*;

#[account]
pub struct NFTBinding {
    pub device: Pubkey,
    pub bump: u8,
}
