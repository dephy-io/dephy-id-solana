Fake signer device
====

A fake device to sign messages.

## Preparation

`bun install`

## Usage

### Generate a device

`bun generate <-v VENDOR_ADDRESS> [-t secp256k1|ed25519] [-o FILE_PATH] [-f]`
- `-v` required, the vendor's Solana address, e.g. `4CBgnTunRPYccMR7HcjvNQWchLMB2fTMXGah1L7bfnUR`
- `-p` required, the product's Solana address, e.g. `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-t` optional, the crypto type, default: `ed25519`
- `-o` optional, the save path, default: `./tmp/default.json`
- `-f` optional, overwrite exist file

### Show a device info

`bun show [-w FILE_PATH]`
- `-w` optional, the wallet file path, default: `./tmp/default.json`

### Sign a message

`bun sign <-m MESSAGE> [-w FILE_PATH]`
- `-m` required, the message for signing
  - Starts with `0x` will treat as a hex string, otherwise plain text
- `-w` optional, the wallet file path, default: `./tmp/default.json`

### Verify a message

`bun sign <-m MESSAGE> <-s SIGNATURE>`
- `-m` required, the message for signing
    - Starts with `0x` will treat as a hex string, otherwise plain text
- `-s` required, the signature, must be a hex string
- `-w` optional, the wallet file path, default: `./tmp/default.json`
