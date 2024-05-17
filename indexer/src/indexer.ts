import assert from "assert/strict"
import fs from "fs"
import path from "path"
import { RpcGraphQL, createRpcGraphQL } from "@solana/rpc-graphql"
import {
    Account,
    Address,
    Base58EncodedBytes,
    Commitment,
    IAccountMeta,
    Rpc, RpcSubscriptions, Signature, SolanaRpcApiMainnet, SolanaRpcSubscriptionsApi,
    address,
    assertAccountDecoded,
    createSolanaRpc, createSolanaRpcSubscriptions,
    getBase58Encoder,
    signature,
} from "@solana/web3.js"
import { Client, Executor, createClient } from "edgedb"
import e from "../dbschema/edgeql-js"
import {
    DephyAccount,
    DephyIdInstruction,
    KeyType,
    ParsedActivateDeviceInstruction, ParsedCreateDephyInstruction, ParsedCreateDeviceInstruction,
    ParsedCreateProductInstruction, ParsedCreateVendorInstruction,
    fetchDephyAccount,
    findDephyAccountPda,
    identifyDephyIdInstruction,
    parseActivateDeviceInstruction, parseCreateDephyInstruction, parseCreateDeviceInstruction,
    parseCreateProductInstruction, parseCreateVendorInstruction
} from "./dephy-id"


interface Config {
    rpc_url?: string
    pubsub_url?: string
    database_url?: string
    plugins_dir?: string
}

interface IxMeta {
    tx: string
    index: number
}

type PartiallyDecodedTransactionInstruction = {
    accounts: readonly Address[];
    data: Base58EncodedBytes;
    programId: Address;
}

type ParsedTransactionInstruction = {
    parsed: {
        info?: object;
        type: string;
    };
    program: string;
    programId: Address;
}

interface IPlugin {
    initialize: () => Promise<any>
    matchIx: (ix: PartiallyDecodedTransactionInstruction | ParsedTransactionInstruction) => boolean
    processIx: (rpc: Rpc<SolanaRpcApiMainnet>, ix: PartiallyDecodedTransactionInstruction | ParsedTransactionInstruction, meta: IxMeta) => Promise<any>
}

export class Indexer {
    rpc: Rpc<SolanaRpcApiMainnet>
    subscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>
    rpcGraphQL: RpcGraphQL
    abortController: AbortController
    database_url: string
    db!: Client
    dephy!: Account<DephyAccount, string>
    plugins: IPlugin[] = []

    constructor({
        rpc_url,
        pubsub_url,
        database_url,
        plugins_dir,
    }: Config) {
        this.rpc = createSolanaRpc(rpc_url!)
        this.subscriptions = createSolanaRpcSubscriptions(pubsub_url!)
        this.rpcGraphQL = createRpcGraphQL(this.rpc)
        this.database_url = database_url!
        this.abortController = new AbortController()

        let plugins_path = path.resolve(plugins_dir!)
        let dirs = fs.readdirSync(plugins_path, {withFileTypes: true})
        console.log('loading plugins from', plugins_path)
        let self = this
        dirs.forEach(async (dir) => {
            const plugin = await import(path.join(plugins_path, dir.name))
            console.log('init plugin', dir.name)
            await plugin.initialize()
            self.plugins.push(plugin)
        })
    }

    public async ensureConnected() {
        this.db = await createClient(this.database_url)
            .withRetryOptions({
                attempts: 3,
                backoff: (attemptNo: number) => {
                    return 2 ** attemptNo * 100 + Math.random() * 100
                },
            })
            .ensureConnected();

        console.log('db connected')

        return await this.rpc.getHealth().send()
    }

    public async ensureDephyAccount(program_id: string) {
        const [dephy_pubkey, bump] = await findDephyAccountPda({ programAddress: address(program_id) })

        let dephy_account = await fetchDephyAccount(this.rpc, dephy_pubkey)
        assertAccountDecoded<DephyAccount>(dephy_account)
        assert.equal(program_id, dephy_account.programAddress)
        assert.equal(bump, dephy_account.data.data.bump)
        assert.equal(false, dephy_account.executable)

        this.dephy = dephy_account
        console.log('Program:   ', dephy_account.programAddress)
        console.log('Account:   ', dephy_account.address)
        console.log('Authority: ', dephy_account.data.authority)
    }


