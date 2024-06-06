select default::Device {
  pubkey,
  signing_alg,
  token_account,
  block_ts := .tx.block_ts,
  did: {
    token_account,
    mint_account,
    owner: {
      pubkey
    },
    metadata: {
      name,
      uri,
      symbol,
      additional
    }
  },
  product: {
    mint_account,
    metadata: {
      name,
      symbol,
      uri,
      additional
    },
    vendor: {
      pubkey
    }
  }
}
filter .pubkey = <str>$pubkey
