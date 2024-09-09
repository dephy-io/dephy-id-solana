use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use super::Bound;

pub fn get_device_by_nft(ctx: Context<Bound>, nft: Pubkey) -> Result<Pubkey> {
    if ctx.accounts.device_binding.nft != nft {
        return Err(ErrorCode::NFTDoesNotMatch.into());
    }
    Ok(ctx.accounts.nft_binding.device)
}