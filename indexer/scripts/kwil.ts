import fs from "fs";
import os from "os";
import path from 'path';
import { parseArgs } from "util";
import { KWIL_PROGRAM_ADDRESS, findKwilAccountPda, getCreateKwilInstruction, getUpdateAclInstruction } from "../src/plugins/kwil/generated";
import {
    IInstruction,
    KeyPairSigner, Rpc, RpcSubscriptions, SolanaRpcApiMainnet, SolanaRpcSubscriptionsApi,
    address, appendTransactionMessageInstructions,
    createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, getSignatureFromTransaction, pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners
} from "@solana/web3.js";
import { DEPHY_ID_PROGRAM_ADDRESS } from "../src/generated";
import { sha256 } from "@noble/hashes/sha256";
import { ethers } from "ethers";
import { createClient } from "edgedb";
import { getDID } from "../dbschema/queries/getDID.query";
import { findKwilAclAccountPda } from "../src/plugins/kwil/generated/pdas/kwilAclAccount";


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
            authority_keypair: {
                type: 'string',
                short: 'k',
                default: path.join(os.homedir(), '.config/solana/id.json'),
            },
            kwil_signer: {
                type: 'string'
            },
            did_atoken: {
                type: 'string'
            },
            target: {
                type: 'string'
            },
            subject: {
                type: 'string'
            },
            read: {
                type: 'boolean',
                default: false,
            },
            write: {
                type: 'boolean',
                default: false,
            },
        },
        allowPositionals: true,
    })

    rpc = createSolanaRpc(args.rpc_url!)
    rpcSubscriptions = createSolanaRpcSubscriptions(args.pubsub_url!)

    const td = new TextDecoder()
    const authority = await pipe(
        args.authority_keypair!,
        path.resolve,
        fs.readFileSync,
        (b: Buffer) => td.decode(b),
        JSON.parse,
        a => Uint8Array.from(a),
        createKeyPairSignerFromBytes
    )
    console.log('authority', authority.address)

    switch (action) {
        case 'create-kwil':
            await createKwil(args, authority)
            break;

        case 'update-acl':
            await updateACL(args, authority)
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

interface CreateKwilArgs {
    dephy_program_id?: string;
    kwil_program_id?: string;
    kwil_signer?: string;
}

async function createKwil(args: CreateKwilArgs, authority: KeyPairSigner) {
    const kwilSigner = ethers.getBytes(ethers.getAddress(args.kwil_signer!))

    const [kwilAccount, bump] = await findKwilAccountPda({
        authority: authority.address,
        kwilSigner,
    }, {
        programAddress: address(args.kwil_program_id!)
    })

    const instructions = [
        getCreateKwilInstruction({
            dephyProgram: address(args.dephy_program_id!),
            payer: authority,
            authority,
            kwilAccount,
            bump,
            kwilSigner: Array.from(kwilSigner),
        })
    ]

    const signature = await sendTransaction(instructions, authority)
    console.log('Create Kwil', signature)
}


interface UpdateAclArgs {
    dephy_program_id?: string;
    kwil_program_id?: string;
    kwil_signer?: string;
    database_url?: string;
    subject?: string;
    did_atoken?: string;
    target?: string;
    read?: boolean;
    write?: boolean;
}

async function updateACL(args: UpdateAclArgs, authority: KeyPairSigner) {
    let db = await createClient(args.database_url)
        .ensureConnected();

    const did = await getDID(db, {
        did_atoken: args.did_atoken!
    })
    console.log('did', did);

    const kwilSigner = ethers.getBytes(ethers.getAddress(args.kwil_signer!))
    const [kwilAccount, _bump] = await findKwilAccountPda({
        authority: authority.address,
        kwilSigner,
    }, {
        programAddress: address(args.kwil_program_id!)
    })
    console.log('kwilAccount', kwilAccount);

    const subject = ethers.getBytes(ethers.getAddress(args.subject!))
    const targetHash = sha256(args.target!);
    const [kwilAclAccount, bump] = await findKwilAclAccountPda({
        kwilAccount,
        didPubkey: address(did!.token_account),
        subject,
        targetHash,
    }, {
        programAddress: address(args.kwil_program_id!)
    })
    console.log('kwilAclAccount', kwilAclAccount);

    const instructions = [
        getUpdateAclInstruction({
            dephyProgram: address(args.dephy_program_id!),
            payer: authority,
            authority,
            kwilAccount,
            vendor: address(did!.device.product.vendor.pubkey),
            productMint: address(did!.device.product.mint_account),
            device: address(did!.device.pubkey),
            productAtoken: address(did!.device.token_account),
            user: address(did!.user.pubkey),
            didMint: address(did!.mint_account),
            didAtoken: address(did!.token_account),
            kwilAclAccount,
            bump,
            readLevel: Number(args.read!),
            writeLevel: Number(args.write!),
            subject: Array.from(subject),
            target: args.target!,
        })
    ]

    const signature = await sendTransaction(instructions, authority)
    console.log('Update ACL', signature)
}

