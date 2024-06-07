---
sidebar_position: 2
sidebar_label: Register
---

# 注册设备

## 前期准备

请查看 [前期准备](./prerequisites)

### Create Product

```sh
cargo run create-product --vendor ./tmp/keys/vendor1.json 'Product 1' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor"

# 会有以下输出：
Success: 3Q53iJiPaVYEH9E6eVq7Vh6EaucsugabwRvyJetcCZeKWJABixv1A4bJ4ErTuzPCUnhwAJL7uoLQcZv1p2UYLbWj
Product Token Created: 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

## Create Device

```sh
# the PRODUCT_PUBKEY is from "Create Product" step's command output
# the DEVICE_PUBKEY can get by `solana address -k ./tmp/keys/device1.json`

# cargo run create-device --vendor ./tmp/keys/vendor1.json --product <PRODUCT_PUBKEY> --device <DEVICE_PUBKEY> 'Device#1' 'METADATA_URI'

cargo run create-device --vendor ./tmp/keys/vendor1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W  \
--device `solana address -k ./tmp/keys/device1.json` \
'Device#1' 'METADATA_URI'

# 会有以下输出：
Success: 31Zirgo9jNrw7t55PBd23t181La67kg8DvMLLtu8c4pbFEx8kR8MBFpub5bdPLZbjcESbumakD2Zx7HoCHY3EgRF
Device Token: 2p7wCFsB82cDNwwpSczzCDDsFkgKyYqfDadGWMNQUZvT
DID Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
```