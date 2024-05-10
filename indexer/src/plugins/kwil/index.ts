import { Address, Base58EncodedBytes, getBase58Encoder } from "@solana/web3.js";
import { KWIL_PROGRAM_ADDRESS, KwilInstruction, identifyKwilInstruction } from "./generated";

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

export async function initialize() {
}

export function matchIx(ix: PartiallyDecodedTransactionInstruction | ParsedTransactionInstruction) {
    return ix.programId == KWIL_PROGRAM_ADDRESS
}

export async function processIx(ix: PartiallyDecodedTransactionInstruction, meta: IxMeta) {
    let kwil_ix = {
        accounts: ix.accounts.map(address => ({address, role: 0})),
        data: Uint8Array.from(getBase58Encoder().encode(ix.data)),
        programAddress: ix.programId,
    }

    switch (identifyKwilInstruction(kwil_ix)) {
        case KwilInstruction.CreateKwil:
            break;

        case KwilInstruction.CreateAcl:
            // createACL(signer: KwilSigner, subject: string, target: string, readLevel: number, writeLevel: number)
            break;

        default:
            break;
    }
}

