---
sidebar_position: 1
sidebar_label: Prerequisites
---

# 前期准备

## 环境搭建

### install Rust

运行以下命令安装 rust 环境：

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

查看是否安装成功：
```sh
rustup -V
rustc -Vv
```

### install Solana

运行以下命令安装 solana 环境：

```sh
# 最新版本是 1.18.15
sh -c "$(curl -sSfL https://release.solana.com/v1.18.15/install)"
```

查看是否安装成功：
```sh
solana -V
```

更多内容请看：https://solana.com/developers/guides/getstarted/setup-local-development

### install EdgeDB

```sh
curl https://sh.edgedb.com --proto '=https' -sSf1 | sh
```

查看是否安装成功：
```sh
edgedb -V
```

### install Bun

请运行以下命令：

```sh
curl -fsSL https://bun.sh/install | bash
```

查看是否安装成功：
```sh
bun -v
```

### install Node.js

请运行以下命令：

```sh
curl -sL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh

sudo bash /tmp/nodesource_setup.sh

sudo apt install nodejs
node -v
npm -v
```

### install pnpm

```sh
npm i -g pnpm
pnpm -v
```

## DePHY

### Launch EdgeDB

```bash
cd dephy-id/indexer

edgedb project init --server-instance dephy-indexer --non-interactive

# 正常情况下，会有以下输出 👇
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
```

### Run solana local node

```sh
solana config set --url localhost

solana-test-validator # run local node
```

使用以下命令进行测试：

```sh
curl http://127.0.0.1:8899  -X POST -H "Content-Type: application/json" -d '
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getClusterNodes"
    }
  '
```

### Generate solana account and airdrop

```sh
./scripts/generate_demo_keys.sh
```

### Build solana contract

```sh
cd dephy-io
cargo-build-sbf
```

### Deploy solana contract

```sh
solana -u l program deploy target/deploy/dephy_id_program.so --program-id ./program/keypair.json

## 输出
Program Id: hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1
```

### Initialize the solana contract

```sh
cargo run initialize --admin ./tmp/keys/admin.json

# 会有以下输出：
Success: FDXBFCH9UJ36GTE4WerZJu6NjE3EZRQrYxwDMA5wEpKBcmqT4YjGczgnKTd1ogWUXGcpV2xb56Ec6wDbf8Gx6ua
DePHY Created: AwjekLaTfwaWYWhUg25oir4ygqxvzAKM7yeHDRHEZDGu
```

### Launch Indexer

```sh
cd indexer
bun dephy-indexer
```

### Open edgedb web UI

```sh
edgedb ui
```

将会打开如下页面：

![](/img/edgedb-ui.png)
