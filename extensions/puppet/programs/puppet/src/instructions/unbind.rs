use crate::errors::ErrorCode;
use crate::state::{DeviceBinding, NFTBinding};
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct Unbind<'info> {
    #[account(
        constraint = nft_account.owner == payer.key() @ ErrorCode::PayerDoesNotOwnNFT
    )]
    pub nft_account: Account<'info, TokenAccount>,
    #[account(
        constraint = device_account.owner == payer.key() @ ErrorCode::PayerDoesNotOwnDevice
    )]
    pub device_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = device_binding.nft == nft_account.key() @ ErrorCode::NFTDoesNotMatch
    )]
    pub device_binding: Account<'info, DeviceBinding>,
    #[account(
        mut,
        constraint = nft_binding.device == device_account.key() @ ErrorCode::DeviceDoesNotMatch
    )]
    pub nft_binding: Account<'info, NFTBinding>,
    pub payer: Signer<'info>,
}

pub fn unbind(ctx: Context<Unbind>) -> Result<()> {
    ctx.accounts.device_binding.nft = Pubkey::default(); 
    ctx.accounts.nft_binding.device = Pubkey::default(); 

    Ok(())
}