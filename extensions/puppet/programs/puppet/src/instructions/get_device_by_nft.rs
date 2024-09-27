use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use super::Bound;

pub fn get_device_by_nft(ctx: Context<Bound>, nft: Pubkey) -> Result<Pubkey> {
    if ctx.accounts.device_binding.mpl_ata != nft {
        return Err(ErrorCode::NFTDoesNotMatch.into());
    }
    Ok(ctx.accounts.mpl_binding.device_ata)
}