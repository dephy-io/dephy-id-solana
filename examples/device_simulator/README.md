Device simulator
====

A set of Javascript scripts that mocking a device, providing essential abilities to work with DePHY ID.

## Preparation

`bun install`

## Usage

### Generate a device

`bun generate <-v VENDOR_ADDRESS> <-p PRODUCT_TOKEN> [-t secp256k1|ed25519] [-o FILE_PATH] [-f]`
- `-v` required, the vendor's Solana address, e.g. `4CBgnTunRPYccMR7HcjvNQWchLMB2fTMXGah1L7bfnUR`
- `-p` required, the product's Solana address, e.g. `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-t` optional, the did crypto key type, default: `secp256k1`
- `-o` optional, the save path, default: `./tmp/default.json`
- `-f` optional, overwrite exist file

### Show a (simulated) device info

`bun show [-w FILE_PATH]`
- `-w` optional, the wallet file path, default: `./tmp/default.json`

### Activate the device

`bun activate <-o OWNER_ADDRESS> <-p PRODUCT_TOKEN> <-i PROGRAM_ID> [-w FILE_PATH]`
- `-o` required, the owner's Solana address, e.g. `G2xf2ophFPJpPeZPy2hTU8H5q7YdULkqabD344kM4NAU`
- `-p` required, the product's Solana address, e.g. `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-i` optional, the DePHY ID program address, default points to the development program address
- `-w` optional, the wallet file path, default: `./tmp/default.json`

### Sign a message

`bun sign <-m MESSAGE> [-k did|secp256k1|ed25519] [-w FILE_PATH]`
- `-m` required, the message for signing
  - Starts with `0x` will treat as a hex string, otherwise plain text
- `-k` optional, which key should use to sign, default: `did`
- `-w` optional, the wallet file path, default: `./tmp/default.json`

### Verify a message

`bun verify <-m MESSAGE> <-s SIGNATURE> [-k did|secp256k1|ed25519] [-w FILE_PATH]`
- `-m` required, the message for signing
    - Starts with `0x` will treat as a hex string, otherwise plain text
- `-s` required, the signature, must be a hex string
- `-k` optional, which key should use to verify, default: `did`
- `-w` optional, the wallet file path, default: `./tmp/default.json`
