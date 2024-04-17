# DePHY DID PoC

In this PoC, we leverage SPL token 2022 to represent DePHY entities and their relationships.

## Requirements

- Solana cli
- `jq`

## Usage

- Run `solana-test-validator`
- Run scripts in order


## Details

0. Generate the keys:
    - `DePHY` act as the program and DePHY admin
    - `VENDORX` as the vendor's keypair
    - `PRODUCTX` as the product token issued by the vendor
    - `DEVICEX` as the device's keypair
    - `USERX` as the end user who bought the device

1. Register Vendor:
    - The DePHY admin can issue a NFT to a Vendor
    - This NFT indicate the owner is a certificated Vendor
    - It has Vendor's metadata and is non-transferable

2. Register Product:
    - A Vendor can issue a SPL token to represent a product they produce
    - The token is fungible, but has 0 decimals, also non-transferable

3. Register Device:
    - Each Device has a fixed Keypair
    - For each device, the Vendor airdrop 1 corresponding product token to it's address
    - So any address owns this token can be identified as a device's pubkey

4. Activate Device:
    - A User can activate a Device by co-sign a tx
    - The program will mint a non-transferable NFT to the User
    - This NFT can be used as a DID subject


## Other extensions

- The Group/Member extensions are not enabled yet.
  They can be used to represent relationship between entities.
- Permanent Delegate can be used to revoke faulty devices
- Transfer Hook can be used to transfer device ownership
