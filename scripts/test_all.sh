#!/usr/bin/env sh

VENDOR=tmp/keys/vendor1.json
DEVICE=tmp/keys/device1.json
USER=tmp/keys/user1.json

PRODUCT_NAME=$1
if [ -e $PRODUCT_NAME ]
then
    PRODUCT_NAME='Product 1'
fi


PROGRAM_BALANCE=`solana -u l balance hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`
if [[ $PROGRAM_BALANCE == '0 SOL' ]]
then
    # prepare keys
    scripts/generate_demo_keys.sh

    # compile
    cargo-build-sbf --tools-version v1.43

    # deploy
    solana -u l program deploy target/deploy/dephy_id_program.so --program-id ./program/keypair.json

    # init
    cargo run initialize --admin tmp/keys/admin.json
fi


# create product
PRODUCT=`cargo run create-product --vendor $VENDOR "$PRODUCT_NAME" 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor"`
echo $PRODUCT

# create device
cargo run create-device --vendor $VENDOR --product $PRODUCT --device $DEVICE 'Device#1' 'METADATA_URI'

# generate message
MESSAGE=`cargo run generate-message --user $USER --device $DEVICE --product $PRODUCT`
echo Message: $MESSAGE

# sign message
SIGNATURE=`cargo run sign-message -k $DEVICE $MESSAGE`
echo Signature: $SIGNATURE

# activate
cargo run activate-device-offchain --device $DEVICE --user $USER --product $PRODUCT --vendor $VENDOR --signature $SIGNATURE --message $MESSAGE
