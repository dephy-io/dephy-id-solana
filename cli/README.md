# DePHY cli & indexer

## Example

1. Build program:

        cargo-build-sbf --tools-version v1.41

2. Run `solana-test-validator`

3. Run indexer

        cargo run --bin indexer

4. Deploy

        solana -u l program deploy target/deploy/dephy_io_dephy_id.so --program-id ./program/keypair.json

5. Create DePHY

        cargo run --bin dephy-cli create-dephy --admin admin.json

6. Create Vendor

        cargo run --bin dephy-cli create-vendor --admin admin.json --vendor $(solana address -k vendor.json) 'Example Vendor' 'DVD' 'https://example.com'

7. Create Product

        cargo run --bin dephy-cli create-product --vendor vendor.json "PRODUCT1"

8. Create Device

        cargo run --bin dephy-cli create-device --vendor vendor.json --device device.json --product <PRODUCT_PUBKEY>

9. Activate Device

        cargo run --bin dephy-cli activate-device --device device.json --user user.json --product <PRODUCT_PUBKEY>

