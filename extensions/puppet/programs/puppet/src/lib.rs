use anchor_lang::prelude::*;
use instructions::*;

pub mod constants;
pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("6nxvjh3D3kLkkb25sgRUdyomfYqeoUv7gfRFgcScy6jN");

#[program]
pub mod puppet {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        instructions::initialize(ctx, params)
    }

    pub fn bind_collection(ctx: Context<BindCollection>, params: BindCollectionParams) -> Result<()> {
        instructions::bind_collection(ctx, params)
    }

    pub fn bind(ctx: Context<Bind>, params: BindParams) -> Result<()> {
        instructions::bind(ctx, params)
    }

    pub fn check_bound_by_device(ctx: Context<Bound>, device: Pubkey) -> Result<bool> {
        instructions::check_bound_by_device(ctx, device)
    }

    pub fn check_bound_by_nft(ctx: Context<Bound>, nft: Pubkey) -> Result<bool> {
        instructions::check_bound_by_nft(ctx, nft)
    }

    pub fn get_nft_by_device(ctx: Context<Bound>, device: Pubkey) -> Result<Pubkey> {
        instructions::get_nft_by_device(ctx, device)
    }

    pub fn get_device_by_nft(ctx: Context<Bound>, nft: Pubkey) -> Result<Pubkey> {
        instructions::get_device_by_nft(ctx, nft)
    }
}
