use anchor_lang::prelude::*;

#[account]
pub struct Global {
    pub dephy_id_program: Pubkey,
    pub bump: u8,
}