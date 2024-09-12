use crate::errors::ErrorCode;
use crate::state::{DeviceBinding, DeviceCollectionBinding, NFTBinding, NFTCollectionBinding};
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
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"device_binding", device_account.key().as_ref()], 
        bump
    )]
    pub device_binding: Account<'info, DeviceBinding>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"nft_binding", nft_account.key().as_ref()], 
        bump
    )]
    pub nft_binding: Account<'info, NFTBinding>,
    pub device_collection_binding: Account<'info, DeviceCollectionBinding>,
    pub nft_collection_binding: Account<'info, NFTCollectionBinding>,
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
    let device_binding = &mut ctx.accounts.device_binding;
    let nft_binding = &mut ctx.accounts.nft_binding;

    require_keys_eq!(
        ctx.accounts.device_account.mint,
        ctx.accounts.nft_collection_binding.device_collection,
        ErrorCode::DeviceCollectionDoesNotMatch
    );

    require_keys_eq!(
        ctx.accounts.nft_account.mint,
        ctx.accounts.device_collection_binding.nft_collection,
        ErrorCode::NFTCollectionDoesNotMatch
    );

    require_keys_eq!(
        device_binding.nft,
        Pubkey::default(),
        ErrorCode::DeviceAlreadyBound
    );

    require_keys_eq!(
        nft_binding.device,
        Pubkey::default(),
        ErrorCode::NFTAlreadyBound
    );

    device_binding.nft = params.nft;
    nft_binding.device = params.device;

    Ok(())
}
