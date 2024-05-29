select default::Product {
  mint_account,
  mint_authority,
  device_count := count(.devices),
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
order by .tx.slot then .tx@ix_index
offset <int64>$offset
limit <int64>$limit

