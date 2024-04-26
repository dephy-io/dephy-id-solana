import assert from "assert/strict"
import { RpcGraphQL, createRpcGraphQL } from "@solana/rpc-graphql"
import {
    Account,
    Address,
    Base58EncodedBytes,
    Commitment,
    IAccountMeta,
    Rpc, RpcSubscriptions, SolanaRpcApiMainnet, SolanaRpcSubscriptionsApi,
    address,
    assertAccountDecoded,
    createSolanaRpc, createSolanaRpcSubscriptions,
    getBase58Encoder,
    signature,
} from "@solana/web3.js"
import { Client, createClient } from "edgedb"
import e from "../dbschema/edgeql-js"
import { DephyAccount, fetchDephyAccount, findDephyAccountPda } from "../../clients/js/src"
import {
    DephyIdInstruction,
    ParsedActivateDeviceInstruction, ParsedCreateDephyInstruction, ParsedCreateDeviceInstruction,
    ParsedCreateProductInstruction, ParsedCreateVendorInstruction,
    identifyDephyIdInstruction,
    parseActivateDeviceInstruction, parseCreateDephyInstruction, parseCreateDeviceInstruction,
    parseCreateProductInstruction, parseCreateVendorInstruction
} from "@dephy-io/dephy-id"


type Ix = {
    accounts: readonly Address[]
    data: Base58EncodedBytes
    programId: Address
}



export class Indexer {
    rpc: Rpc<SolanaRpcApiMainnet>
    subscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>
    rpcGraphQL: RpcGraphQL
    abortController: AbortController
    database_url: string
    db: Client
    dephy: Account<DephyAccount, string>

    constructor({
        rpc_url,
        pubsub_url,
        database_url,
    }) {
        this.rpc = createSolanaRpc(rpc_url)
        this.subscriptions = createSolanaRpcSubscriptions(pubsub_url)
        this.rpcGraphQL = createRpcGraphQL(this.rpc)
        this.database_url = database_url
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

        const notifications = await this.subscribe_logs(program_address, commitment)
        console.log('logs subscribed')

        for await (const notification of notifications) {
            console.log(notification)

            const { context: { slot }, value: { signature, err, logs } } = notification
            let tx = await this.save_tx({ slot, signature, logs, err }).run(this.db)
            this.processTx(tx, signature)
        }
    }

    subscribe_logs(program_address: Address, commitment: Commitment) {
        return this.subscriptions
            .logsNotifications({
                mentions: [program_address]
            }, { commitment })
            .subscribe({
                abortSignal: this.abortController.signal
            })
    }

    get_tx(tx_signature: string, commitment: Commitment = 'confirmed') {
        return this.rpc.getTransaction(signature(tx_signature), { commitment, encoding: 'jsonParsed' })
            .send()
    }

    save_tx({ slot, signature, logs, err }: { slot: bigint, signature: string, logs: readonly string[] | null, err: any }) {
        err ??= JSON.stringify(err)
        return e.insert(e.Transaction, {
            slot,
            signature,
            logs,
            err
        }).unlessConflict(tx => ({
            on: tx.signature,
            else: e.update(tx, () => ({
                set: {
                    slot,
                    logs,
                    err
                }
            }))
        }))
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
                additional: create_vendor.data.additionalMetadata,
            })
        }).run(this.db)
    }

    async handleCreateProduct(create_product: ParsedCreateProductInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.Product, {
            vendor: e.select(e.Vendor, () => ({
                filter_single: { pubkey: create_product.accounts.vendor.address }
            })),
            mint_account: create_product.accounts.productMint.address,
        }).run(this.db)
    }

    async handleCreateDevice(create_device: ParsedCreateDeviceInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.Device, {
            pubkey: create_device.accounts.device.address,
            token_account: create_device.accounts.productAtoken.address,
        }).run(this.db)
    }

    async handleActivateDevice(activate_device: ParsedActivateDeviceInstruction<string, readonly IAccountMeta[]>) {
        await e.insert(e.User, {
            pubkey: activate_device.accounts.user.address,
        }).run(this.db)
    }

    async handleCreateDephy(create_dephy: ParsedCreateDephyInstruction<string, readonly IAccountMeta[]>) {
        // TODO
    }

    async processDephyIx(ix: Ix) {
        const data = Uint8Array.from(getBase58Encoder().encode(ix.data))
        switch (identifyDephyIdInstruction({ data })) {
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
        let tx = await this.get_tx(signature)

        tx?.transaction.message.instructions.forEach(async ix => {
            if (tx.meta && !tx.meta.err && 'data' in ix) {
                switch (ix.programId) {
                    case this.dephy.programAddress:
                        await this.processDephyIx(ix)
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

