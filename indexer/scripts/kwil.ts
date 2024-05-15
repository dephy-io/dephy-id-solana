import fs from "fs";
import os from "os";
import path from 'path';
import { parseArgs } from "util";
import { KWIL_PROGRAM_ADDRESS, findKwilAccountPda, getCreateKwilInstruction } from "../src/plugins/kwil/generated";
import {
    KeyPairSigner, Rpc, SolanaRpcApiMainnet, address, appendTransactionMessageInstructions,
    createKeyPairSignerFromBytes, createSolanaRpc, createTransactionMessage, pipe,
    sendTransactionWithoutConfirmingFactory,
    setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners
} from "@solana/web3.js";
import { DEPHY_ID_PROGRAM_ADDRESS } from "../src/generated";
import { ethers } from "ethers";


let rpc: Rpc<SolanaRpcApiMainnet>

try {
    const { values: args, positionals: [action] } = parseArgs({
        options: {
            rpc_url: {
                type: 'string',
                short: 'r',
                default: 'http://127.0.0.1:8899',
            },
            dephy_program_id: {
                type: 'string',
                short: 'd',
                default: DEPHY_ID_PROGRAM_ADDRESS,
            },
            kwil_program_id: {
                type: 'string',
                short: 'p',
                default: KWIL_PROGRAM_ADDRESS,
            },
            authority_keypair: {
                type: 'string',
                short: 'k',
                default: path.join(os.homedir(), '.config/solana/id.json'),
            },
            kwil_signer: {
                type: 'string'
            }
        },
        allowPositionals: true,
    })

    rpc = createSolanaRpc(args.rpc_url!)

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


interface CreateKwilArgs {
    rpc_url?: string;
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
            dephyProgram: DEPHY_ID_PROGRAM_ADDRESS,
            payer: authority,
            authority,
            kwilAccount,
            bump,
            kwilSigner: Array.from(kwilSigner),
        })
    ]

    const blockhash = await rpc.getLatestBlockhash().send()

    const tx = pipe(
        createTransactionMessage({ version: 0 }),
        tx => appendTransactionMessageInstructions(instructions, tx),
        tx => setTransactionMessageLifetimeUsingBlockhash(blockhash.value, tx),
        tx => setTransactionMessageFeePayerSigner(authority, tx),
    )

    const signed_tx = await signTransactionMessageWithSigners(tx)

    await sendTransactionWithoutConfirmingFactory({rpc})(signed_tx, {
        commitment: "confirmed"
    })
}

