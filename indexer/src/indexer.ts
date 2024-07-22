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
    ProgramDataAccount,
    DephyIdInstruction,
    DeviceSigningAlgorithm,
    ParsedActivateDeviceInstruction, ParsedInitializeInstruction, ParsedCreateDeviceInstruction,
    ParsedCreateProductInstruction,
    fetchProgramDataAccount,
    findProgramDataAccountPda,
    identifyDephyIdInstruction,
    parseActivateDeviceInstruction, parseInitializeInstruction, parseCreateDeviceInstruction,
    parseCreateProductInstruction,
    parseCreateActivatedDeviceInstruction,
    ParsedCreateActivatedDeviceInstruction,
    parseCreateActivatedDeviceNonSignerInstruction,
    fetchMaybeProgramDataAccount,
} from "@dephy-io/dephy-id-program-client";

interface Config {
    rpcUrl?: string
    pubSubUrl?: string
    databaseUrl?: string
    pluginsDir?: string
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
    databaseUrl: string
    db!: Client
    programAddress!: Address
    programPda?: Account<ProgramDataAccount, string>
    plugins: IPlugin[] = []

    constructor({
        rpcUrl,
        pubSubUrl,
        databaseUrl,
        pluginsDir,
    }: Config) {
        this.rpc = createSolanaRpc(rpcUrl!)
        this.subscriptions = createSolanaRpcSubscriptions(pubSubUrl!)
        this.rpcGraphQL = createRpcGraphQL(this.rpc)
        this.databaseUrl = databaseUrl!
        this.abortController = new AbortController()

        let pluginsPath = path.resolve(pluginsDir!)
        let dirs = fs.readdirSync(pluginsPath, { withFileTypes: true })
        console.log('loading plugins from', pluginsPath)
        let self = this
        dirs.forEach(async (dir) => {
            const pluginPath = path.join(pluginsPath, dir.name)
            if (path.extname(pluginPath) != '.ts' || path.extname(pluginPath) != '.js') {
                return
            }

            const plugin = await import(path.join(pluginsPath, dir.name))
            console.log('init plugin', dir.name)
            await plugin.initialize()
            self.plugins.push(plugin)
        })
    }

