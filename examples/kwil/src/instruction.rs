use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum DephyKwilInstruction {
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="dephy_program", desc = "The DePHY program")]
    #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(3, signer, name="authority", desc = "The Kwil authority")]
    #[account(4, name="did_atoken", desc = "The DID atoken account")]
    #[account(5, writable, name="kwil_account", desc = "The Kwil account")]
    CreateKwil(CreateKwilArgs),

    /// Create Kwil ACL
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, name="dephy_program", desc = "The DePHY program")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, signer, name="authority", desc = "The Kwil authority")]
    #[account(5, name="device", desc = "The Device pubkey")]
    #[account(6, writable, name="kwil_account", desc = "The Kwil account")]
    CreateAcl(CreateAclArgs),
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateKwilArgs {
    pub bump: u8,
}


#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateAclArgs {
    pub read_level: u8,
    pub write_level: u8,
    pub subject: String,
    pub target: String,
}

