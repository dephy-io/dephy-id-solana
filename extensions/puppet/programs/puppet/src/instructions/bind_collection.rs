use crate::errors::ErrorCode;
use crate::state::{DeviceCollectionBinding, NFTCollectionBinding};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

#[derive(Accounts)]
#[instruction(
    params: BindCollectionParams
)]
pub struct BindCollection<'info> {
    /// CHECK:
    #[account(
        constraint = product_mint_account.key() == params.device_collection,
        seeds = [b"DePHY_ID-PRODUCT", payer.key().as_ref(), params.product_metadata_name.as_ref()], 
        bump = params.product_mint_bump,
        seeds::program = params.dephy_id_program.key()
    )]
    pub product_mint_account: AccountInfo<'info>,
    #[account(
        constraint = nft_mint_account.key() == params.nft_collection,
    )]
    pub nft_mint_account: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"device_collection_binding", product_mint_account.key().as_ref()], 
        bump
    )]
    pub device_collection_binding: Account<'info, DeviceCollectionBinding>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"nft_collection_binding", nft_mint_account.key().as_ref()], 
        bump
    )]
    pub nft_collection_binding: Account<'info, NFTCollectionBinding>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BindCollectionParams {
    pub dephy_id_program: Pubkey,
    pub product_mint_bump: u8,
    pub product_metadata_name: String,
    pub device_collection: Pubkey,
    pub nft_collection: Pubkey
}

pub fn bind_collection(ctx: Context<BindCollection>, params: BindCollectionParams) -> Result<()> {
    let device_collection_binding = &mut ctx.accounts.device_collection_binding;
    let nft_collection_binding = &mut ctx.accounts.nft_collection_binding;

    require_keys_eq!(
        device_collection_binding.nft_collection,
        Pubkey::default(),
        ErrorCode::DeviceCollectionAlreadyBound
    );

    require_keys_eq!(
        nft_collection_binding.device_collection,
        Pubkey::default(),
        ErrorCode::NFTCollectionAlreadyBound
    );

    device_collection_binding.nft_collection = params.nft_collection;
    nft_collection_binding.device_collection = params.device_collection;

    Ok(())
}