    public async ensureConnected() {
        this.db = await createClient(this.databaseUrl)
            .withGlobals({
                current_auth_user_id: process.env.CURRENT_AUTH_USER_ID
            })
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

    public async ensureProgramDataAccount(programId: string) {
        const [programPdaPubkey, bump] = await findProgramDataAccountPda({ programAddress: address(programId) })

        let programPda = await fetchMaybeProgramDataAccount(this.rpc, programPdaPubkey)

        if (programPda.exists) {
            assertAccountDecoded<ProgramDataAccount>(programPda)
            assert.equal(programId, programPda.programAddress)
            assert.equal(bump, programPda.data.data.bump)
            assert.equal(false, programPda.executable)

            this.programPda = programPda
            console.log('Program:   ', programPda.programAddress)
            console.log('Account:   ', programPda.address)
            console.log('Authority: ', programPda.data.authority)
        }
    }


    public async run(programId: string, commitment: Commitment = 'finalized') {
        this.programAddress = address(programId)
        await this.ensureProgramDataAccount(this.programAddress)

        const notifications = await this.subscribeLogs(this.programAddress, commitment)
        console.log('logs subscribed')

        await this.fillMissingTransactions(this.programAddress, commitment)

        for await (const notification of notifications) {
            const { context: { slot }, value: { signature, err } } = notification
            let savedTx = await this.saveTx({ slot, signature, err })
            const _ = this.processTx(savedTx, signature);
        }
    }


    // fetch all missing then process from the beginning
    async fillMissingTransactions(programAddress: Address, commitment: Commitment) {
        let done = false
        let txSignature: Signature | undefined
        while (!done) {
            done = true
            let txs = await this.getTransactions(programAddress, txSignature)
            for (const tx of txs) {
                let savedTx = await this.loadTx(tx.signature)
                if (!savedTx) {
                    done = false
                    await this.saveTx(tx)
                }
                txSignature = tx.signature
            }
        }

        let unprocessedTxs = await e.select(e.Transaction, tx => ({
            id: true,
            signature: true,
            filter: e.op('not', tx.processed),
            order_by: {
                expression: tx.slot,
                direction: e.ASC,
            }
        })).run(this.db)

        for (const tx of unprocessedTxs) {
            await this.processTx(tx, tx.signature)
        }

        console.log('all missing txs filled')
    }

    getTransactions(programAddress: Address, beforeTx?: Signature) {
        return this.rpc.getSignaturesForAddress(programAddress, {
            before: beforeTx,
            limit: 100,
            commitment: 'finalized',
        }).send()
    }

    subscribeLogs(programAddress: Address, commitment: Commitment) {
        return this.subscriptions
            .logsNotifications({
                mentions: [programAddress]
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

    loadTx(txSignature: string) {
        return e.select(e.Transaction, () => ({
            filter_single: {
                signature: txSignature
            }
        })).run(this.db)
    }

    async handleInitialize(dbTx: Executor, initialize: ParsedInitializeInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        await e.insert(e.Program, {
            pubkey: initialize.accounts.programData.address,
            authority: e.insert(e.Admin, {
                pubkey: initialize.accounts.authority.address
            }),
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
        }).run(dbTx)

        if (this.programAddress == initialize.accounts.programData.address) {
            await this.ensureProgramDataAccount(this.programAddress)
        }
    }

    async handleCreateProduct(dbTx: Executor, createProduct: ParsedCreateProductInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        const vendor = await e.select(e.Vendor, () => ({
            filter_single: {
                pubkey: createProduct.accounts.vendor.address
            }
        })).run(dbTx)

        let vendorQuery
        if (vendor) {
            vendorQuery = e.select(e.Vendor, () => ({
                filter_single: {
                    pubkey: createProduct.accounts.vendor.address
                }
            }))
        } else {
            vendorQuery = e.insert(e.Vendor, {
                pubkey: createProduct.accounts.vendor.address,
                program: e.select(e.Program, () => ({
                    filter_single: {
                        pubkey: this.programPda!.address
                    }
                }))
            })
        }

        await e.insert(e.Product, {
            mint_account: createProduct.accounts.productMint.address,
            mint_authority: createProduct.accounts.vendor.address,
            vendor: vendorQuery,
            metadata: e.insert(e.TokenMetadata, {
                name: createProduct.data.name,
                symbol: createProduct.data.symbol,
                uri: createProduct.data.uri,
                additional: createProduct.data.additionalMetadata as [string, string][],
            }),
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
        }).run(dbTx)
    }

    async handleCreateDevice(dbTx: Executor, createDevice: ParsedCreateDeviceInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        const product = await e.select(e.Product, () => ({
            metadata: {
                name: true,
                symbol: true,
            },
            filter_single: {
                mint_account: createDevice.accounts.productMint.address,
            }
        })).run(dbTx)

        await e.insert(e.DID, {
            mint_account: createDevice.accounts.deviceMint.address,
            mint_authority: createDevice.accounts.deviceMint.address,
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
            device: e.insert(e.Device, {
                pubkey: createDevice.accounts.device.address,
                token_account: createDevice.accounts.productAssociatedToken.address,
                product: e.select(e.Product, () => ({
                    filter_single: {
                        mint_account: createDevice.accounts.productMint.address,
                    }
                })),
                tx: e.select(e.Transaction, () => ({
                    filter_single: {
                        signature: meta.tx,
                    },
                    "@ix_index": e.int16(meta.index),
                })),
                signing_alg: e.cast(e.DeviceSigningAlgorithm, e.str(DeviceSigningAlgorithm[createDevice.data.signingAlg])),
            }),
            metadata: e.insert(e.TokenMetadata, {
                name: createDevice.data.name,
                symbol: product?.metadata?.symbol,
                uri: createDevice.data.uri,
                additional: createDevice.data.additionalMetadata as [string, string][],
            }),
        }).run(dbTx)
    }

    async handleActivateDevice(dbTx: Executor, activateDevice: ParsedActivateDeviceInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        const owner = await e.select(e.User, () => ({
            filter_single: {
                pubkey: activateDevice.accounts.owner.address,
            }
        })).run(dbTx)

        let ownerQuery;
        if (owner) {
            ownerQuery = e.select(e.User, () => ({
                filter_single: {
                    pubkey: activateDevice.accounts.owner.address,
                }
            }))
        } else {
            ownerQuery = e.insert(e.User, {
                pubkey: activateDevice.accounts.owner.address,
            })
        }

        await e.update(e.DID, () => ({
            filter_single: {
                mint_account: activateDevice.accounts.deviceMint.address,
            },
            set: {
                owner: ownerQuery,
                mint_authority: null,
                token_account: activateDevice.accounts.deviceAssociatedToken.address,
            }
        })).run(dbTx)
    }

    async handleCreateActivatedDevice(dbTx: Executor, createActivatedDevice: ParsedCreateActivatedDeviceInstruction<string, readonly IAccountMeta[]>, meta: IxMeta) {
        const product = await e.select(e.Product, () => ({
            metadata: {
                name: true,
                symbol: true,
            },
            filter_single: {
                mint_account: createActivatedDevice.accounts.productMint.address,
            }
        })).run(dbTx)

        const owner = await e.select(e.User, () => ({
            filter_single: {
                pubkey: createActivatedDevice.accounts.owner.address,
            }
        })).run(dbTx)

        let ownerQuery;
        if (owner) {
            ownerQuery = e.select(e.User, () => ({
                filter_single: {
                    pubkey: createActivatedDevice.accounts.owner.address,
                }
            }))
        } else {
            ownerQuery = e.insert(e.User, {
                pubkey: createActivatedDevice.accounts.owner.address,
            })
        }

        await e.insert(e.DID, {
            owner: ownerQuery,
            mint_account: createActivatedDevice.accounts.deviceMint.address,
            mint_authority: null,
            token_account: createActivatedDevice.accounts.deviceAssociatedToken.address,
            tx: e.select(e.Transaction, () => ({
                filter_single: {
                    signature: meta.tx,
                },
                "@ix_index": e.int16(meta.index),
            })),
            device: e.insert(e.Device, {
                pubkey: createActivatedDevice.accounts.device.address,
                token_account: createActivatedDevice.accounts.productAssociatedToken.address,
                product: e.select(e.Product, () => ({
                    filter_single: {
                        mint_account: createActivatedDevice.accounts.productMint.address,
                    }
                })),
                tx: e.select(e.Transaction, () => ({
                    filter_single: {
                        signature: meta.tx,
                    },
                    "@ix_index": e.int16(meta.index),
                })),
            }),
            metadata: e.insert(e.TokenMetadata, {
                name: createActivatedDevice.data.createActivatedDeviceArgs.name,
                symbol: product?.metadata?.symbol,
                uri: createActivatedDevice.data.createActivatedDeviceArgs.uri,
                additional: createActivatedDevice.data.createActivatedDeviceArgs.additionalMetadata as [string, string][],
            }),
        }).run(dbTx)
    }

    async processProgramIx(dbTx: Executor, ix: PartiallyDecodedTransactionInstruction, meta: IxMeta) {
        let programIx = {
            accounts: ix.accounts.map(address => ({ address, role: 0 })),
            data: Uint8Array.from(getBase58Encoder().encode(ix.data)),
            programAddress: ix.programId,
        }

        switch (identifyDephyIdInstruction(programIx)) {
            case DephyIdInstruction.Initialize:
                let initialize = parseInitializeInstruction(programIx)
                await this.handleInitialize(dbTx, initialize, meta)
                break

            case DephyIdInstruction.CreateProduct:
                let createProduct = parseCreateProductInstruction(programIx)
                await this.handleCreateProduct(dbTx, createProduct, meta)
                break

            case DephyIdInstruction.CreateDevice:
                let createDevice = parseCreateDeviceInstruction(programIx)
                await this.handleCreateDevice(dbTx, createDevice, meta)
                break

            case DephyIdInstruction.ActivateDevice:
                let activateDevice = parseActivateDeviceInstruction(programIx)
                await this.handleActivateDevice(dbTx, activateDevice, meta)
                break

            case DephyIdInstruction.CreateActivatedDevice:
                let createActivatedDevice = parseCreateActivatedDeviceInstruction(programIx)
                await this.handleCreateActivatedDevice(dbTx, createActivatedDevice, meta)
                break

            case DephyIdInstruction.CreateActivatedDeviceNonSigner:
                let createActivatedDeviceNonSigner = parseCreateActivatedDeviceNonSignerInstruction(programIx)
                await this.handleCreateActivatedDevice(dbTx, createActivatedDeviceNonSigner, meta)
                break

            default:
                break
        }
    }

    async processTx(txFilter: { id: string }, signature: string) {
        let tx = await this.getTx(signature)

        if (!tx) {
            console.error("Can't fetch", signature)
            return
        } else {
            console.log('Processing', signature, tx.blockTime)
        }

        await this.db.transaction(async dbTx => {
            let i = 0
            for (const ix of tx.transaction.message.instructions) {
                if (tx.meta && !tx.meta.err) {
                    switch (ix.programId) {
                        case this.programAddress:
                            if ('data' in ix) {
                                await this.processProgramIx(dbTx, ix, { tx: signature, index: i })
                            }
                            break

                        default:
                            break
                    }

                    for (const plugin of this.plugins) {
                        if (plugin.matchIx(ix)) {
                            await plugin.processIx(this.rpc, ix, { tx: signature, index: i })
                        }
                    }
                }
                i += 1
            }

            let blockTs;
            if (tx.blockTime) {
                blockTs = e.datetime(new Date(Number(tx.blockTime) * 1000))
            } else {
                blockTs = null
            }

            await e.update(e.Transaction, () => ({
                filter_single: txFilter,
                set: {
                    block_ts: blockTs,
                    processed: true,
                }
            })).run(dbTx)
        })

        console.log('Transaction', signature, 'processed')
    }

}
