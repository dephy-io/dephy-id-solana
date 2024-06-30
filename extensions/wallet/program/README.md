DePHY ID wallet Solana program
====

> Note: Use `Solana 1.18.15` or later

## Local setup

## Compile program

```sh
cargo-build-sbf
```

## Test program

```sh
cargo-test-sbf
```

### Deploy program

```sh
solana -u l program deploy target/deploy/dephy_id_wallet.so --program-id ./program/keypair.json
```
