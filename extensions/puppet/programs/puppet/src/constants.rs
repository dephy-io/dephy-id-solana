use anchor_lang::prelude::Pubkey;

pub const DEPHY_ID_PROGRAM: Pubkey = Pubkey::new_from_array([10, 104,  87,  71, 135, 225, 232, 69, 21, 185, 195, 236, 216,  23, 119, 79, 176,  27, 100, 193, 237,  38, 213, 50, 121, 184, 103, 109, 227,  77,  99, 44]);
pub const SPL_2022_PROGRAM: Pubkey = Pubkey::new_from_array([6, 221, 246, 225, 238, 117, 143, 222, 24, 66, 93, 188, 228, 108, 205, 218, 182, 26, 252, 77, 131, 185, 13, 39, 254, 189, 249, 40, 216, 161, 139, 252]);
pub const PRODUCT_MINT_SEED_PREFIX: &[u8; 16] = b"DePHY_ID-PRODUCT";
pub const DEVICE_MINT_SEED_PREFIX: &[u8; 15] = b"DePHY_ID-DEVICE";
