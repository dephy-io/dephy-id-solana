use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("The payer does not own the specified NFT.")]
    PayerDoesNotOwnNFT,

    #[msg("The payer does not own the specified device.")]
    PayerDoesNotOwnDevice,

    #[msg("The provided device does not match the binding.")]
    DeviceDoesNotMatch,

    #[msg("The provided nft does not match the binding.")]
    NFTDoesNotMatch,
}