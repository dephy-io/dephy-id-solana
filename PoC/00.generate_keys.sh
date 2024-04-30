#!/usr/bin/env sh

solana-keygen new --no-bip39-passphrase -s -o ./keys/DePHY.json
solana-keygen new --no-bip39-passphrase -s -o ./keys/VENDOR1.json
solana-keygen new --no-bip39-passphrase -s -o ./keys/PRODUCT1.json
solana-keygen new --no-bip39-passphrase -s -o ./keys/DEVICE1.json
solana-keygen new --no-bip39-passphrase -s -o ./keys/DEVICE2.json
solana-keygen new --no-bip39-passphrase -s -o ./keys/DEVICE3.json
solana-keygen new --no-bip39-passphrase -s -o ./keys/USER1.json

solana -u l airdrop 10 ./keys/DePHY.json
solana -u l airdrop 10 ./keys/VENDOR1.json
solana -u l airdrop 10 ./keys/USER1.json
