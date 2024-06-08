---
sidebar_position: 2
sidebar_label: Register
---

# Register Device

## Prerequisites

请查看 [前期准备](./prerequisites) 环节

## Create Product

创建设备生产商，用到的私钥文件 `./tmp/keys/vendor1.json` 在**前期准备环节**已经准备好。

```sh
cargo run create-product --vendor ./tmp/keys/vendor1.json \
'Product 1' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor"
```

- `--vendor` 是指对应的私钥文件
- `'Product 1'` 是设备商的名称
- `'SYMBOL'` 是设备商的标识
- `METADATA_URI` 是设备商的属性 URI
- `-m` 是对应的描述

执行正确，会有以下输出：

```sh
Success: 3Q53iJiPaVYEH9E6eVq7Vh6EaucsugabwRvyJetcCZeKWJABixv1A4bJ4ErTuzPCUnhwAJL7uoLQcZv1p2UYLbWj
Product Token Created: 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

`4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W` 即为 product 公钥，会在下一步中用到。

## Create Device

创建设备，命令行模版如下：

```sh
cargo run create-device --vendor ./tmp/keys/vendor1.json --product <PRODUCT_PUBKEY> \
--device <DEVICE_PUBKEY> 'Device#1' 'METADATA_URI'
```

- `--vendor` 是指对应的私钥文件
- `--product` 提供对应的 product 公钥，即为上一个操作中的 `4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W`
- `--device` 提供对应的 device 公钥，在前期准备中，我们生成了 3 个文件，分别是 `device1.json device2.json device3.json`, 这几个文件保存的是私钥，通过 `solana address -k device1.json` 命令，可以查看相对应的公钥地址
- `'Device#1'` 是指设备的名称
- `METADATA_URI` 是指设备的属性 URI

例子如下：

```sh
cargo run create-device --vendor ./tmp/keys/vendor1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W  \
--device `solana address -k ./tmp/keys/device1.json` \
'Device#1' 'METADATA_URI'

```

执行正确，会有以下输出：

```sh
Success: 31Zirgo9jNrw7t55PBd23t181La67kg8DvMLLtu8c4pbFEx8kR8MBFpub5bdPLZbjcESbumakD2Zx7HoCHY3EgRF
Device Token: 2p7wCFsB82cDNwwpSczzCDDsFkgKyYqfDadGWMNQUZvT
DID Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
```

`2p7wCFsB82cDNwwpSczzCDDsFkgKyYqfDadGWMNQUZvT` 为 Device 对应的 Token

`HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti` 为 Device 对应的 DID