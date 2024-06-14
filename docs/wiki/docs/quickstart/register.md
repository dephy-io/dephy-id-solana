---
sidebar_position: 2
sidebar_label: Register
---

# Register Device

## Prerequisites

Please refer to the [**preparation**](./prerequisites) phase first.

## Create Product

Create the device product, using the privatekey file `./tmp/keys/vendor1.json` which has been prepared in the preparation phase.

```sh
cargo run create-product --vendor ./tmp/keys/vendor1.json \
'Product 1' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor"
```

- `--vendor` is privatekey file of vendor
- `'Product 1'` is product title
- `'SYMBOL'` is product symbol
- `METADATA_URI` is product metadata uri
- `-m` is product description

If executed correctly, the following output will appear:

```sh
Success: 3Q53iJiPaVYEH9E6eVq7Vh6EaucsugabwRvyJetcCZeKWJABixv1A4bJ4ErTuzPCUnhwAJL7uoLQcZv1p2UYLbWj
Product Token Created: 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W
```

`4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W` is product pubkey addres, will be used in the next step.

## Create Device

```sh
cargo run create-device --vendor ./tmp/keys/vendor1.json --product <PRODUCT_PUBKEY> \
--device <DEVICE_PUBKEY> 'Device#1' 'METADATA_URI'
```

- `--vendor` is privatekey file of user
- `--product` is pubkey address of product. we can use `4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W`- prev step generated
- `--device` is pubkey address of device. In the preparation phase, we generated the 3 files:`device1.json device2.json device3.json`, these file's content is private key. We can check the address by `solana address -k device1.json` cli.
- `'Device#1'` is device name
- `METADATA_URI` is device metadata uri

example：

```sh
cargo run create-device --vendor ./tmp/keys/vendor1.json \
--product 4Dx9QF8ixhXdi9xdkW6RBa61UedNC1KSWDVKWdut687W  \
--device `solana address -k ./tmp/keys/device1.json` \
'Device#1' 'METADATA_URI'

```

If executed correctly, the following output will appear:

```sh
Success: 31Zirgo9jNrw7t55PBd23t181La67kg8DvMLLtu8c4pbFEx8kR8MBFpub5bdPLZbjcESbumakD2Zx7HoCHY3EgRF
Device Token: 2p7wCFsB82cDNwwpSczzCDDsFkgKyYqfDadGWMNQUZvT
DID Mint: HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti
```

`2p7wCFsB82cDNwwpSczzCDDsFkgKyYqfDadGWMNQUZvT` is device Token

`HgvgAsSg5dJwLtek4kATxstBDJbDXYwKv6Ak7jJWoBti` is device DID