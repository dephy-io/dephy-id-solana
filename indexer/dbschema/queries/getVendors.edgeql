select default::Vendor {
  pubkey,
  products_count := count(.products),
  products: {
    mint_authority,
    mint_account,
    metadata: {
      name,
      symbol,
      uri,
      additional
    },
    block_ts := .tx.block_ts,
    device_count := count(.devices)
  }
}
offset <int64>$offset
limit <int64>$limit