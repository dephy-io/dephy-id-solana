
DePHY=keys/DePHY.json
TOKEN2022=TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

function solana_local() {
    solana -C config.yml $@
}

function spl_token_22() {
    spl-token $1 -C config.yml -p $TOKEN2022 "${@:2}"
}
