use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use super::Bound;

pub fn get_nft_by_device(ctx: Context<Bound>, device: Pubkey) -> Result<Pubkey> {
    if ctx.accounts.nft_binding.device != device {
        return Err(ErrorCode::DeviceDoesNotMatch.into());
    }
    Ok(ctx.accounts.device_binding.nft)
}