    public async run(program_id: string, commitment: Commitment = 'finalized') {
        let program_address = address(program_id)
        await this.ensureDephyAccount(program_address)

        const notifications = await this.subscribeLogs(program_address, commitment)
        console.log('logs subscribed')

        await this.fillMissingTransactions(program_address, commitment)

        for await (const notification of notifications) {
            const { context: { slot }, value: { signature, err } } = notification
            let saved_tx = await this.saveTx({ slot, signature, err })
            const _ = this.processTx(saved_tx, signature);
        }
    }


    // fetch all missing then process from the beginning
    async fillMissingTransactions(program_address: Address, commitment: Commitment) {
        let done = false
        let tx_signature: Signature | undefined
        while (!done) {
            done = true
            let txs = await this.getTransactions(program_address, tx_signature)
            for (const tx of txs) {
                let saved_tx = await this.loadTx(tx.signature)
                if (!saved_tx) {
                    done = false
                    await this.saveTx(tx)
                }
                tx_signature = tx.signature
            }
        }

        let unprocessed_txs = await e.select(e.Transaction, tx => ({
            id: true,
            signature: true,
            filter: e.op('not', tx.processed),
            order_by: {
                expression: tx.slot,
                direction: e.ASC,
            }
        })).run(this.db)

        for (const tx of unprocessed_txs) {
            await this.processTx(tx, tx.signature)
        }

        console.log('all missing txs filled')
    }

    getTransactions(program_address: Address, beforeTx?: Signature) {
        return this.rpc.getSignaturesForAddress(program_address, {
            before: beforeTx,
            limit: 100,
            commitment: 'finalized',
        }).send()
    }

    subscribeLogs(program_address: Address, commitment: Commitment) {
        return this.subscriptions
            .logsNotifications({
                mentions: [program_address]
            }, { commitment })
            .subscribe({
                abortSignal: this.abortController.signal
            })
    }

    getTx(tx_signature: string, commitment: Commitment = 'confirmed') {
        return this.rpc.getTransaction(signature(tx_signature), {
            commitment,
            maxSupportedTransactionVersion: 0,
            encoding: 'jsonParsed',
        })
        .send()
    }

    saveTx({ slot, signature, err }: { slot: bigint, signature: string, err: any }) {
        if (err) {
            err = JSON.stringify(err, (_k, v) => {
                if (typeof v === 'bigint') {
                    return Number(v)
                }
                return v
            })
        }

        console.log('Saving tx', signature, slot, err)
        return e.insert(e.Transaction, {
            slot,
            signature,
            err
        }).unlessConflict(tx => ({
            on: tx.signature,
            else: e.update(tx, () => ({
                set: {
                    slot,
                    err
                }
            }))
        })).run(this.db)
    }

    loadTx(tx_signature: string) {
        return e.select(e.Transaction, () => ({
            filter_single: {
                signature: tx_signature
            }
        })).run(this.db)
    }

    handleCreateDephy(create_dephy: ParsedCreateDephyInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        return e.insert(e.DePHY, {
            pubkey: create_dephy.accounts.dephy.address,
            authority: e.insert(e.Admin, {
                pubkey: create_dephy.accounts.authority.address
            }),
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
        })
    }

    handleCreateVendor(create_vendor: ParsedCreateVendorInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        return e.insert(e.Vendor, {
            pubkey: create_vendor.accounts.vendor.address,
            mint_account: create_vendor.accounts.vendorMint.address,
            mint_authority: null,
            token_account: create_vendor.accounts.vendorAtoken.address,
            metadata: e.insert(e.TokenMetadata, {
                name: create_vendor.data.name,
                symbol: create_vendor.data.symbol,
                uri: create_vendor.data.uri,
                additional: create_vendor.data.additionalMetadata as [string, string][],
            }),
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
        })
    }

    handleCreateProduct(create_product: ParsedCreateProductInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        return e.insert(e.Product, {
            mint_account: create_product.accounts.productMint.address,
            mint_authority: create_product.accounts.vendor.address,
            vendor: e.select(e.Vendor, () => ({
                filter_single: { pubkey: create_product.accounts.vendor.address }
            })),
            metadata: e.insert(e.TokenMetadata, {
                name: create_product.data.name,
                symbol: create_product.data.symbol,
                uri: create_product.data.uri,
                additional: create_product.data.additionalMetadata as [string, string][],
            }),
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
        })
    }

