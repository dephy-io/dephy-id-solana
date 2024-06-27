---
sidebar_position: 1
sidebar_label: Prerequisites
---

# Prerequisites

## Tech Background

Please read the [**article**](/docs/tutorial-basics/tech_background.md) about DePHY Tech Background.

## Setup Environment

### Install Rust

Install Rust with the following cli:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Check the `rust` and `rustup` version:

```sh
rustup -V
rustc -Vv
```

### Install Solana

Install Solana with the following cli:

```sh
# The current latest version is 1.18.15
sh -c "$(curl -sSfL https://release.solana.com/v1.18.15/install)"
```

Check the `solana` version:

```sh
solana -V
```

More information, please read: https://solana.com/developers/guides/getstarted/setup-local-development

### Install EdgeDB

```sh
curl https://sh.edgedb.com --proto '=https' -sSf1 | sh
```

check EdgeDB version:

```sh
edgedb -V
```

### Install Bun

Run the following cli:

```sh
curl -fsSL https://bun.sh/install | bash
```

check Bun version:

```sh
bun -v
```

### Install Node.js

Run the following cli:

```sh
curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh

sudo bash /tmp/nodesource_setup.sh

sudo apt install nodejs
node -v
npm -v
```

### Install pnpm

```sh
npm i -g pnpm
pnpm -v
```

## DePHY

### Launch EdgeDB Instance

```bash
cd dephy-id/indexer

edgedb project init --server-instance dephy-indexer --non-interactive

```

If the launch is successful, the following output will be displayed:

```sh
Found `edgedb.toml` in ~/dephy/dephy-id/indexer
Initializing project...
Checking EdgeDB versions...
┌────────────────────────┬───────────────────────────────────────────────────┐
│ Project directory      │ ~/dephy/dephy-id/indexer                          │
│ Project config         │ ~/dephy/dephy-id/indexer/edgedb.toml              │
│ Schema dir (non-empty) │ ~/dephy/dephy-id/indexer/dbschema                 │
│ Installation method    │ portable package                                  │
│ Version                │ 5.4                                               │
│ Instance name          │ dephy-indexer                                     │
└────────────────────────┴───────────────────────────────────────────────────┘

Version 5.4 is already downloaded
Initializing EdgeDB instance...
Applying migrations...
Applied m1r56uiyf3evxkharcfm5ohxytt4l27epqwbxghc4grliqnr56taga
Project initialized.
To connect to dephy-indexer, run `edgedb`
...
```

### Run solana local node

```sh
solana config set --url localhost # set network is localhost

solana-test-validator
```

Run the following command to test the solana local node. If the output is displayed, the local Solana node is successfully started:

```sh
curl http://127.0.0.1:8899 -X POST -H "Content-Type: application/json" -d '
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getClusterNodes"
    }
  '
```

### Generate solana account and airdrop

```sh
cd dephy-io
./scripts/generate_demo_keys.sh
```

This command generates a total of 6 files, each of which holds the privatekey for the solana address.
While executing this command, a certain amount of sol is dropped to several addresses, so the previous step is important.

Let us check these privatekey files:

```sh
ls tmp/keys

# admin.json user1.json vendor1.json
# device1.json device2.json device3.json
```

### Build solana contract

Run the following cli:

```sh
cd dephy-io
cargo-build-sbf
```

After a period of (possibly long) compilation, the file `target/deploy/dephy_id_program.so` is generated, which is solana's contract file.

### Deploy solana contract

Run the following cli:

```sh
cd dephy-io
solana -u l program deploy target/deploy/dephy_id_program.so --program-id ./program/keypair.json
```

If executed correctly, the following output will appear:

```sh
Program Id: hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1
```

### Initialize the solana contract

Set up an administrator for the solana contract.

```sh
cd dephy-io
cargo run initialize --admin ./tmp/keys/admin.json

```

The output content is as follows:

```
Success: FDXBFCH9UJ36GTE4WerZJu6NjE3EZRQrYxwDMA5wEpKBcmqT4YjGczgnKTd1ogWUXGcpV2xb56Ec6wDbf8Gx6ua
DePHY Created: AwjekLaTfwaWYWhUg25oir4ygqxvzAKM7yeHDRHEZDGu
```

### Launch Indexer

After indexer is started, the subsequent registration and activation of the device will be synchronized to the offchain for easy query.

```sh
cd indexer
bun dephy-indexer
```

### Open EdgeDB web UI

Open the EdgeDB web page to display the data and struct.

```sh
cd indexer
edgedb ui
```

The page is as follows:

![](/img/edgedb-ui.png)
