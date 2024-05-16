
# Demo Steps

```sh
# generate client js
bun run zx examples/kwil/generate-client.mjs

# start test validator, dephy indexer, kwil docker

# deploy example program
solana -u l program deploy target/deploy/dephy_kwil_example.so --program-id examples/kwil/keypair.json


cd indexer
# publish data source
bun run --preload ./env.ts ./scripts/kwil.ts publish -k did_owner.json --did_atoken <DID_ATOKEN> --eth_address <ETH_ADDR>

# link user eth address
bun run --preload ./env.ts ./scripts/kwil.ts link -k user.json --eth_address <ETH_ADDR>

# subscribe data source
bun run --preload ./env.ts ./scripts/kwil.ts subscribe -k user.json --publisher <PUBLISHER_PUBKEY> --linked <LINKED_PUBKEY>

```

