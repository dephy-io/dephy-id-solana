use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("The given device collection does not match the collection binding.")]
    DeviceCollectionDoesNotMatch,

    #[msg("The given nft collection does not match the collection binding.")]
    NFTCollectionDoesNotMatch,

    #[msg("The given device collection has already bound.")]
    DeviceCollectionAlreadyBound,

    #[msg("The given nft collection has already bound.")]
    NFTCollectionAlreadyBound,

    #[msg("The payer does not own the specified NFT.")]
    PayerDoesNotOwnNFT,

    #[msg("The payer does not own the specified device.")]
    PayerDoesNotOwnDevice,

    #[msg("The given device has already bound a nft.")]
    DeviceAlreadyBound,

    #[msg("The given nft has already bound a device.")]
    NFTAlreadyBound,

    #[msg("The provided device does not match the binding.")]
    DeviceDoesNotMatch,

    #[msg("The provided nft does not match the binding.")]
    NFTDoesNotMatch,
}