use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum DephyInstruction {
    /// Create DePHY Account.
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(2, writable, name="dephy", desc = "The address of the DePHY account")]
    #[account(3, signer, name="authority", desc = "The authority of the DePHY account")]
    CreateDephy(CreateDephyArgs),

    /// DePHY register a Vendor
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The token 2022 program")]
    #[account(2, name="atoken_program", desc = "The associated token program")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, signer, name="authority", desc = "The DePHY authority")]
    #[account(5, name="dephy", desc = "The DePHY account")]
    #[account(6, name="vendor", desc = "Vendor account")]
    #[account(7, writable, name="vendor_mint", desc = "The Vendor mint")]
    #[account(8, writable, name="vendor_atoken", desc = "The atoken account for vendor")]
    CreateVendor(CreateVendorArgs),

    /// Vendor register a Product
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(3, signer, name="vendor", desc = "Vendor account")]
    #[account(4, writable, name="product_mint", desc = "The product mint account")]
    CreateProduct(CreateProductArgs),

    /// Vendor register a Device
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, name="atoken_program", desc = "The associated token program")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, signer, name="vendor", desc = "Vendor account")]
    #[account(5, signer, name="device", desc = "The Device account")]
    #[account(6, name="product_mint", desc = "The Product mint account")]
    #[account(7, writable, name="product_atoken", desc = "The Product atoken for Device")]
    CreateDevice(),

    /// User activate a Device
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, name="atoken_program", desc = "The associated token program")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, signer, name="device", desc = "The Device")]
    #[account(5, name="user", desc = "The Device Owner pubkey")]
    #[account(6, name="did_mint", desc = "The NFT mint account")]
    #[account(7, name="did_atoken", desc = "The NFT atoken account")]
    ActivateDevice(ActivateDeviceArgs),
}


#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateDephyArgs {
    pub bump: u8,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateVendorArgs {
    pub bump: u8,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateProductArgs {
    pub seed: [u8; 8],
    pub bump: u8,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateDeviceArgs {
    pub bump: u8,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct ActivateDeviceArgs {
    pub bump: u8,
}
