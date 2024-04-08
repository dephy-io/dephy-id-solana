#!/usr/bin/env sh

# Vendor Register a product

# Product is a normal SPL token with 0 decimals
# Each device of the product will receive one


source ./utils.sh

VENDOR_KEY=$1
PRODUCT_KEY=$2

if [[ -z $VENDOR_KEY ]]
then
    VENDOR_KEY=keys/VENDOR1.json
fi

if [[ -z $PRODUCT_KEY ]]
then
    PRODUCT_KEY=keys/PRODUCT1.json
fi


# create product token
spl_token_22 create-token --enable-non-transferable --enable-metadata --enable-freeze --decimals 0 --mint-authority $VENDOR_KEY $PRODUCT_KEY

# init token metadata
spl_token_22 initialize-metadata --mint-authority $VENDOR_KEY --update-authority $VENDOR_KEY $PRODUCT_KEY 'Example Vendor Product 1' 'PD1' 'https://example.com/metadata.json'

spl_token_22 update-metadata --authority $VENDOR_KEY $PRODUCT_KEY 'description' 'Example Vendor Product'

echo "https://solana.fm/address/$(solana address -k $PRODUCT_KEY)"

