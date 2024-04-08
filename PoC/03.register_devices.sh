#!/usr/bin/env sh

# Vendor register a device
# by mint a Product token to it

# A Device is an address holding a Product token


source ./utils.sh

VENDOR_KEY=$1
PRODUCT_KEY=$2
DEVICES=${@:3}

if [[ -z $VENDOR_KEY ]]
then
    VENDOR_KEY=keys/VENDOR1.json
fi

if [[ -z $PRODUCT_KEY ]]
then
    PRODUCT_KEY=keys/PRODUCT1.json
fi

if [[ -z $DEVICES ]]
then
    DEVICES="keys/DEVICE1.json keys/DEVICE2.json keys/DEVICE3.json"
fi

for DEVICE in $DEVICES
do
    echo Airdrop to device $(solana address -k $DEVICE)
    spl_token_22 create-account --owner $DEVICE --fee-payer $VENDOR_KEY $PRODUCT_KEY
    spl_token_22 mint --fee-payer $VENDOR_KEY --mint-authority $VENDOR_KEY $PRODUCT_KEY 1 --recipient-owner $DEVICE
done

echo "https://solana.fm/address/$(solana address -k $PRODUCT_KEY)/distribution"

