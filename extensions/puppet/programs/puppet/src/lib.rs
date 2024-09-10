use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("6nxvjh3D3kLkkb25sgRUdyomfYqeoUv7gfRFgcScy6jN");

#[program]
pub mod puppet {
    use super::*;

    pub fn bind(ctx: Context<Bind>, params: BindParams) -> Result<()> {
        instructions::bind(ctx, params)
    }

    pub fn unbind(ctx: Context<Unbind>) -> Result<()> {
        instructions::unbind(ctx)
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
