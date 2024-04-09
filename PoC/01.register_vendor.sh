#!/usr/bin/env sh

# DePHY Register a vendor

# A Vendor is just an address holding a DePHY vendor token


source ./utils.sh

VENDOR_KEY=$1
VENDOR_TOKEN_KEY=$2

if [[ -z $VENDOR_KEY ]]
then
    VENDOR_KEY=keys/VENDOR1.json
fi

if [[ -z $VENDOR_TOKEN_KEY ]]
then
    VENDOR_TOKEN_KEY=keys/VENDOR1TOKEN.json
fi

# create DePHY Vendor token
spl_token_22 create-token --enable-non-transferable --enable-metadata --decimals 0 $VENDOR_TOKEN_KEY
spl_token_22 initialize-metadata $VENDOR_TOKEN_KEY "DePHY Example Vendor" "DVND1" "https://example.com/metadata.json"
spl_token_22 update-metadata $VENDOR_TOKEN_KEY 'description' 'Example DePHY Vendor'

# mint it
spl_token_22 create-account --owner $VENDOR_KEY --fee-payer $DePHY $VENDOR_TOKEN_KEY
spl_token_22 mint $VENDOR_TOKEN_KEY 1 --recipient-owner $VENDOR_KEY

# disable mint
spl_token_22 authorize --disable $VENDOR_TOKEN_KEY mint

echo "https://solana.fm/address/$(solana address -k $VENDOR_KEY)/nfts"

