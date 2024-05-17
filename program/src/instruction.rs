use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};
use solana_program::{keccak, pubkey::Pubkey};

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
    #[account(4, name="dephy", desc = "The DePHY account")]
    #[account(5, signer, name="vendor", desc = "The Vendor pubkey")]
    #[account(6, writable, name="vendor_mint", desc = "The Vendor mint")]
    #[account(7, writable, name="vendor_atoken", desc = "The atoken account for vendor")]
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
    #[account(5, name="device", desc = "The Device pubkey")]
    #[account(6, writable, name="product_mint", desc = "The Product mint account")]
    #[account(7, writable, name="product_atoken", desc = "The Product atoken for Device")]
    CreateDevice(CreateDeviceArgs),

    /// User activate a Device
    #[account(0, name="system_program", desc = "The system program")]
    #[account(1, name="token_program_2022", desc = "The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc = "The associated token program")]
    #[account(3, name="instructions", desc = "The Instructions sysvar")]
    #[account(4, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(5, name="device", desc = "The Device pubkey")]
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
    pub bump: u8,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum KeyType {
    Ed25519,
    Secp256k1,
}

impl KeyType {
    const DEPHY_PREFIX: [u8; 8] = *b"DEPHY_ID";
    const ED25519_HEADER: [u8; 16] = [
        1, 0, 48, 0, 255, 255, 16, 0, 255, 255, 112, 0, 80, 0, 255, 255,
    ];
    const SECP256K1_HEADER: [u8; 12] = [
        1, 32, 0, 0, 12, 0, 0, 97, 0, 80, 0, 0
    ];

    pub fn decode(
        &self,
        data: &[u8],
    ) -> Result<([u8; 32], [u8; 72]), DephyError> {
        match self {
            KeyType::Ed25519 => {
                if data.len() != 192 {
                    return Err(DephyError::DeserializationError);
                }
                if data[0..16] != Self::ED25519_HEADER {
                    return Err(DephyError::DeserializationError);
                }
                if data[112..120] != Self::DEPHY_PREFIX {
                    return Err(DephyError::DeserializationError);
                }

                Ok((
                    data[16..48].try_into().unwrap(),
                    data[120..192].try_into().unwrap(),
                ))
            }
            KeyType::Secp256k1 => {
                if data.len() != 177 {
                    return Err(DephyError::DeserializationError);
                }
                if data[0..12] != Self::SECP256K1_HEADER {
                    return Err(DephyError::DeserializationError);
                }
                if data[97..105] != Self::DEPHY_PREFIX {
                    return Err(DephyError::DeserializationError);
                }

                let pubkey = Pubkey::new_from_array(keccak::hash(&data[12..32]).to_bytes());

                Ok((
                    pubkey.to_bytes(),
                    data[105..177].try_into().unwrap(),
                ))
            }
        }
    }
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateDeviceArgs {
    pub key_type: KeyType,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct ActivateDeviceArgs {
    pub bump: u8,
    pub key_type: KeyType,
}
