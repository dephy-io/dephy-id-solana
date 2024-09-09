use crate::errors::ErrorCode;
use crate::state::{DeviceBinding, NFTBinding};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Bound<'info> {
    pub device_binding: Account<'info, DeviceBinding>,
    pub nft_binding: Account<'info, NFTBinding>,
}

pub fn check_bound_by_device(ctx: Context<Bound>, device: Pubkey) -> Result<bool> {
    if ctx.accounts.nft_binding.device != device {
        return Err(ErrorCode::DeviceDoesNotMatch.into());
    }
    Ok(ctx.accounts.device_binding.nft != Pubkey::default())
}