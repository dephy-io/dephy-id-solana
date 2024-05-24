use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};
use solana_program::{keccak, pubkey::Pubkey};

use crate::error::Error;
use crate::DEVICE_MESSAGE_PREFIX;

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum Instruction {
    /// Initialize the program.
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(2, writable, name="program_data", desc="The program data account for the program")]
    #[account(3, signer, name="authority", desc="The authority account of the program")]
    Initialize(InitializeArgs),

    /// Vendor register a Product
    // TODO: PDA authority
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(2, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(3, signer, name="vendor", desc="The vendor")]
    #[account(4, writable, name="product_mint", desc="The mint account of the product")]
    CreateProduct(CreateProductArgs),

    /// Vendor register a Device
    // TODO: verify Vendor
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc="The associated token program")]
    #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(4, signer, name="vendor", desc="The vendor")]
    #[account(5, writable, name="product_mint", desc="The mint account of the product")]
    #[account(6, writable, name="product_associated_token", desc="The associated token account of the product")]
    #[account(7, name="device", desc="The device")]
    #[account(8, writable, name="device_mint", desc="The mint account of the device")]
    CreateDevice(CreateDeviceArgs),

    /// User activate a Device
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc="The associated token program")]
    #[account(3, name="instructions", desc="The instructions sysvar")]
    #[account(4, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(5, name="vendor", desc="The vendor")]
    #[account(6, name="product_mint", desc="The mint account for the product")]
    #[account(7, name="product_associated_token", desc="The associated token account for the product")]
    #[account(8, name="device", desc="The device")]
    #[account(9, writable, name="device_mint", desc="The mint account for the device")]
    #[account(10, writable, name="device_associated_token", desc="The associated token account for the device")]
    #[account(11, name="owner", desc="The device's owner")]
    ActivateDevice(ActivateDeviceArgs),
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct InitializeArgs {
    pub bump: u8,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateProductArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum DeviceSigningAlgorithm {
    Ed25519,
    Secp256k1,
}

impl DeviceSigningAlgorithm {
    const MESSAGE_PREFIX: [u8; 8] = *DEVICE_MESSAGE_PREFIX;
    const ED25519_HEADER: [u8; 16] = [
        1, 0, 48, 0, 255, 255, 16, 0, 255, 255, 112, 0, 80, 0, 255, 255,
    ];
    const SECP256K1_HEADER: [u8; 12] = [1, 32, 0, 0, 12, 0, 0, 97, 0, 80, 0, 0];

    pub fn decode(&self, data: &[u8]) -> Result<([u8; 32], [u8; 72]), Error> {
        match self {
            DeviceSigningAlgorithm::Ed25519 => {
                if data.len() != 192 {
                    return Err(Error::DeserializationError);
                }
                if data[0..16] != Self::ED25519_HEADER {
                    return Err(Error::DeserializationError);
                }
                if data[112..120] != Self::MESSAGE_PREFIX {
                    return Err(Error::DeserializationError);
                }

                Ok((
                    data[16..48].try_into().unwrap(),
                    data[120..192].try_into().unwrap(),
                ))
            }
            DeviceSigningAlgorithm::Secp256k1 => {
                if data.len() != 177 {
                    return Err(Error::DeserializationError);
                }
                if data[0..12] != Self::SECP256K1_HEADER {
                    return Err(Error::DeserializationError);
                }
                if data[97..105] != Self::MESSAGE_PREFIX {
                    return Err(Error::DeserializationError);
                }

                let pubkey = Pubkey::new_from_array(keccak::hash(&data[12..32]).to_bytes());

                Ok((pubkey.to_bytes(), data[105..177].try_into().unwrap()))
            }
        }
    }
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateDeviceArgs {
    pub signing_alg: DeviceSigningAlgorithm,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct ActivateDeviceArgs {
    pub bump: u8,
    pub signing_alg: DeviceSigningAlgorithm,
}
