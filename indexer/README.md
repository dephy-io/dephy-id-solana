# DePHY ID indexer

This is a very basic indexer implementation for indexing vendors, products, devices, and their owners.

## Setup

### [Install EdgeDB](https://docs.edgedb.com/get-started/quickstart#installation)

```sh
brew tap edgedb/tap
brew install edgedb-cli
```

### Setup local EdgeDB

```sh
cd indexer
edgedb project init --server-instance dephy-indexer --non-interactive

bun install
bun generate:edgeql
```

### Public GraphQL endpoints and allow CORS

```sh
edgedb configure set cors_allow_origins '*'
```

```sh
edgedb -I dephy-indexer
```

```
configure instance insert cfg::Auth {
   priority := -1,
   method := (insert cfg::Trust { transports := "SIMPLE_HTTP" }),
};
```

### Create admin user for indexer

```sh
edgedb -I dephy-indexer
```

```
insert AuthUser { is_admin := true };
```

Set the env `CURRENT_AUTH_USER_ID` to be the uuid from above.

### (optional) Upgrade

```sh
cd indexer
edgedb migration apply
bun generate:edgeql
```

## Run

Local `solana-test-validator`

`bun dephy-indexer`

Mainnet

`bun dephy-indexer -r SOLANA_HTTP_RPC_URL -s SOLANA_WS_RPC_URL -p DiSU1nme5VJvMdry5FYhfw6LLFb3HUFLkCLZDe53x3PV`

## Cheatsheets

Run EdgeDB Web UI

`edgedb ui`

local edgedb url and port can be found here

Generate EdgeDB migrations

`edgedb migration create`

Migrate EdgeDB

`edgedb migrate`

Destroy EdgeDB instance

`edgedb instance destroy -I dephy-indexer --force`

Regenerate EdgeDB queries

`bunx @edgedb/generate queries`
