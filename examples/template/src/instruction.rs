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

    /// Increments the demo by the provided amount or 1 if no amount is provided.
    #[account(0, writable, name="demo", desc = "The program derived address of the demo account to increment (seeds: ['DEMO'])")]
    #[account(1, signer, name="authority", desc = "The authority of the demo")]
    Increment { amount: Option<u32> },
}


#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct InitArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

