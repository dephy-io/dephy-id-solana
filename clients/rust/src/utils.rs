use solana_program::pubkey::Pubkey;

use crate::constants::{DEVICE_MINT_SEED_PREFIX, PRODUCT_MINT_SEED_PREFIX};

pub fn find_device_mint(
    product_mint: &Pubkey,
    device: &Pubkey,
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint.as_ref(),
            device.as_ref(),
        ],
        program_id,
    )
}

pub fn find_product_mint(
    vendor_pubkey: &Pubkey,
    product_name: String,
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            product_name.as_ref(),
        ],
        program_id,
    )
}
