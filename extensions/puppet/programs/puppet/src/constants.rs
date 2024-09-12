use anchor_lang::prelude::Pubkey;

pub const DEPHY_ID_PROGRAM: Pubkey = Pubkey::new_from_array([10, 104,  87,  71, 135, 225, 232, 69, 21, 185, 195, 236, 216,  23, 119, 79, 176,  27, 100, 193, 237,  38, 213, 50, 121, 184, 103, 109, 227,  77,  99, 44]);
pub const PRODUCT_MINT_SEED_PREFIX: &[u8; 16] = b"DePHY_ID-PRODUCT";
pub const DEVICE_MINT_SEED_PREFIX: &[u8; 15] = b"DePHY_ID-DEVICE";