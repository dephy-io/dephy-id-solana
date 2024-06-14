---
sidebar_position: 3
sidebar_label: Activate
---

# Activate Device

## Prerequisites

Please prepare the [prerequisites steps](./prerequisites) and have the [devices registered](./register).

## Activate Device

The device activation process involves 3 steps:

### 1. Generate activation message

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product <PRODUCT_PUBKEY>
```

- `--user` is privatekey file of user
- `--device` is privatekey file of device
- `--product` is publickey file of product

**An example is as follows:**

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

The output content is as follows:

```sh
Device Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
User Pubkey: 5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
Timestamp: 1718330000

0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366bea4bd6b6600000000
```

`0x4445504...` is the generated message

### 2. Sign the message

```sh
cargo run sign-message -k tmp/keys/device1.json <MESSAGE>
```

- `<MESSAGE>` refers to the message generated in step 1

**An example is as follows:**

```sh
cargo run sign-message -k tmp/keys/device1.json \
"0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366bea4bd6b6600000000"
```

The output content is as follows:

```sh
Pubkey: 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Signature: 0xa8233c99274dcbea17b35bc33c3963d1fc4952396dde2c3abda60eee62f9f9e24004ceae318dbd96684e3c8b2319697040bf93031a588a2963638988105c0802
```

`0xa8233c...` is signature message

### 3. Verify the signature message

```sh
cargo run activate-device-offchain  --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product <PRODUCT_PUBKEY> --vendor tmp/keys/vendor1.json \
--signature <SIGNATURE> --message <MESSAGE>
```

- `--user` is privatekey file of user
- `--device` is privatekey file of device
- `--product` is publickey file of product
- `--vendor` is privatekey file of vendor
- `--signature` is the signature messsage generated in step 2
- `--message` is the activate messsage generated in step 1

**An example is as follows:**

```sh
cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W --vendor tmp/keys/vendor1.json \
--signature "0xa8233c99274dcbea17b35bc33c3963d1fc4952396dde2c3abda60eee62f9f9e24004ceae318dbd96684e3c8b2319697040bf93031a588a2963638988105c0802" \
--message "0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366bea4bd6b6600000000"
```

The output content is as follows:

```sh
Success: 52k39GgNAmgLft4uFHHqHpvHvFunNKJf3nwByX4EMRmKdVecy7q64vZR9jLKmgqGAUWysCkqkZmZQGFpQmAY2gwU
User   5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
Device 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Mint   HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
AToken 5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb
```

`5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5` is publickey of User
`2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd` is publickey of Device
`HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti` is DID of Device
`5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb` is AToken of Device

## Use software to simulate the activation process

### Install

```sh
cd dephy-id/examples/device_simulator
bun install
```

### Generate a device

```sh
bun generate <-v VENDOR_ADDRESS> <-p PRODUCT_TOKEN> [-t secp256k1|ed25519] [-o FILE_PATH] [-f]
```

- `-v` required, the vendor's Solana address, e.g. `4CBgnTunRPYccMR7HcjvNQWchLMB2fTMXGah1L7bfnUR`
- `-p` required, the product's Solana address, e.g. `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-t` optional, the did crypto key type, default: `ed25519`
- `-o` optional, the save path, default: `./tmp/default.json`
- `-f` optional, overwrite exist file

**An example is as follows:**

```sh
bun generate -v fDVGd4CH4LcqjTvXKUJo1wcNhuci6Xr65uBgrWVKk55 \
-p 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

The output content is as follows:

```js
{
  keys: {
    did: {
      keyType: "ed25519",
      privateKey: "...",
      publicKey: "0x6b201f09ebecea3a282b286a34bc9285861faeef367b58dd68c93b085d8f0860",
      bs58PublicKey: "8DB2r9obHfK1LfHtNZtqt1NUi3AFLvMnm5ob4kgzbdbV",
    },
    secp256k1: {
      keyType: "secp256k1",
      privateKey: "...",
      publicKey: "0x022355b5f5103bc1b99a2187d7b13742a6b291872905642eff1e860f1efa29e924",
    },
    ed25519: {
      keyType: "ed25519",
      privateKey: "...",
      publicKey: "0xa792eb9b7cf2cb8e2d066aeda83db560e8efc09aa47710018602df25e9f0cecc",
    },
  },
  extensions: {
    vendor: "fDVGd4CH4LcqjTvXKUJo1wcNhuci6Xr65uBgrWVKk55",
    product: "4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W",
  },
}
```

