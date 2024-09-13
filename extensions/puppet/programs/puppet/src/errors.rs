use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("The given device collection does not match the collection binding.")]
    DeviceCollectionDoesNotMatch,

    #[msg("The given metaplex collection does not match the collection binding.")]
    MplCollectionDoesNotMatch,

    #[msg("The given device collection has already bound.")]
    DeviceCollectionAlreadyBound,

    #[msg("The given metaplex collection has already bound.")]
    MplCollectionAlreadyBound,

    #[msg("The given owner does not own the specified nft.")]
    NotNFTOwner,

    #[msg("The given owner does not own the specified device.")]
    NotDeviceOwner,

    #[msg("The given device has already bound a nft.")]
    DeviceAlreadyBound,

    #[msg("The given nft has already bound a device.")]
    NFTAlreadyBound,

    #[msg("The provided device does not match the binding.")]
    DeviceDoesNotMatch,

    #[msg("The provided nft does not match the binding.")]
    NFTDoesNotMatch,

    #[msg("The calculated device associated token address does not match.")]
    DeviceAssociatedTokenDoesNotMatch,
}