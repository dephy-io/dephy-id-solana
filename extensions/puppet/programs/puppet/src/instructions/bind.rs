use crate::errors::ErrorCode;
use crate::state::{DeviceBinding, NFTBinding};
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
#[instruction(
    params: BindParams
)]
pub struct Bind<'info> {
    #[account(
        constraint = nft_account.key() == params.nft,
        constraint = nft_account.owner == payer.key() @ ErrorCode::PayerDoesNotOwnNFT
    )]
    pub nft_account: Account<'info, TokenAccount>,
    #[account(
        constraint = device_account.key() == params.device,
        constraint = device_account.owner == payer.key() @ ErrorCode::PayerDoesNotOwnDevice
    )]
    pub device_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"device_binding", device_account.key().as_ref()], 
        bump
    )]
    pub device_binding: Account<'info, DeviceBinding>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"nft_binding", nft_account.key().as_ref()], 
        bump
    )]
    pub nft_binding: Account<'info, NFTBinding>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BindParams {
    pub device: Pubkey,
    pub nft: Pubkey,
}

pub fn bind(ctx: Context<Bind>, params: BindParams) -> Result<()> {
    ctx.accounts.device_binding.nft = params.nft;
    ctx.accounts.nft_binding.device = params.device;

    Ok(())
}
