DePHY ID
====

The DePHY ID Solana program mono repo

## Contents

- [Solana program](./program)
- [CLI tool](./cli):
  It helps for create products and mint devices, it also has some development shortcuts as well
- [Indexer](./indexer)
  A very basic indexer to index all vendors, products, devices, and their owners from Solana
- [JavaScript client](./clients/js):
  DePHY ID program client for JavaScript, generated by [Kinobi](https://github.com/metaplex-foundation/kinobi)
  which is useful for creating indexer, dApp, etc.
- [Rust client](./clients/rust):
  DePHY ID program client for Rust, generated by [Kinobi](https://github.com/metaplex-foundation/kinobi)
  which is useful for creating tools.
- [Example: Simple data subscription (with Kwil)](./examples/kwil):
  A demo to show how to connect DePIN devices with Kwil decentralized DB,
  Devices can publish their data to the Kwil DB, people can subscribe them, and read.
- [Example: Fake device](./examples/signer_device):
  A software that mocking a device, providing essential abilities to work with DePHY ID

## Program address

> Address may change due to breaking change

If you use the default program keypair, the address should be `hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`

On Solana mainnet-beta: `DiSU1nme5VJvMdry5FYhfw6LLFb3HUFLkCLZDe53x3PV`

## Quick start

Although you can use DePHY ID on the Solana mainnet-beta now,
we still recommend to try it on local first to avoid Sol cost.

### Prepare

### Solana and Rust

You need to learn basic about how to prepare a Solana development environment first

See: https://solana.com/developers/guides/getstarted/setup-local-development

> Note: Use `Solana 1.18.12` or later

```sh
sh -c "$(curl -sSfL https://release.solana.com/v1.18.15/install)"
```

### Bun

See: https://bun.sh/

### Start local Solana net

`solana-test-validator`

### Prepare test wallets

```sh
./scripts/generate_demo_keys.sh
```

### Compile the program

```sh
cargo-build-sbf
```

### Deploy the program

```sh
solana -u l program deploy target/deploy/dephy_id_program.so --program-id ./program/keypair.json
```

### Initialize the program

```sh
cargo run initialize --admin ./tmp/keys/admin.json
```

### Create Product

```sh
cargo run create-product --vendor ./tmp/keys/vendor1.json 'Product 1' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor"
```

### Create Device

```sh
# the PRODUCT_PUBKEY is from "Create Product" step's command output
# the DEVICE_PUBKEY can get by `solana address -k ./tmp/keys/device1.json`
cargo run create-device --vendor ./tmp/keys/vendor1.json --product <PRODUCT_PUBKEY> --device <DEVICE_PUBKEY> 'Device#1' 'METADATA_URI'
```

### Activate Device

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json --product <PRODUCT_PUBKEY>

# here we signed the message for demo purposes
# in reality one should sign this on the device
cargo run sign-message -k tmp/keys/device1.json <MESSAGE>

cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json --product <PRODUCT_PUBKEY> --vendor tmp/keys/vendor1.json --signature <SIGNATURE> --message <MESSAGE>
```

### (Optional) Run indexer

Indexer can watch the chain and fetch latest changes to build relational snapshots about DePHY ID states.
It will help to make dAPP and dashboard easier.

See [Indexer](./indexer/README.md)

## Managing programs

You'll notice a `program` folder in the root of this repository. This is where your generated Solana program is located.

Whilst only one program gets generated, note that you can have as many programs as you like in this repository.
Whenever you add a new program folder to this repository, remember to add it to the `members` array of your root `Cargo.toml` file.
That way, your programs will be recognized by the following scripts that allow you to build, test, format and lint your programs respectively.

```sh
pnpm programs:build
pnpm programs:test
pnpm programs:format
pnpm programs:lint
```

## Generating IDLs

You may use the following command to generate the IDLs for your programs.

```sh
cargo install shank-cli  # if you don't have shank-cli installed
pnpm generate:idls
```

Depending on your program's framework, this will either use Shank or Anchor to generate the IDLs.
Note that, to ensure IDLs are generated using the correct framework version, the specific version used by the program will be downloaded and used locally.

## Generating clients

Once your programs' IDLs have been generated, you can generate clients for them using the following command.

```sh
pnpm generate:clients
```

Alternatively, you can use the `generate` script to generate both the IDLs and the clients at once.

```sh
pnpm generate
```
