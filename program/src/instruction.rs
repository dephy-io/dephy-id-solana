use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

use crate::error::DephyError;

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
    #[account(2, name="ata_program", desc = "The associated token program")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, signer, name="authority", desc = "The DePHY authority")]
    #[account(5, name="dephy", desc = "The DePHY account")]
    #[account(6, name="vendor", desc = "The Vendor pubkey")]
    #[account(7, writable, name="vendor_mint", desc = "The Vendor mint")]
    #[account(8, writable, name="vendor_atoken", desc = "The atoken account for vendor")]
    CreateVendor(CreateVendorArgs),

    /// Vendor register a Product
    // TODO: PDA authority
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(3, signer, name="vendor", desc = "The Vendor pubkey")]
    #[account(4, writable, name="product_mint", desc = "The product mint account")]
    #[account(5, name="vendor_mint", desc = "The Vendor mint")]
    #[account(6, name="vendor_atoken", desc = "The atoken account for vendor")]
    CreateProduct(CreateProductArgs),

    /// Vendor register a Device
    // TODO: verify Vendor
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc = "The associated token program")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, signer, name="vendor", desc = "The Vendor pubkey")]
    #[account(5, signer, name="device", desc = "The Device pubkey")]
    #[account(6, writable, name="product_mint", desc = "The Product mint account")]
    #[account(7, writable, name="product_atoken", desc = "The Product atoken for Device")]
    CreateDevice(),

    /// User activate a Device
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc = "The associated token program")]
    #[account(3, name="instructions", desc = "The Instructions sysvar")]
    #[account(4, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(5, signer, name="device", desc = "The Device pubkey")]
    #[account(6, name="vendor", desc = "Vendor of the Device")]
    #[account(7, name="product_mint", desc = "Product of the Device")]
    #[account(8, name="product_atoken", desc = "The Product atoken for Device")]
    #[account(9, name="user", desc = "The Device Owner pubkey")]
    #[account(10, writable, name="did_mint", desc = "The NFT mint account")]
    #[account(11, writable, name="did_atoken", desc = "The NFT atoken account")]
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
    pub seed: [u8; 32],
    pub bump: u8,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum DeviceSignature {
    Ed25519,
    Secp256k1,
}

impl DeviceSignature {
    const ED25519_HEADER: [u8; 16] = [
        1, 0, 48, 0, 255, 255, 16, 0, 255, 255, 112, 0, 72, 0, 255, 255,
    ];

    pub fn decode(
        &self,
        data: &[u8],
    ) -> Result<([u8; 32], [u8; 72]), DephyError> {
        match self {
            DeviceSignature::Ed25519 => {
                assert!(data.len() == 184);
                assert_eq!(data[0..16], Self::ED25519_HEADER);
                Ok((
                    data[16..48].try_into().unwrap(),
                    data[112..184].try_into().unwrap(),
                ))
            }
            DeviceSignature::Secp256k1 => {
                Err(DephyError::DeserializationError)
            }
        }
    }
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct ActivateDeviceArgs {
    pub bump: u8,
    pub device_signature: DeviceSignature,
}
