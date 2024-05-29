select default::DID {
  mint_account,
  token_account,
  device: {
    token_account,
    pubkey,
    product: {
      mint_account,
      vendor: {
        pubkey
      }
    }
  },
  owner: {
    pubkey
  }
}
filter .token_account = <str>$did_atoken