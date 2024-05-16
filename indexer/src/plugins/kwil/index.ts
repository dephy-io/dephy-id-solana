import { Address, Base58EncodedBytes, Rpc, SolanaRpcApiMainnet, getBase16Decoder, getBase58Encoder } from "@solana/web3.js";
import { KWIL_PROGRAM_ADDRESS,
    parsePublishInstruction, parseLinkInstruction, parseSubscribeInstruction,
    fetchLinkedAccount,
    identifyKwilInstruction,
    KwilInstruction
} from "./generated";
import { keccak_256 } from "@noble/hashes/sha3";
import { WebKwil, KwilSigner, Utils as KwilUtils } from '@kwilteam/kwil-js';
import { Wallet } from "ethers";

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

interface IxMeta {
    tx: string
    index: number
}

const dbOwnerAddress = "0x5BaD959d0AA3DFA44131F61E39192E475c3fBF29"
const dbName = "playground"
const dbid = KwilUtils.generateDBID(dbOwnerAddress, dbName);
let dbOwnerKwilSigner: KwilSigner;
let kwil: WebKwil;

function to_checksum_address(address_bytes: Uint8Array) {
    const decoder = getBase16Decoder()
    const address = decoder.decode(address_bytes)
    const hash = decoder.decode(keccak_256(address))
    let result = '0x'
    for (var i = 0; i < address.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            result += address[i].toUpperCase()
        } else {
            result += address[i]
        }
    }
    return result
}

async function createACL(subject: Uint8Array, target: string, read_level: number, write_level: number) {
    return await kwil.execute({
        dbid,
        action: "create_acl",
        inputs: [
            {
                $subject: to_checksum_address(subject),
                $target: target,
                $read_level: read_level,
                $write_level: write_level,
            }
        ]
    }, dbOwnerKwilSigner)
}

export async function initialize() {
    const dbOwnerEthPrivateKey = "c71d41fa79464fa467aee3f56436b366baa2e738d07808b6cbf1219f43152a61";
    const dbOwnerEthSigner = new Wallet(dbOwnerEthPrivateKey);
    const dbOwnerEthAddress = await dbOwnerEthSigner.getAddress();
    dbOwnerKwilSigner = new KwilSigner(dbOwnerEthSigner, dbOwnerEthAddress);

    kwil = new WebKwil({
        kwilProvider: "http://127.0.0.1:8080",
        chainId: "kwil-chain-tmp",
        unconfirmedNonce: true,
        timeout: 10000,
    });

    let ping = await kwil.ping()
    console.log('kwil connect', ping)
}

export function matchIx(ix: PartiallyDecodedTransactionInstruction | ParsedTransactionInstruction) {
    return ix.programId == KWIL_PROGRAM_ADDRESS
}

export async function processIx(rpc: Rpc<SolanaRpcApiMainnet>, ix: PartiallyDecodedTransactionInstruction, meta: IxMeta) {
    const kwil_ix = {
        accounts: ix.accounts.map(address => ({ address, role: 0 })),
        data: Uint8Array.from(getBase58Encoder().encode(ix.data)),
        programAddress: ix.programId,
    }

    switch (identifyKwilInstruction(kwil_ix)) {
        case KwilInstruction.Link:
            const link_ix = parseLinkInstruction(kwil_ix)
            const eth_address = to_checksum_address(Uint8Array.from(link_ix.data.ethAddress))
            console.log('Link', link_ix.accounts.linked.address, eth_address)
            break;

        case KwilInstruction.Publish:
            const publish_ix = parsePublishInstruction(kwil_ix)
            const subject = Uint8Array.from(publish_ix.data.ethAddress)
            await createACL(subject, 'reports', 0, 1)
            console.log('Publish', to_checksum_address(subject))
            break;

        case KwilInstruction.Subscribe:
            const subscribe_ix = parseSubscribeInstruction(kwil_ix)
            const linked_account = await fetchLinkedAccount(rpc, subscribe_ix.accounts.linked.address)
            const linked_eth_address = Uint8Array.from(linked_account.data.data.ethAddress)
            await createACL(linked_eth_address, 'reports', 1, 0)
            console.log('Subscribe', to_checksum_address(linked_eth_address), subscribe_ix.accounts.publisher.address)
            break;

        default:
            break;
    }
}

