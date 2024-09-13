use crate::constants::{DEVICE_MINT_SEED_PREFIX, DEPHY_ID_PROGRAM};
use crate::errors::ErrorCode;
use crate::state::{DeviceBinding, DeviceCollectionBinding, MplBinding, MplCollectionBinding};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::get_associated_token_address_with_program_id;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
#[instruction(
    params: BindParams
)]
pub struct Bind<'info> {
    #[account(
        constraint = mpl_associated_token.key() == params.mpl_ata,
        constraint = mpl_associated_token.owner == owner.key() @ ErrorCode::NotNFTOwner
    )]
    pub mpl_associated_token: Account<'info, TokenAccount>,
    #[account(
        constraint = device_associated_token.owner == owner.key() @ ErrorCode::NotDeviceOwner
    )]
    pub device_associated_token: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"device_binding", device_associated_token.key().as_ref()], 
        bump
    )]
    pub device_binding: Account<'info, DeviceBinding>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"mpl_binding", mpl_associated_token.key().as_ref()], 
        bump
    )]
    pub mpl_binding: Account<'info, MplBinding>,
    pub device_collection_binding: Account<'info, DeviceCollectionBinding>,
    pub mpl_collection_binding: Account<'info, MplCollectionBinding>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BindParams {
    pub device: Pubkey,
    pub mpl_ata: Pubkey,
}

pub fn bind(ctx: Context<Bind>, params: BindParams) -> Result<()> {
    let device_binding = &mut ctx.accounts.device_binding;
    let mpl_binding = &mut ctx.accounts.mpl_binding;

    let (device_mint_pubkey, _) = Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            ctx.accounts.mpl_collection_binding.device_collection.as_ref(),
            params.device.as_ref(),
        ],
        &DEPHY_ID_PROGRAM,
    );

    let device_ata = get_associated_token_address_with_program_id(
        &ctx.accounts.payer.key(),
        &device_mint_pubkey,
        &DEPHY_ID_PROGRAM,
    );

    require_keys_eq!(
        ctx.accounts.device_associated_token.key(),  
        device_ata, 
        ErrorCode::DeviceAssociatedTokenDoesNotMatch
    );

    require_keys_eq!(
        ctx.accounts.device_associated_token.mint,
        device_mint_pubkey,
        ErrorCode::DeviceCollectionDoesNotMatch
    );

    require_keys_eq!(
        ctx.accounts.mpl_associated_token.mint,
        ctx.accounts.device_collection_binding.mpl_collection,
        ErrorCode::MplCollectionDoesNotMatch
    );

    require_keys_eq!(
        device_binding.mpl_ata,
        Pubkey::default(),
        ErrorCode::DeviceAlreadyBound
    );

    require_keys_eq!(
        mpl_binding.device_ata,
        Pubkey::default(),
        ErrorCode::NFTAlreadyBound
    );

    device_binding.mpl_ata = params.mpl_ata;
    mpl_binding.device_ata = params.device;

    Ok(())
}
