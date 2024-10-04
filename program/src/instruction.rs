use crate::{DEVICE_MESSAGE_PREFIX, EIP191_MESSAGE_PREFIX};
use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};
use solana_program::{entrypoint::ProgramResult, pubkey::Pubkey};

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
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(2, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(3, signer, name="vendor", desc="The vendor")]
    #[account(4, writable, name="product_mint", desc="The mint account of the product")]
    CreateProduct(CreateProductArgs),

    /// Vendor register a Device
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
    #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(4, name="vendor", desc="The vendor")]
    #[account(5, name="product_mint", desc="The mint account for the product")]
    #[account(6, name="product_associated_token", desc="The associated token account for the product")]
    #[account(7, name="device", desc="The device")]
    #[account(8, writable, name="device_mint", desc="The mint account for the device")]
    #[account(9, writable, name="device_associated_token", desc="The associated token account for the device")]
    #[account(10, name="owner", desc="The device's owner")]
    ActivateDevice(ActivateDeviceArgs),

    /// Vendor create an activated Device
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc="The associated token program")]
    #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(4, signer, name="vendor", desc="The vendor")]
    #[account(5, writable, name="product_mint", desc="The mint account for the product")]
    #[account(6, writable, name="product_associated_token", desc="The associated token account for the product")]
    #[account(7, signer, name="device", desc="The device")]
    #[account(8, writable, name="device_mint", desc="The mint account for the device")]
    #[account(9, writable, name="device_associated_token", desc="The associated token account for the device")]
    #[account(10, name="owner", desc="The device's owner")]
    CreateActivatedDevice(CreateActivatedDeviceArgs),

    /// Vendor create an activated Device (the device doesn't need to sign)
    #[account(0, name="system_program", desc="The system program")]
    #[account(1, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(2, name="ata_program", desc="The associated token program")]
    #[account(3, writable, signer, name="payer", desc="The account paying for the storage fees")]
    #[account(4, signer, name="vendor", desc="The vendor")]
    #[account(5, writable, name="product_mint", desc="The mint account for the product")]
    #[account(6, writable, name="product_associated_token", desc="The associated token account for the product")]
    #[account(7, name="device", desc="The device")]
    #[account(8, writable, name="device_mint", desc="The mint account for the device")]
    #[account(9, writable, name="device_associated_token", desc="The associated token account for the device")]
    #[account(10, name="owner", desc="The device's owner")]
    CreateActivatedDeviceNonSigner(CreateActivatedDeviceArgs),
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

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateDeviceArgs {
    pub name: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
    pub signing_alg: DeviceSigningAlgorithm,
}

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum DeviceActivationSignature {
    Ed25519([u8; 64]),
    Secp256k1([u8; 64], u8),
    EthSecp256k1([u8; 64], u8),
}

impl DeviceActivationSignature {
    pub fn verify(
        &self,
        device_pubkey: &Pubkey,
        device_mint_pubkey: &Pubkey,
        owner_pubkey: &Pubkey,
        timestamp: u64,
    ) -> ProgramResult {
        match self {
            DeviceActivationSignature::Ed25519(signature) => {
                #[cfg(feature = "ed25519-sign")]
                {
                    let message = [
                        DEVICE_MESSAGE_PREFIX,
                        device_mint_pubkey.as_ref(),
                        owner_pubkey.as_ref(),
                        &timestamp.to_le_bytes(),
                    ]
                    .concat();
                    crate::ed25519::verify_signature(device_pubkey, signature, &message)
                }
                #[cfg(not(feature = "ed25519-sign"))]
                {
                    _ = signature;
                    Err(solana_program::program_error::ProgramError::InvalidArgument)
                }
            }
            DeviceActivationSignature::Secp256k1(signature, recovery_id) => {
                let message = [
                    DEVICE_MESSAGE_PREFIX,
                    device_mint_pubkey.as_ref(),
                    owner_pubkey.as_ref(),
                    &timestamp.to_le_bytes(),
                ]
                .concat();
                crate::secp256k1::verify_signature(device_pubkey, signature, *recovery_id, &message)
            }
            DeviceActivationSignature::EthSecp256k1(signature, recovery_id) => {
                let message = timestamp.to_le_bytes();
                let eip191_message = [
                    EIP191_MESSAGE_PREFIX,
                    message.len().to_string().as_bytes(),
                    &message,
                ]
                .concat();
                crate::secp256k1::verify_signature(
                    device_pubkey,
                    signature,
                    *recovery_id,
                    eip191_message.as_ref(),
                )
            }
        }
    }
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct ActivateDeviceArgs {
    pub signature: DeviceActivationSignature,
    pub timestamp: u64,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreateActivatedDeviceArgs {
    pub name: String,
    pub uri: String,
    pub additional_metadata: Vec<(String, String)>,
}
