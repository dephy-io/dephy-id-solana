---
sidebar_position: 3
sidebar_label: Activate
---

# Activate Device

## Prerequisites

请做好[前期准备](./prerequisites)流程，并且已经[注册好设备](./register)。

## Activate Device

整个激活设备过程，需要执行 3 个命令，命令行模版如下：

### 1. 生成激活信息

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product <PRODUCT_PUBKEY>
```

- `--user` 是指对应的私钥文件
- `--device` 是指对应的私钥文件
- `--product` 提供对应的 product 公钥

### 2. 对消息进行签名

```sh
cargo run sign-message -k tmp/keys/device1.json <MESSAGE>
```

- `<MESSAGE>` 是指第 1 步中生成的激活信息

### 3. 验证激活

```sh
cargo run activate-device-offchain  --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product <PRODUCT_PUBKEY> --vendor tmp/keys/vendor1.json \
--signature <SIGNATURE> --message <MESSAGE>
```

- `--user` 指对应的 user 私钥文件
- `--device` 指对应的 device 私钥文件
- `--product` 提供对应的 product 公钥
- `--vendor` 指对应的 vendor 私钥文件
- `--signature` 指第 2 步中生成的签名信息
- `--message` 是第 1 步中生成的激活信息

例子如下：

1. **生成激活信息**

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W

```

输出以下内容：

```sh
RPC Endpoint: http://127.0.0.1:8899
Device Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
User Pubkey: 5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
CurrentSlot: 1245

0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366be9228000000000000

```

`0x4445504...` 即为生成的消息

2. **对消息进行签名**

```sh
cargo run sign-message -k tmp/keys/device1.json \ "0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366be9228000000000000"

```

输出以下内容

```sh
Pubkey: 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Signature: 0xb8fb55106acb37906106540eef2c4dc3440f9498b8199583655b9223ce3db70b856c7f67d7007ee0591e03e0ebaf2355cbe824148eb03332d174c031bba9f808
```

`0xb8fb551...` 即为签名消息

3. **验证激活**

```sh
cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W --vendor tmp/keys/vendor1.json \
--signature "0xb8fb55106acb37906106540eef2c4dc3440f9498b8199583655b9223ce3db70b856c7f67d7007ee0591e03e0ebaf2355cbe824148eb03332d174c031bba9f808" \
--message "0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366be9228000000000000"

```

输出以下内容

```sh
Success: 5GMLX5THesoByf8xmKzAQqnvwLtnGsRoc33woiC1hEFtBqAEqTA1f4CiSLor7Qxyz1wrJb4XCs8PN58mRJsSArRz
User   5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
Device 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Mint   HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
AToken 5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb
```

`5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5` 为 User 对应的公钥
`2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd` 为 Device 对应的公钥
`HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti` 为 Device 对应的 DID
`5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb` 为 Device 对应的 AToken


## 使用软件模拟激活过程

### 安装依赖

```sh
cd dephy-id/examples/device_simulator
bun install
```

### 生成设备

```sh
bun generate <-v VENDOR_ADDRESS> <-p PRODUCT_TOKEN> [-t secp256k1|ed25519] [-o FILE_PATH] [-f]
```

- `-v` 必选，生产商的 solana 地址，比如 `4CBgnTunRPYccMR7HcjvNQWchLMB2fTMXGah1L7bfnUR`
- `-p` 必选，产品的 Solana 地址，比如 `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-t` 可选，did 的加密类型，默认：`ed25519` 类型
- `-o` 可选，文件保存路径，默认路径：`./tmp/default.json`
- `-f` 可选，强行覆盖已经存在的文件

**例子如下：**

```sh
bun generate -v fDVGd4CH4LcqjTvXKUJo1wcNhuci6Xr65uBgrWVKk55 \
-p 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

输出内容如下：

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

### 显示设备（模拟的设备）信息

```sh
bun show [-w FILE_PATH]
```

- `-w` 可选，钱包路径，默认：`./tmp/default.json`

**例子如下：**

```sh
bun show
```

输出内容如下：

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

### 激活设备

```sh
bun activate <-o OWNER_ADDRESS> <-p PRODUCT_TOKEN> [-w FILE_PATH]
```

- `-o` 必选，所有者的 Solana 地址，比如 `G2xf2ophFPJpPeZPy2hTU8H5q7YdULkqabD344kM4NAU`
- `-p` 必选，生产商的 solana 地址，比如 `4aLcbu6QdKdWbPAfoQEzTQi3U5Ksd2T5t9Y9vsjW73K7`
- `-i` 可选，DePHY 的程序地址，默认是 development 环境的程序程序地址
- `-w` 可选，钱包地址路径，默认：`./tmp/default.json`

**例子如下：**

```sh
bun activate -o gQDFktfUbvNbrMjp1Qs3Ri62UCbe6bBwZS5Vd1Kaf1S -p \
4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

输出内容如下：

```js
0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9

{
  "keyType": "ed25519",
  "publicKey": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "message": "0x44455048595f49445f5349474e45445f4d4553534147453a9668a0ac36b62bb309a5862944f7ed5e1df38647ab0ad1b55473b3a10ddf52500a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9b2ee6a6600000000",
  "signature": "0x2f45ee5cc68cd7545cd86b7b99d83c6bf013e8a7e7802b0d23e89f12d6d041d9d90df589aefe4a72ba4c26d4a80ea92dec0ad4681d3a479aae0d2059a09c9e03"
}
```

### 签名消息

```sh
bun sign <-m MESSAGE> [-k did|secp256k1|ed25519] [-w FILE_PATH]
```

- `-m` 必选，签名消息，
  - 以 `0x` 开头被视为十六进制字符串，否则被视为纯文本
- `-k` 可选，签名类型，默认：`did`类型
- `-w` 可选，可选，钱包地址路径，默认 `./tmp/default.json`

**例子如下：**

```sh
bun sign -m 0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9
```

输出内容如下：

```js
{
  "keyType": "ed25519",
  "publicKey": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "message": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "signature": "0x47e9ac8f9b14f2917977a50e1eed4cb27499a2c8e8b4d1b1b5a4476591f9397dcfc098b4885991d30c9bdfa857f787128ced1973dda062ca8bd634726d7d0209"
}
```

### 验证消息

```sh
bun verify <-m MESSAGE> <-s SIGNATURE> [-k did|secp256k1|ed25519] [-w FILE_PATH]
```

- `-m` - `-m` 必选，签名消息
  - 以 `0x` 开头被视为十六进制字符串，否则被视为纯文本
- `-s` 必选，签名消息，必须为十六进制字符串
- `-k` 可选，验证类型，默认：`did`类型
- `-w` 可选，钱包地址路径，默认：`./tmp/default.json`

**例子如下：**

```sh
bun verify -m 0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9 \
-s 0x47e9ac8f9b14f2917977a50e1eed4cb27499a2c8e8b4d1b1b5a4476591f9397dcfc098b4885991d30c9bdfa857f787128ced1973dda062ca8bd634726d7d0209
```

输出内容如下：

```js
{
  "keyType": "ed25519",
  "publicKey": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "message": "0x0a17e589e7f1d8406b856369e6fb96f94682d730581f8d1babb6ec805e9b62b9",
  "signature": "0x47e9ac8f9b14f2917977a50e1eed4cb27499a2c8e8b4d1b1b5a4476591f9397dcfc098b4885991d30c9bdfa857f787128ced1973dda062ca8bd634726d7d0209",
  "verified": true
}
```