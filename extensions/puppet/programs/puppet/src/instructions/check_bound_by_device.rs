use crate::errors::ErrorCode;
use crate::state::{DeviceBinding, MplBinding};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Bound<'info> {
    pub device_binding: Account<'info, DeviceBinding>,
    pub mpl_binding: Account<'info, MplBinding>,
}

pub fn check_bound_by_device(ctx: Context<Bound>, device: Pubkey) -> Result<bool> {
    if ctx.accounts.mpl_binding.device_ata != device {
        return Err(ErrorCode::DeviceDoesNotMatch.into());
    }
    Ok(ctx.accounts.device_binding.mpl_ata != Pubkey::default())
}