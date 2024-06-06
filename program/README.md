DePHY ID Solana program
====

> Run all commands in the root of the repo

> Note: Use `Solana 1.18.12` or later

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
solana -u l program deploy target/deploy/dephy_id_program.so --program-id ./program/keypair.json
```
