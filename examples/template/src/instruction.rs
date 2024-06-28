use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum DemoInstruction {
    /// Creates the demo account derived from the provided authority.
    /// This will also create a DePHY ID Product with a PDA as vendor
    #[account(0, writable, name="demo", desc = "The program derived address of the demo account to create (seeds: ['DEMO'])")]
    #[account(1, signer, name="authority", desc = "The authority of the demo")]
    #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(3, name="system_program", desc = "The system program")]
    #[account(4, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(5, name="dephy_id", desc = "DePHY ID program id")]
    #[account(6, name="vendor", desc="PDA as product vendor (seeds: ['VENDOR'])")]
    #[account(7, writable, name="product_mint", desc="PDA of the product mint account (program: dephy_id, seeds: ['DePHY_ID-PRODUCT', vendor, PRODUCT_NAME])")]
    Init(InitArgs),

    /// Create a Virtual Device
    #[account(0, writable, name="demo", desc = "The program derived address of the demo account to increment (seeds: ['DEMO'])")]
    #[account(1, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(2, name="system_program", desc = "The system program")]
    #[account(3, name="token_2022_program", desc = "The SPL Token 2022 program")]
    #[account(4, name="ata_program", desc = "The associated token program")]
    #[account(5, name="dephy_id", desc = "DePHY ID program id")]
    #[account(6, name="vendor", desc = "PDA as product vendor (seeds: ['VENDOR'])")]
    #[account(7, name="product_mint", desc = "PDA of the product mint account (program: dephy_id, seeds: ['DePHY_ID-PRODUCT', vendor, PRODUCT_NAME])")]
    #[account(8, name="owner", desc="The device's owner")]
    #[account(9, name="device", desc = "PDA of the virtual device (seeds: ['DEVICE', owner])")]
    #[account(10, writable, name="product_atoken", desc="The associated token account of the product")]
    #[account(11, writable, name="device_mint", desc="The mint account of the device")]
    #[account(12, writable, name="device_atoken", desc="The associated token account for the device")]
    CreateVirtualDevice(CreateVirtualDeviceArgs),
}


#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct InitArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateVirtualDeviceArgs {
    pub challenge: u8,
}