### Show a (simulated) device info

```sh
bun show [-w FILE_PATH]
```

- `-w` optional, the wallet file path, default: `./tmp/default.json`

**An example is as follows:**

```
bun show
```

The output content is as follows:

```js
{
  "address": "8DB2r9obHfK1LfHtNZtqt1NUi3AFLvMnm5ob4kgzbdbV",
  "keys": {
    "did": {
      "keyType": "ed25519",
      "publicKey": "0x6b201f09ebecea3a282b286a34bc9285861faeef367b58dd68c93b085d8f0860"
    },
    "secp256k1": {
      "keyType": "secp256k1",
      "publicKey": "0x022355b5f5103bc1b99a2187d7b13742a6b291872905642eff1e860f1efa29e924"
    },
    "ed25519": {
      "keyType": "ed25519",
      "publicKey": "0xa792eb9b7cf2cb8e2d066aeda83db560e8efc09aa47710018602df25e9f0cecc"
    }
  },
  "extensions": {
    "vendor": "fDVGd4CH4LcqjTvXKUJo1wcNhuci6Xr65uBgrWVKk55",
    "product": "4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W"
  }
}
```

### Activate the device

```sh
bun activate <-o OWNER_ADDRESS> <-p PRODUCT_TOKEN> [-w FILE_PATH]
```

- `-o` required, the owner's Solana address, e.g. `G2xf2ophFPJpPeZPy2hTU8H5q7YdULkqabD344kM4NAU`
- `-p` required, the product's Solana address, e.g. `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-i` optional, the DePHY ID program address, default points to the development program address
- `-w` optional, the wallet file path, default: `./tmp/default.json`

**An example is as follows:**

```sh
bun activate -o gQDFktfUbvNbrMjp1Qs3Ri62UCbe6bBwZS5Vd1Kaf1S -p \ 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

The output content is as follows:

```js
0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9

{
  "keyType": "ed25519",
  "publicKey": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "message": "0x44455048595f49445f5349474e45445f4d4553534147453a9668a0ac36b62bb309a5862944f7ed5e1df38647ab0ad1b55473b3a10ddf52500a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9b2ee6a6600000000",
  "signature": "0x2f45ee5cc68cd7545cd86b7b99d83c6bf013e8a7e7802b0d23e89f12d6d041d9d90df589aefe4a72ba4c26d4a80ea92dec0ad4681d3a479aae0d2059a09c9e03"
}
```

### Sign a message

```sh
bun sign <-m MESSAGE> [-k did|secp256k1|ed25519] [-w FILE_PATH]
```

- `-m` required, the message for signing
  - Starts with `0x` will treat as a hex string, otherwise plain text
- `-k` optional, which key should use to sign, default: `did`
- `-w` optional, the wallet file path, default: `./tmp/default.json`

**An example is as follows:**

```sh
bun sign -m 0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9
```

The output content is as follows:

```js
{
  "keyType": "ed25519",
  "publicKey": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "message": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "signature": "0x47e9ac8f9b14f2917977a50e1eed4cb27499a2c8e8b4d1b1b5a4476591f9397dcfc098b4885991d30c9bdfa857f787128ced1973dda062ca8bd634726d7d0209"
}
```

### Verify a message

```sh
bun verify <-m MESSAGE> <-s SIGNATURE> [-k did|secp256k1|ed25519] [-w FILE_PATH]
```

- `-m` required, the message for signing
    - Starts with `0x` will treat as a hex string, otherwise plain text
- `-s` required, the signature, must be a hex string
- `-k` optional, which key should use to verify, default: `did`
- `-w` optional, the wallet file path, default: `./tmp/default.json`

**An example is as follows:**

```sh
bun verify -m 0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9 -s 0x47e9ac8f9b14f2917977a50e1eed4cb27499a2c8e8b4d1b1b5a4476591f9397dcfc098b4885991d30c9bdfa857f787128ced1973dda062ca8bd634726d7d0209
```

The output content is as follows:

```js
{
  "keyType": "ed25519",
  "publicKey": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "message": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "signature": "0x47e9ac8f9b14f2917977a50e1eed4cb27499a2c8e8b4d1b1b5a4476591f9397dcfc098b4885991d30c9bdfa857f787128ced1973dda062ca8bd634726d7d0209",
  "verified": true
}
```