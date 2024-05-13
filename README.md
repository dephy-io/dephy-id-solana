# Dephy Id

This template should help get you started developing Solana programs. Let's walk through this generated program repository and see what's included.

## Indexer setup

1. [Install edgedb](https://docs.edgedb.com/get-started/quickstart#installation)

   ```sh
   brew tap edgedb/tap
   brew install edgedb-cli
   ```

2. setup local edgedb

   ```sh
   cd indexer
   edgedb project init --server-instance dephy-indexer --non-interactive
   
   bun install
   bun generate:edgeql
   ```

3. public graphql endpoint

   ```sh
   edgedb -I dephy-indexer
   ```
   
   ```
   configure instance insert cfg::Auth {
       priority := -1,
       method := (insert cfg::Trust { transports := "SIMPLE_HTTP" }),
   };
   ```

4. (optional) upgrade

   ```sh
   cd indexer
   edgedb migration apply
   bun generate:edgeql
   cp -r ../clients/js/src/generated ./src
   ```

## Local setup

1. Compile program

   ```sh
   cargo-build-sbf --tools-version v1.41
   ```

2. Run validator

   ```sh
   solana-test-validator
   ```

3. Prepare keys

   ```sh
   ./PoC/00.generate_keys.sh
   ```

4. Deploy program

   ```sh
   solana -u l program deploy target/deploy/dephy_io_dephy_id.so --program-id ./program/keypair.json
   ```

5. Init DePHY

   ```sh
   cargo run create-dephy --admin keys/DePHY.json
   ```

6. Run Indexer

   ```sh
   cd indexer
   cp -r ../clients/js/src/generated ./src
   bun dephy-indexer
   edgedb ui  # go to the GraphQL editor
   ```

## Cli steps

1. Create Vendor

   ```sh
   cargo run create-vendor --admin keys/DePHY.json --vendor $(solana address -k keys/VENDOR1.json) 'Example Vendor' 'DV1' 'https://example.com' -m desc="An example Vendor"
   ```

2. Create Product

   ```sh
   cargo run create-product --vendor keys/VENDOR1.json 'Product 1' 'V1P1' 'https://example.com' -m desc="First Product by Example Vendor"
   ```

3. Create Device

   ```sh
   # the PRODUCT_PUBKEY is from "Create Product" step's command output
   # the DEVICE_PUBKEY can get by `solana address -k ./keys/DEVICE1.json`
   cargo run create-device --vendor keys/VENDOR1.json --product <PRODUCT_PUBKEY> --device <DEVICE_PUBKEY>
   ```

4. Activate Device

   ```sh
   # the VENDOR_PUBKEY is from "Create Vendor" step's command output
   cargo run activate-device --device keys/DEVICE1.json --user keys/USER1.json --vendor <VENDOR_PUBKEY> --product <PRODUCT_PUBKEY>
   ```


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

## Managing clients

The following clients are available for your programs. You may use the following links to learn more about each client.

- [JS client](./clients/js)
- [Rust client](./clients/rust)
