use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use super::Bound;

pub fn check_bound_by_nft(ctx: Context<Bound>, nft: Pubkey) -> Result<bool> {
    if ctx.accounts.device_binding.nft != nft {
        return Err(ErrorCode::NFTDoesNotMatch.into());
    }
    Ok(ctx.accounts.nft_binding.device != Pubkey::default())
}