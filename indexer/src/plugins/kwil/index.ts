import { Address, Base58EncodedBytes, getBase16Decoder, getBase58Encoder } from "@solana/web3.js";
import { KWIL_PROGRAM_ADDRESS, KwilInstruction, identifyKwilInstruction, parseCreateKwilInstruction, parseUpdateAclInstruction } from "./generated";
import { keccak_256 } from "@noble/hashes/sha3";

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

// TODO: persist
let address_mapping: {[key in Address]: string} = {}

async function save_eth_address(account_pubkey: Address, eth_address: Uint8Array) {
    address_mapping[account_pubkey] = to_checksum_address(eth_address)
}

async function load_eth_address(account_pubkey: Address): Promise<string> {
    return address_mapping[account_pubkey]
}

async function createACL(kwil_account: Address, subject: Uint8Array, target: string, read_level: number, write_level: number) {
}

export async function initialize() {
}

export function matchIx(ix: PartiallyDecodedTransactionInstruction | ParsedTransactionInstruction) {
    return ix.programId == KWIL_PROGRAM_ADDRESS
}

export async function processIx(ix: PartiallyDecodedTransactionInstruction, meta: IxMeta) {
    const kwil_ix = {
        accounts: ix.accounts.map(address => ({address, role: 0})),
        data: Uint8Array.from(getBase58Encoder().encode(ix.data)),
        programAddress: ix.programId,
    }

    switch (identifyKwilInstruction(kwil_ix)) {
        case KwilInstruction.CreateKwil:
            const create_kwil = parseCreateKwilInstruction(kwil_ix)
            await save_eth_address(create_kwil.accounts.kwilAccount.address, Uint8Array.from(create_kwil.data.kwilSigner))
            break;

        case KwilInstruction.UpdateAcl:
            const update_acl = parseUpdateAclInstruction(kwil_ix)
            const subject = update_acl.data.subject
            await createACL(
                update_acl.accounts.kwilAccount.address,
                Uint8Array.from(subject),
                update_acl.data.target,
                update_acl.data.readLevel,
                update_acl.data.writeLevel
            )
            break;

        default:
            break;
    }
}

