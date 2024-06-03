// Should keep in sync with program's constants

pub const PROGRAM_PDA_SEED_PREFIX: &[u8; 8] = b"DePHY_ID";
pub const PRODUCT_MINT_SEED_PREFIX: &[u8; 16] = b"DePHY_ID-PRODUCT";
pub const DEVICE_MINT_SEED_PREFIX: &[u8; 15] = b"DePHY_ID-DEVICE";

pub const DEVICE_MESSAGE_PREFIX: &[u8; 24] = b"DEPHY_ID_SIGNED_MESSAGE:";
pub const EIP191_MESSAGE_PREFIX: &[u8; 26] = b"\x19Ethereum Signed Message:\n";
