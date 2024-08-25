use borsh::{BorshDeserialize, BorshSerialize};
use shank::{ShankContext, ShankInstruction};

#[derive(BorshDeserialize, BorshSerialize, Clone, Debug, ShankContext, ShankInstruction)]
#[rustfmt::skip]
pub enum ConduitsInstruction {
    /// Initializes a new app by creating an SPL token for it with metadata.
    #[account(0, writable, name="app_account", desc = "The account for the app")]
    #[account(1, writable, name="app_mint", desc = "The template mint account for the app")]
    #[account(2, signer, name="authority", desc = "The authority of the new app")]
    #[account(3, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(4, name="token_2022_program", desc = "The SPL Token program")]
    #[account(5, name="system_program", desc = "The system program")]
    InitApp {
        name: String,
        symbol: String,
        uri: String,
        additional_metadata: Vec<(String, String)>,
    },

    /// Install an app to the device.
    #[account(0, name="app_account", desc = "The app account")]
    #[account(1, name="app_mint", desc = "The app mint account")]
    #[account(2, name="device", desc = "The device account")]
    #[account(3, name="device_owner", desc="The device owner")]
    #[account(4, writable, name="access_identity_mint", desc="The mint account for the access identity")]
    #[account(5, writable, name="access_identity_atoken", desc="The associated token account for the access identity")]
    #[account(6, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(7, name="token_2022_program", desc = "The SPL Token 2022 program")]
    #[account(8, name="ata_program", desc = "The SPL Associated Token Account program")]
    #[account(9, name="system_program", desc = "The system program")]
    CreateAccessIdentity,

    /// List a device for rent.
    #[account(0, writable, name="listing_info", desc = "The PDA of the listing info account to create")]
    #[account(1, name="app_account", desc = "The app account")]
    #[account(2, name="device", desc = "The device account")]
    #[account(3, signer, name="device_owner", desc = "The device owner")]
    #[account(4, name="device_mint", desc="The mint account for the device")]
    #[account(5, name="device_associated_token", desc = "DID associated token owned by authority")]
    #[account(6, name="rent_token_mint", desc = "The token mint used for rent payments")]
    #[account(7, name="rent_token_program", desc="The token program for rent token")]
    #[account(8, name="rent_token_escrow", desc="The destination account for rent token")]
    #[account(9, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(10, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(11, name="ata_program", desc="The associated token program")]
    #[account(12, name="system_program", desc = "The system program")]
    ListDevice {
        min_rental_days: u64,
        max_rental_days: u64,
        rent_per_day: u64,
    },

    /// Delist a device.
    #[account(0, writable, name="listing_info", desc = "The listing info account")]
    #[account(1, name="app_account", desc = "The app account")]
    #[account(2, name="device", desc = "The device account")]
    #[account(3, name="rent_token_mint", desc="The rent token mint")]
    #[account(4, name="rent_token_program", desc="The token program for rent token")]
    #[account(5, writable, name="rent_token_escrow", desc="The destination account for rent token")]
    #[account(6, writable, name="rent_token_dst", desc="The destination account for rent token")]
    #[account(7, writable, signer, name="device_owner", desc = "The device owner")]
    #[account(8, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(9, name="system_program", desc = "The system program")]
    #[account(10, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(11, name="ata_program", desc="The associated token program")]
    DelistDevice,

    /// Rent a device.
    #[account(0, writable, name="listing_info", desc = "The listing info account")]
    #[account(1, writable, name="rental_info", desc = "The PDA of the rental agreement account to create")]
    #[account(2, name="app_account", desc = "The app account")]
    #[account(3, name="app_mint", desc = "The template mint account for the app")]
    #[account(4, name="device", desc = "The device account")]
    #[account(5, signer, name="tenant", desc="The tenant account")]
    #[account(6, writable, name="access_identity_mint", desc="The mint account for the access identity")]
    #[account(7, writable, name="access_identity_atoken", desc="The associated token account for the access identity")]
    #[account(8, name="rent_token_mint", desc = "The rent token")]
    #[account(9, name="rent_token_program", desc="The token program for rent token")]
    #[account(10, writable, name="rent_token_src", desc = "The source account for rent payment")]
    #[account(11, writable, name="rent_token_escrow", desc = "The destination account for rent payment")]
    #[account(12, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(13, name="system_program", desc = "The system program")]
    #[account(14, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(15, name="ata_program", desc="The associated token program")]
    RentDevice {
        rental_days: u64,
        prepaid_rent: u64,
    },

    /// Pay rent for an existing rental agreement.
    #[account(0, writable, name="rental_info", desc = "The rental info account")]
    #[account(1, name="listing_info", desc = "The listing info account")]
    #[account(2, signer, name="tenant", desc="The tenant account")]
    #[account(3, name="rent_token_mint", desc = "The rent token")]
    #[account(4, name="rent_token_program", desc="The token program for rent token")]
    #[account(5, writable, name="rent_token_src", desc = "The source account for rent payment")]
    #[account(6, writable, name="rent_token_escrow", desc = "The destination account for rent payment")]
    #[account(7, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(8, name="system_program", desc = "The system program")]
    #[account(9, name="token_2022_program", desc="The SPL Token 2022 program")]
    #[account(10, name="ata_program", desc="The associated token program")]
    PayRent {
        rent_amount: u64,
    },

    /// End a lease agreement.
    #[account(0, writable, name="rental_info", desc = "The rental info account")]
    #[account(1, writable, name="listing_info", desc = "The listing info account")]
    #[account(2, writable, name="tenant", desc="The tenant account")]
    #[account(3, writable, name="access_identity_mint", desc="The mint account for the access identity")]
    #[account(4, writable, name="access_identity_atoken", desc="The associated token account for the access identity")]
    #[account(5, writable, signer, name="payer", desc = "The account paying for the storage fees")]
    #[account(6, name="system_program", desc = "The system program")]
    #[account(7, name="token_2022_program", desc="The SPL Token 2022 program")]
    EndLease,
}
