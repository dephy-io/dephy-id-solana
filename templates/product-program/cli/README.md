Product program CLI
====

> By default, all commands will connect to local solana-test-validator,
> if you want to connect to the mainnet-beta program, you need to add extra args `-u YOUR_SOLANA_HTTP_RPC_ENDPOINT -p YOUR_SOLANA_PROGRAM_ID -d DiSU1nme5VJvMdry5FYhfw6LLFb3HUFLkCLZDe53x3PV`

## Create Product

```sh
cargo run init-program --authority ../../tmp/keys/vendor1.json 'Product 1' 'SYMBOL' 'METADATA_URI'
```

## Create Device

```sh
cargo run create-device --owner ../../tmp/keys/user1.json
```
