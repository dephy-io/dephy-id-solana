use solana_program::pubkey::Pubkey;

use crate::constants::{DEVICE_MINT_SEED_PREFIX, PRODUCT_MINT_SEED_PREFIX};

pub fn find_device_mint(
    product_mint: &Pubkey,
    device: &Pubkey,
    dephy_id_program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            DEVICE_MINT_SEED_PREFIX,
            product_mint.as_ref(),
            device.as_ref(),
        ],
        dephy_id_program_id,
    )
}

pub fn find_product_mint(
    vendor_pubkey: &Pubkey,
    product_name: String,
    dephy_id_program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            PRODUCT_MINT_SEED_PREFIX,
            vendor_pubkey.as_ref(),
            product_name.as_ref(),
        ],
        dephy_id_program_id,
    )
}

pub fn get_product_atoken(product_mint: &Pubkey, device: &Pubkey) -> Pubkey {
    spl_associated_token_account::get_associated_token_address_with_program_id(
        device,
        product_mint,
        &spl_token_2022::id(),
    )
}

pub fn get_device_atoken(user: &Pubkey, device_mint: &Pubkey) -> Pubkey {
    spl_associated_token_account::get_associated_token_address_with_program_id(
        user,
        device_mint,
        &spl_token_2022::id(),
    )
}
