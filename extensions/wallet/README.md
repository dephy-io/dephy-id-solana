# DePHY ID wallet

## Test

```sh
# if `../../target/deploy/dephy_id_program.so` not exist, build it in parent first
cd ..
cargo build-sbf

# build wallet program
cd wallet
cargo build-sbf

# if updated `dephy-id-program-client`, regenerate client
bun install
bun generate

# test with local validator
bun clients:js:test
```

