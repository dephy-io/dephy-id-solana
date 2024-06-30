use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum WalletInstruction {
    /// Creates the wallet account derived from the provided authority.
    #[account(0, writable, name="wallet", desc = "The program derived address of the wallet account to create (seeds: ['WALLET', authority])")]
    #[account(1, signer, name="authority", desc = "The authority of the wallet")]
    #[account(2, name="vault", desc = "The wallet vault (seeds: ['VAULT', wallet])")]
    #[account(3, name="vendor", desc="The vendor")]
    #[account(4, name="product_mint", desc="The mint account for the product")]
    #[account(5, name="product_associated_token", desc="The associated token account for the product")]
    #[account(6, name="device", desc="The device")]
    #[account(7, name="device_mint", desc="The mint account for the device")]
    #[account(8, name="device_associated_token", desc = "DID associated token owned by authority")]
    #[account(9, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(10, name="system_program", desc = "The system program")]
    #[account(11, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(12, name="ata_program", desc="The associated token program")]
    // #[account(13, name="dephy_id_program", desc="The DePHY ID program")]
    Create { bump: u8 },

    /// Proxy call
    #[account(0, name="wallet", desc = "The program derived address of the wallet account to increment (seeds: ['WALLET', authority])")]
    #[account(1, signer, name="authority", desc = "The authority of the wallet")]
    #[account(2, name="vault", desc = "The wallet vault (seeds: ['VAULT', wallet])")]
    #[account(3, name="target_program", desc = "The proxy called program")]
    ProxyCall { ix_data: Vec<u8> },
}
