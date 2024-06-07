---
sidebar_position: 1
sidebar_label: Prerequisites
---

# Prerequisites

## Setup Environment

### Install Rust

运行以下命令安装 rust 环境：

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

查看是否安装成功：
```sh
rustup -V
rustc -Vv
```

### Install Solana

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

### Install EdgeDB

```sh
curl https://sh.edgedb.com --proto '=https' -sSf1 | sh
```

查看是否安装成功：
```sh
edgedb -V
```

### Install Bun

请运行以下命令：

```sh
curl -fsSL https://bun.sh/install | bash
```

查看是否安装成功：
```sh
bun -v
```

### Install Node.js

请运行以下命令：

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

启动成功，会有以下输出：

```
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
solana config set --url localhost # 设定网络为 localhost

solana-test-validator
```

使用以下命令进行测试，如有输出，说明成功启动 solana 本地节点：

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

本命令一共生成了 6 个文件，每个文件都保存了 solana 地址的私钥。
执行这个命令的同时，并向几个地址空投了一定数量的 sol，所以上一步的操作很重要。

运行以下命令，查看文件：

```sh
ls tmp/keys

# admin.json user1.json vendor1.json
# device1.json device2.json device3.json
```

### Build solana contract

执行以下命令：
```sh
cd dephy-io
cargo-build-sbf
```

经过一段时间 (可能会比较长) 的编译，会生成文件 `target/deploy/dephy_id_program.so`，这就是 solana 的合约文件。

### Deploy solana contract

执行以下命令：

```sh
cd dephy-io
solana -u l program deploy target/deploy/dephy_id_program.so --program-id ./program/keypair.json
```

执行成功，会输出以下内容，

```sh
Program Id: hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1
```

### Initialize the solana contract

为 solana 合约设定管理员。

```sh
cd dephy-io
cargo run initialize --admin ./tmp/keys/admin.json

# 会有以下输出：
Success: FDXBFCH9UJ36GTE4WerZJu6NjE3EZRQrYxwDMA5wEpKBcmqT4YjGczgnKTd1ogWUXGcpV2xb56Ec6wDbf8Gx6ua
DePHY Created: AwjekLaTfwaWYWhUg25oir4ygqxvzAKM7yeHDRHEZDGu
```

### Launch Indexer

启动 indexer，之后的注册、激活设备登操作，会同步到链下，方便查询。

```sh
cd indexer
bun dephy-indexer
```

### Open EdgeDB web UI

打开 EdgeDB 的网页，方便展示数据以及结构。

```sh
cd indexer
edgedb ui
```

页面如下：

![](/img/edgedb-ui.png)
