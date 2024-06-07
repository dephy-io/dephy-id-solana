---
sidebar_position: 3
sidebar_label: Activate
---

# 激活设备

## 前期准备

请查看 [前期准备](./prerequisites)

## Activate Device

```sh
# the VENDOR_PUBKEY is from "Create Vendor" step's command output

cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json --product <PRODUCT_PUBKEY>

cargo run sign-message -k tmp/keys/device1.json <MESSAGE>

cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json --product <PRODUCT_PUBKEY> --vendor tmp/keys/vendor1.json --signature <SIGNATURE> --message <MESSAGE>
```

```sh
cargo run generate-message --user tmp/keys/user1.json --device tmp/keys/device1.json --product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W

# 输出以下内容
RPC Endpoint: http://127.0.0.1:8899
Device Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
User Pubkey: 5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
CurrentSlot: 8945
0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366be9228000000000000

##########

cargo run sign-message -k tmp/keys/device1.json "0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366be9228000000000000"

# 输出以下内容
Pubkey: 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Signature: 0xb8fb55106acb37906106540eef2c4dc3440f9498b8199583655b9223ce3db70b856c7f67d7007ee0591e03e0ebaf2355cbe824148eb03332d174c031bba9f808

##########

cargo run activate-device-offchain --device tmp/keys/device1.json --user tmp/keys/user1.json --product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W --vendor tmp/keys/vendor1.json \
--signature "0xb8fb55106acb37906106540eef2c4dc3440f9498b8199583655b9223ce3db70b856c7f67d7007ee0591e03e0ebaf2355cbe824148eb03332d174c031bba9f808" --message "0x44455048595f49445f5349474e45445f4d4553534147453af7f5555225875ac43e49887e0bebe8a9db759a60e21ec99fd3dd74217cfc633f3e67fdc511b3bb88302587e129d25da4aaa3ad50f9288aa8d5ec7b27404366be9228000000000000"

# 输出以下内容
Success: 5GMLX5THesoByf8xmKzAQqnvwLtnGsRoc33woiC1hEFtBqAEqTA1f4CiSLor7Qxyz1wrJb4XCs8PN58mRJsSArRz
User   5CcFND4w6rqViD4CqAViV67GnpbHdo1MaPz4Wej6yYL5
Device 2Xoru6yaXoMbicMKJY3VUH9hUWMXmzve9umswCe9SSQd
Mint   HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
AToken 5jWTFeptMH598ADGfeP9Krh9QTRMRbvavGWfDeV7QLRb
```