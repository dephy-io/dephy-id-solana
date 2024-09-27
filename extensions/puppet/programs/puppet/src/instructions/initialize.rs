use crate::state::Global;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct InitializeParams {
    pub dephy_id_program: Pubkey,
}

#[derive(Accounts)]
#[instruction(params: InitializeParams)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 1, 
        seeds = [b"global", payer.key().as_ref()],
        bump,
    )]
    pub global: Account<'info, Global>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    let global = &mut ctx.accounts.global;
    global.dephy_id_program = params.dephy_id_program;
    Ok(())
}
