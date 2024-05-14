use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum KwilExampleInstruction {
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="dephy_program", desc = "The DePHY program")]
    #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(3, signer, name="authority", desc = "The Kwil authority")]
    #[account(4, writable, name="kwil_account", desc = "The Kwil account")]
    CreateKwil(CreateKwilArgs),

    /// Create Kwil ACL
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="dephy_program", desc = "The DePHY program")]
    #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(3, signer, name="authority", desc = "The Kwil authority")]
    #[account(4, name="kwil_account", desc = "The Kwil account")]
    #[account(5, name="vendor", desc = "Vendor of the Device")]
    #[account(6, name="product_mint", desc = "Product of the Device")]
    #[account(7, name="device", desc = "The Device pubkey")]
    #[account(8, name="product_atoken", desc = "The Product atoken for Device")]
    #[account(9, name="user", desc = "The Device Owner pubkey")]
    #[account(10, name="did_mint", desc = "The NFT mint account")]
    #[account(11, name="did_atoken", desc = "The NFT atoken account")]
    #[account(12, writable, name="kwil_acl_account", desc = "The Kwil ACL account")]
    UpdateAcl(UpdateAclArgs),
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateKwilArgs {
    pub bump: u8,
    pub kwil_signer: [u8; 20],
}


#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct UpdateAclArgs {
    pub bump: u8,
    pub read_level: u8,
    pub write_level: u8,
    /// The caller address
    pub subject: [u8; 20],
    pub target: String,
}

