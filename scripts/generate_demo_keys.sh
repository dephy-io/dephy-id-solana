#!/usr/bin/env sh

SCRIPT_PATH=$(dirname "$(readlink -f "$0")")
KEYS_PATH=$(dirname "$SCRIPT_PATH")/tmp/keys

mkdir -p "$KEYS_PATH"

solana-keygen new --no-bip39-passphrase -s -o "$KEYS_PATH"/admin.json
solana-keygen new --no-bip39-passphrase -s -o "$KEYS_PATH"/vendor1.json
solana-keygen new --no-bip39-passphrase -s -o "$KEYS_PATH"/user1.json
solana-keygen new --no-bip39-passphrase -s -o "$KEYS_PATH"/device1.json
solana-keygen new --no-bip39-passphrase -s -o "$KEYS_PATH"/device2.json
solana-keygen new --no-bip39-passphrase -s -o "$KEYS_PATH"/device3.json

solana -u l airdrop 10 "$KEYS_PATH"/admin.json
solana -u l airdrop 10 "$KEYS_PATH"/vendor1.json
solana -u l airdrop 10 "$KEYS_PATH"/user1.json
