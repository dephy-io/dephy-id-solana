import assert from "assert/strict"
import { RpcGraphQL, createRpcGraphQL } from "@solana/rpc-graphql"
import {
    Account,
    Address,
    Commitment,
    IAccountMeta,
    IInstruction,
    IInstructionWithAccounts,
    IInstructionWithData,
    Rpc, RpcSubscriptions, Signature, SolanaRpcApiMainnet, SolanaRpcSubscriptionsApi,
    address,
    assertAccountDecoded,
    createSolanaRpc, createSolanaRpcSubscriptions,
    getBase58Encoder,
    signature,
} from "@solana/web3.js"
import { Client, createClient } from "edgedb"
import e from "../dbschema/edgeql-js"
import {
    DephyAccount,
    DephyIdInstruction,
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
}


export class Indexer {
    rpc: Rpc<SolanaRpcApiMainnet>
    subscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>
    rpcGraphQL: RpcGraphQL
    abortController: AbortController
    database_url: string
    db!: Client
    dephy!: Account<DephyAccount, string>

    constructor({
        rpc_url,
        pubsub_url,
        database_url,
    }: Config) {
        this.rpc = createSolanaRpc(rpc_url!)
        this.subscriptions = createSolanaRpcSubscriptions(pubsub_url!)
        this.rpcGraphQL = createRpcGraphQL(this.rpc)
        this.database_url = database_url!
        this.abortController = new AbortController()
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
    }

    // TODO: fetch missing txs before subscribe

    public async run(program_id: string, commitment: Commitment = 'finalized') {
        let program_address = address(program_id)
        await this.ensureDephyAccount(program_address)

        await this.fillMissingTransactions(program_address, commitment)

        const notifications = await this.subscribeLogs(program_address, commitment)
        console.log('logs subscribed')

        for await (const notification of notifications) {
            const { context: { slot }, value: { signature, err } } = notification
            let saved_tx = await this.saveTx({ slot, signature, err })
            this.processTx(saved_tx, signature)
        }
    }

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
                    let saved_tx = await this.saveTx(tx)
                    await this.processTx(saved_tx, tx.signature)
                }
                tx_signature = tx.signature
            }
        }

        console.log('all missing txs filled')
    }

    getTransaction(tx_signature: Signature, commitment: Commitment) {
        return this.rpc.getTransaction(tx_signature, {
            commitment,
        }).send()
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
        return this.rpc.getTransaction(signature(tx_signature), { commitment, encoding: 'jsonParsed' })
            .send()
    }

    saveTx({ slot, signature, err }: { slot: bigint, signature: string, err: any }) {
        console.log('Saving tx', signature, slot, err)

        err ??= JSON.stringify(err)
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

    async handleCreateVendor(create_vendor: ParsedCreateVendorInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.Vendor, {
            pubkey: create_vendor.accounts.vendor.address,
            mint_account: create_vendor.accounts.vendorMint.address,
            token_account: create_vendor.accounts.vendorAtoken.address,
            metadata: e.insert(e.TokenMetadata, {
                name: create_vendor.data.name,
                symbol: create_vendor.data.symbol,
                uri: create_vendor.data.uri,
                additional: create_vendor.data.additionalMetadata as [string, string][],
            })
        }).run(this.db)
    }

    async handleCreateProduct(create_product: ParsedCreateProductInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.Product, {
            mint_account: create_product.accounts.productMint.address,
            vendor: e.select(e.Vendor, () => ({
                filter_single: { pubkey: create_product.accounts.vendor.address }
            })),
            metadata: e.insert(e.TokenMetadata, {
                name: create_product.data.name,
                symbol: create_product.data.symbol,
                uri: create_product.data.uri,
                additional: create_product.data.additionalMetadata as [string, string][],
            })
        }).run(this.db)
    }

    async handleCreateDevice(create_device: ParsedCreateDeviceInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.Device, {
            pubkey: create_device.accounts.device.address,
            token_account: create_device.accounts.productAtoken.address,
            product: e.select(e.Product, () => ({
                filter_single: {
                    mint_account: create_device.accounts.productMint.address,
                }
            }))
        }).run(this.db)
    }

    async handleActivateDevice(activate_device: ParsedActivateDeviceInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.DID, {
            mint_account: activate_device.accounts.didMint.address,
            token_account: activate_device.accounts.didAtoken.address,
            device: e.select(e.Device, () => ({
                filter_single: {
                    pubkey: activate_device.accounts.device.address,
                }
            })),
            user: e.insert(e.User, {
                pubkey: activate_device.accounts.user.address,
            }),
        }).run(this.db)

        // TODO: fetch DID metadata
    }

    async handleCreateDephy(create_dephy: ParsedCreateDephyInstruction<string, readonly IAccountMeta[]>) {
        // TODO: ?
    }

    async processDephyIx(ix: IInstruction & IInstructionWithAccounts<IAccountMeta[]> & IInstructionWithData<Uint8Array>) {
        switch (identifyDephyIdInstruction({ data: ix.data! })) {
            case DephyIdInstruction.CreateDephy:
                let create_dephy = parseCreateDephyInstruction(ix)
                await this.handleCreateDephy(create_dephy)
                break

            case DephyIdInstruction.CreateVendor:
                let create_vendor = parseCreateVendorInstruction(ix)
                await this.handleCreateVendor(create_vendor)
                break

            case DephyIdInstruction.CreateProduct:
                let create_product = parseCreateProductInstruction(ix)
                await this.handleCreateProduct(create_product)
                break

            case DephyIdInstruction.CreateDevice:
                let create_device = parseCreateDeviceInstruction(ix)
                await this.handleCreateDevice(create_device)
                break

            case DephyIdInstruction.ActivateDevice:
                let activate_device = parseActivateDeviceInstruction(ix)
                await this.handleActivateDevice(activate_device)
                break

            default:
                break
        }
    }

    async processTx(tx_filter: { id: string }, signature: string) {
        let tx = await this.getTx(signature)

        tx?.transaction.message.instructions.forEach(async ix => {
            if (tx.meta && !tx.meta.err && 'data' in ix) {
                switch (ix.programId) {
                    case this.dephy.programAddress:
                        await this.processDephyIx({
                            accounts: ix.accounts.map(address => ({address, role: 0})),
                            data: Uint8Array.from(getBase58Encoder().encode(ix.data)),
                            programAddress: ix.programId,
                        })
                        break

                    default:
                        break
                }
            }
        })

        // TODO: handle inner ix

        await e.update(e.Transaction, (t) => ({
            filter_single: tx_filter,
            set: {
                processed: true
            }
        })).run(this.db)
    }

}

