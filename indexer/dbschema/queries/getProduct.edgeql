select default::Product {
  mint_account,
  mint_authority,
  devices_count := count(.devices),
  devices: {
    id,
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
        symbol,
        uri,
        additional
      }
    }
  }
  order by .tx.slot then .tx@ix_index
  offset <int64>$offset
  limit <int64>$limit,
  metadata: {
    name,
    additional,
    symbol,
    uri
  },
  vendor: {
    pubkey
  }
}
filter .mint_account = <str>$mint_account

