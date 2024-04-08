#!/usr/bin/env sh

# User activate a device
# The program will mint a DID SBT for the user


source ./utils.sh

USER_KEY=$1
DEVICE=$2

if [[ -z $USER_KEY ]]
then
    USER_KEY=keys/USER1.json
fi

if [[ -z $DEVICE ]]
then
    DEVICE=keys/DEVICE1.json
fi

# get device token infomation
PRODUCT_MINT=`spl_token_22 accounts --owner $DEVICE --output json | jq -r '.accounts[0] .mint'`
PRODUCT_ATOKEN=`spl_token_22 accounts --owner $DEVICE --output json | jq -r '.accounts[0] .address'`

PRODUCT_NAME=`spl_token_22 display $PRODUCT_MINT --output json | jq -r '.extensions .[] | select(.extension == "tokenMetadata") .state .name'`

# freeze the device product token
spl_token_22 freeze --freeze-authority keys/VENDOR1.json $PRODUCT_ATOKEN

# create DePHY DID Token
DID_ADDRESS=`spl_token_22 create-token --enable-non-transferable --enable-metadata --decimals 0 --output json | jq -r '.commandOutput .address'`

spl_token_22 initialize-metadata $DID_ADDRESS "DePHY DID Token" "DDID" "https://example.com/metadata.json"
spl_token_22 update-metadata $DID_ADDRESS 'product' "$PRODUCT_NAME"
spl_token_22 update-metadata $DID_ADDRESS 'device' $(solana address -k $DEVICE)

# mint it
spl_token_22 create-account --owner $USER_KEY --fee-payer $DePHY $DID_ADDRESS
spl_token_22 mint $DID_ADDRESS 1 --recipient-owner $USER_KEY

# disable mint
spl_token_22 authorize --disable $DID_ADDRESS mint


echo "https://solana.fm/address/$(solana address -k $USER_KEY)/nfts"

