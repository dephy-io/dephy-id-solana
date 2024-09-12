use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use super::Bound;

pub fn get_nft_by_device(ctx: Context<Bound>, device: Pubkey) -> Result<Pubkey> {
    if ctx.accounts.mpl_binding.device_ata != device {
        return Err(ErrorCode::DeviceDoesNotMatch.into());
    }
    Ok(ctx.accounts.device_binding.mpl_ata)
}