    handleCreateDevice(create_device: ParsedCreateDeviceInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        return e.insert(e.Device, {
            pubkey: create_device.accounts.device.address,
            token_account: create_device.accounts.productAtoken.address,
            product: e.select(e.Product, () => ({
                filter_single: {
                    mint_account: create_device.accounts.productMint.address,
                }
            })),
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
            key_type: e.cast(e.KeyType, e.str(KeyType[create_device.data.keyType])),
        })
    }

    async handleActivateDevice(db_tx: Executor, activate_device: ParsedActivateDeviceInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        let user = await e.select(e.User, () => ({
            filter_single: {
                pubkey: activate_device.accounts.user.address,
            }
        })).run(db_tx)

        let user_query;
        if (user) {
            user_query = e.select(e.User, () => ({
                filter_single: {
                    pubkey: activate_device.accounts.user.address,
                }
            }))
        } else {
            user_query = e.insert(e.User, {
                pubkey: activate_device.accounts.user.address,
            })
        }

        await e.insert(e.DID, {
            mint_account: activate_device.accounts.didMint.address,
            mint_authority: null,
            token_account: activate_device.accounts.didAtoken.address,
            device: e.select(e.Device, () => ({
                filter_single: {
                    pubkey: activate_device.accounts.device.address,
                }
            })),
            user: user_query,
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
        }).run(db_tx)

        // TODO: fetch DID metadata
    }

    async processDephyIx(db_tx: Executor, ix: PartiallyDecodedTransactionInstruction, meta: IxMeta) {
        let dephy_ix = {
            accounts: ix.accounts.map(address => ({address, role: 0})),
            data: Uint8Array.from(getBase58Encoder().encode(ix.data)),
            programAddress: ix.programId,
        }

        switch (identifyDephyIdInstruction(dephy_ix)) {
            case DephyIdInstruction.CreateDephy:
                let create_dephy = parseCreateDephyInstruction(dephy_ix)
                await this.handleCreateDephy(create_dephy, meta).run(db_tx)
                break

            case DephyIdInstruction.CreateVendor:
                let create_vendor = parseCreateVendorInstruction(dephy_ix)
                await this.handleCreateVendor(create_vendor, meta).run(db_tx)
                break

            case DephyIdInstruction.CreateProduct:
                let create_product = parseCreateProductInstruction(dephy_ix)
                await this.handleCreateProduct(create_product, meta).run(db_tx)
                break

            case DephyIdInstruction.CreateDevice:
                let create_device = parseCreateDeviceInstruction(dephy_ix)
                await this.handleCreateDevice(create_device, meta).run(db_tx)
                break

            case DephyIdInstruction.ActivateDevice:
                let activate_device = parseActivateDeviceInstruction(dephy_ix)
                await this.handleActivateDevice(db_tx, activate_device, meta)
                break

            default:
                break
        }
    }

    async processTx(tx_filter: { id: string }, signature: string) {
        let tx = await this.getTx(signature)

        if (!tx) {
            console.error("Can't fetch", signature)
            return
        } else {
            console.log('Processing', signature, tx.blockTime)
        }

        await this.db.transaction(async db_tx => {
            let i = 0
            for (const ix of tx.transaction.message.instructions) {
                if (tx.meta && !tx.meta.err) {
                    switch (ix.programId) {
                        case this.dephy.programAddress:
                            if ('data' in ix) {
                                await this.processDephyIx(db_tx, ix, {tx: signature, index: i})
                            }
                            break

                        default:
                            break
                    }

                    for (const plugin of this.plugins) {
                        if (plugin.matchIx(ix)) {
                            await plugin.processIx(this.rpc, ix, {tx: signature, index: i})
                        }
                    }
                }
                i += 1
            }

            let block_ts;
            if (tx.blockTime) {
                block_ts = e.datetime(new Date(Number(tx.blockTime) * 1000))
            } else {
                block_ts = null
            }

            await e.update(e.Transaction, () => ({
                filter_single: tx_filter,
                set: {
                    block_ts,
                    processed: true,
                }
            })).run(db_tx)
        })

        console.log('Transaction', signature, 'processed')
    }

}

