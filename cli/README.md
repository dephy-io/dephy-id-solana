DePHY ID CLI
====

> Run all commands in the root of the repo

> By default, all commands will connect to local solana-test-validator,
> if you want to connect to the mainnet-beta program, you need to add extra args `-u YOUR_SOLANA_HTTP_RPC_ENDPOINT -p hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`

## Create Product

```sh
cargo run create-product --vendor ./tmp/keys/vendor1.json 'Product 1' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor"
```

## Create Device

```sh
# the PRODUCT_PUBKEY is from "Create Product" step's command output
# the DEVICE can be keypair file or calc with `cargo run calc-device-pubkey --device <KEYPAIR_FILE>`
cargo run create-device --vendor ./tmp/keys/vendor1.json --product <PRODUCT_PUBKEY> --device <DEVICE> 'Device#1' 'METADATA_URI'
```

## Activate Device

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json --product <PRODUCT_PUBKEY>

# here we signed the message for demo purposes
# in reality one should sign this on the device
cargo run sign-message -k tmp/keys/device1.json <MESSAGE>

cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json --product <PRODUCT_PUBKEY> --vendor tmp/keys/vendor1.json --signature <SIGNATURE> --message <MESSAGE>
```

### (Development only purpose)

```sh
# the VENDOR_PUBKEY is from "Create Vendor" step's command output
cargo run dev-activate-device --user ./tmp/keys/user1.json --device ./tmp/keys/device1.json --vendor <VENDOR_PUBKEY> --product <PRODUCT_PUBKEY>
```

## (Development only) Initialize the program

```sh
cargo run initialize --admin ./tmp/keys/admin.json
```
