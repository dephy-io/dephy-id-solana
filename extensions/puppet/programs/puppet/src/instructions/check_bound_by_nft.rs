use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use super::Bound;

pub fn check_bound_by_nft(ctx: Context<Bound>, nft: Pubkey) -> Result<bool> {
    if ctx.accounts.device_binding.mpl_ata != nft {
        return Err(ErrorCode::NFTDoesNotMatch.into());
    }
    Ok(ctx.accounts.mpl_binding.device_ata != Pubkey::default())
}