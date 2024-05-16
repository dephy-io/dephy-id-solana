import fs from "fs";
import os from "os";
import path from 'path';
import { parseArgs } from "util";
import { KWIL_PROGRAM_ADDRESS, findPublisherAccountPda, findLinkedAccountPda, findSubscriberAccountPda,
    getPublishInstruction, getLinkInstruction, getSubscribeInstruction
} from "../src/plugins/kwil/generated";
import {
    IInstruction, KeyPairSigner, Rpc, RpcSubscriptions, SolanaRpcApiMainnet, SolanaRpcSubscriptionsApi,
    address, appendTransactionMessageInstructions,
    createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage,
    getSignatureFromTransaction, pipe, sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners
} from "@solana/web3.js";
import { DEPHY_ID_PROGRAM_ADDRESS } from "../src/generated";
import { ethers } from "ethers";
import { createClient } from "edgedb";
import { getDID } from "../dbschema/queries/getDID.query";


let rpc: Rpc<SolanaRpcApiMainnet>
let rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>

try {
    const { values: args, positionals: [action] } = parseArgs({
        options: {
            rpc_url: {
                type: 'string',
                short: 'r',
                default: 'http://127.0.0.1:8899',
            },
            pubsub_url: {
                type: 'string',
                short: 's',
                default: 'ws://127.0.0.1:8900',
            },
            database_url: {
                type: 'string',
                short: 'd',
            },
            kwil_program_id: {
                type: 'string',
                short: 'p',
                default: KWIL_PROGRAM_ADDRESS,
            },
            dephy_program_id: {
                type: 'string',
                default: DEPHY_ID_PROGRAM_ADDRESS,
            },
            keypair: {
                type: 'string',
                short: 'k',
                default: path.join(os.homedir(), '.config/solana/id.json'),
            },
            did_atoken: {
                type: 'string'
            },
            eth_address: {
                type: 'string'
            },
        },
        allowPositionals: true,
    })

    rpc = createSolanaRpc(args.rpc_url!)
    rpcSubscriptions = createSolanaRpcSubscriptions(args.pubsub_url!)

    const td = new TextDecoder()
    const payer = await pipe(
        args.keypair!,
        path.resolve,
        fs.readFileSync,
        (b: Buffer) => td.decode(b),
        JSON.parse,
        a => Uint8Array.from(a),
        createKeyPairSignerFromBytes
    )
    console.log('payer', payer.address)

    switch (action) {
        case 'publish':
            await publish(args, payer)
            break;

        case 'link':
            await link(args, payer)
            break;

        case 'subscribe':
            await subscribe(args, payer)
            break;

        default:
            console.error('need action')
            break;
    }
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
    console.error(e)
} finally {
    // [ABORTED or FAILED] Whether the subscription failed or was aborted, you can run cleanup code here.
}


async function sendTransaction(instructions: IInstruction[], payer: KeyPairSigner) {
    const blockhash = await rpc.getLatestBlockhash().send()

    const tx = pipe(
        createTransactionMessage({ version: 0 }),
        tx => appendTransactionMessageInstructions(instructions, tx),
        tx => setTransactionMessageLifetimeUsingBlockhash(blockhash.value, tx),
        tx => setTransactionMessageFeePayerSigner(payer, tx),
    )

    const signed_tx = await signTransactionMessageWithSigners(tx)
    const signature = getSignatureFromTransaction(signed_tx)

    await sendAndConfirmTransactionFactory({rpc, rpcSubscriptions})(signed_tx, {
        commitment: "confirmed"
    })
    return signature
}

interface LinkArgs {
    kwil_program_id?: string,
    eth_address?: string,
}

async function link(args: LinkArgs, payer: KeyPairSigner) {
    const ethAddress = ethers.getBytes(ethers.getAddress(args.eth_address!))

    const [linked, bump] = await findLinkedAccountPda({
        user: payer.address,
        ethAddress
    }, {
        programAddress: address(args.kwil_program_id!)
    })

    const instructions = [
        getLinkInstruction({
            bump,
            payer,
            user: payer,
            linked,
            ethAddress: Array.from(ethAddress)
        })
    ]

    const signature = await sendTransaction(instructions, payer)
    console.log('Link', signature)
}


interface PublishArgs {
    dephy_program_id?: string;
    kwil_program_id?: string;
    eth_address?: string;
    database_url?: string;
    did_atoken?: string;
}

async function publish(args: PublishArgs, payer: KeyPairSigner) {
    let db = await createClient(args.database_url)
        .ensureConnected();

    const did = await getDID(db, {
        did_atoken: args.did_atoken!
    })
    console.log('DID', did);

    const eth_address = ethers.getBytes(ethers.getAddress(args.eth_address!))
    const [publisher, bump] = await findPublisherAccountPda({
        didAtoken: address(did!.token_account),
    }, {
        programAddress: address(args.kwil_program_id!)
    })

    const instructions = [
        getPublishInstruction({
            dephyProgram: address(args.dephy_program_id!),
            payer,
            owner: payer,
            vendor: address(did!.device.product.vendor.pubkey),
            productMint: address(did!.device.product.mint_account),
            device: address(did!.device.pubkey),
            productAtoken: address(did!.device.token_account),
            user: address(did!.user.pubkey),
            didMint: address(did!.mint_account),
            didAtoken: address(did!.token_account),
            bump,
            publisher,
            ethAddress: Array.from(eth_address),
        })
    ]

    const signature = await sendTransaction(instructions, payer)
    console.log('Publish', signature)
}

interface SubscribeArgs {
    kwil_program_id?: string;
    publisher?: string;
    linked?: string;
}

async function subscribe(args: SubscribeArgs, payer: KeyPairSigner) {
    const publisher = address(args.publisher!)
    const linked = address(args.linked!)
    const [subscriber, bump] = await findSubscriberAccountPda({
        publisher,
        linked,
    }, {
        programAddress: address(args.kwil_program_id!)
    })

    const instructions = [
        getSubscribeInstruction({
            payer,
            user: payer,
            publisher,
            linked,
            subscriber,
            bump,
        })
    ]
    const signature = await sendTransaction(instructions, payer)
    console.log('Subscribe', signature)
}

