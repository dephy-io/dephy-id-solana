---
sidebar_position: 3
sidebar_label: Activate
---

# Activate Device

## Prerequisites

请做好[前期准备](./prerequisites)流程，并且已经[注册好设备](./register)。

## Activate Device

整个激活设备过程，需要执行 3 个命令，过程如下：

### 1. 生成激活信息

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product <PRODUCT_PUBKEY>
```

- `--user` 是指对应的私钥文件
- `--device` 是指对应的私钥文件
- `--product` 提供对应的 product 公钥

**例子如下**：

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

输出以下内容：

```sh
Device Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
User Pubkey: 5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
Timestamp: 1718330000

0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366bea4bd6b6600000000
```

`0x4445504...` 即为生成的消息

### 2. 对消息进行签名

```sh
cargo run sign-message -k tmp/keys/device1.json <MESSAGE>
```

- `<MESSAGE>` 是指第 1 步中生成的激活信息

**例子如下**：

```sh
cargo run sign-message -k tmp/keys/device1.json \
"0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366bea4bd6b6600000000"
```

输出以下内容：

```sh
Pubkey: 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Signature: 0xa8233c99274dcbea17b35bc33c3963d1fc4952396dde2c3abda60eee62f9f9e24004ceae318dbd96684e3c8b2319697040bf93031a588a2963638988105c0802
```

`0xa8233c...` 即为签名消息

### 3. 验证激活

```sh
cargo run activate-device-offchain  --user tmp/keys/user1.json --device tmp/keys/device1.json \
--product <PRODUCT_PUBKEY> --vendor tmp/keys/vendor1.json \
--signature <SIGNATURE> --message <MESSAGE>
```

- `--user` 是指对应的 user 私钥文件
- `--device` 是指对应的 device 私钥文件
- `--product` 提供对应的 product 公钥
- `--vendor` 是指对应的 vendor 私钥文件
- `--signature` 是指第 2 步中生成的签名信息
- `--message` 是指第 1 步中生成的激活信息

**例子如下**：

```sh
cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W --vendor tmp/keys/vendor1.json \
--signature "0xa8233c99274dcbea17b35bc33c3963d1fc4952396dde2c3abda60eee62f9f9e24004ceae318dbd96684e3c8b2319697040bf93031a588a2963638988105c0802" \
--message "0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366bea4bd6b6600000000"
```

输出以下内容：

```sh
Success: 52k39GgNAmgLft4uFHHqHpvHvFunNKJf3nwByX4EMRmKdVecy7q64vZR9jLKmgqGAUWysCkqkZmZQGFpQmAY2gwU
User   5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
Device 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Mint   HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
AToken 5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb
```

`5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5` 为 User 对应的公钥
`2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd` 为 Device 对应的公钥
`HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti` 为 Device 对应的 DID
`5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb` 为 Device 对应的 AToken
