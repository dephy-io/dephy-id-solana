use crate::constants::{DEPHY_ID_PROGRAM, PRODUCT_MINT_SEED_PREFIX};
use crate::errors::ErrorCode;
use crate::state::{DeviceCollectionBinding, MplCollectionBinding};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(
    params: BindCollectionParams
)]
pub struct BindCollection<'info> {
    /// CHECK:
    #[account(
        constraint = product_mint.key() == params.device_collection,
        seeds = [PRODUCT_MINT_SEED_PREFIX, vendor.key().as_ref(), params.product_metadata_name.as_ref()], 
        bump,
        seeds::program = dephy_id_program.key()
    )]
    pub product_mint: AccountInfo<'info>,
    /// CHECK: We will manually verify the metadata structure
    #[account(
        constraint = mpl_collection.key() == params.mpl_collection,
    )]
    pub mpl_collection: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"device_collection_binding", product_mint.key().as_ref()], 
        bump
    )]
    pub device_collection_binding: Account<'info, DeviceCollectionBinding>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"mpl_collection_binding", mpl_collection.key().as_ref()], 
        bump
    )]
    pub mpl_collection_binding: Account<'info, MplCollectionBinding>,
    /// CHECK: This is the hardcoded DePhy ID Program address passed in as an AccountInfo
    #[account(address = DEPHY_ID_PROGRAM)]
    pub dephy_id_program: AccountInfo<'info>,
    #[account(mut)]
    pub vendor: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BindCollectionParams {
    pub product_metadata_name: String,
    pub device_collection: Pubkey,
    pub mpl_collection: Pubkey
}

pub fn bind_collection(ctx: Context<BindCollection>, params: BindCollectionParams) -> Result<()> {
    let device_collection_binding = &mut ctx.accounts.device_collection_binding;
    let mpl_collection_binding = &mut ctx.accounts.mpl_collection_binding;

    require_keys_eq!(
        device_collection_binding.mpl_collection,
        Pubkey::default(),
        ErrorCode::DeviceCollectionAlreadyBound
    );

    require_keys_eq!(
        mpl_collection_binding.device_collection,
        Pubkey::default(),
        ErrorCode::MplCollectionAlreadyBound
    );

    device_collection_binding.mpl_collection = params.mpl_collection;
    mpl_collection_binding.device_collection = params.device_collection;

    Ok(())
}