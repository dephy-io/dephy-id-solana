import * as secp256k1 from '@noble/secp256k1';
import * as ed25519 from '@noble/ed25519';
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { u8aToU8a} from "@polkadot/util";
import { Address, getProgramDerivedAddress } from "@solana/addresses";
import { Buffer } from "node:buffer";

import { sha512 } from '@noble/hashes/sha512';
import {base58} from "@scure/base";
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

type HexLike = Uint8Array | `0x${string}`;

export type KeySelection = "did" | "ed25519" | "secp256k1";
export type KeyType = "ed25519" | "secp256k1";
export type KeyField = {
    keyType: KeyType,
    privateKey: HexLike,
    publicKey: string,
    bs58PublicKey?: string,
}
export type DeviceExtensions = {
    vendor: string,
    product: string,
}
export type Wallet = {
    keys: {
        did: KeyField,
        secp256k1: KeyField,
        ed25519: KeyField,
    },
    extensions: {
        vendor: string,
        product: string,
    }
};

export class Device {
    keys: {
        did: KeyField,
        secp256k1: KeyField,
        ed25519: KeyField,
    };
    extensions: DeviceExtensions;

    constructor(wallet: Wallet) {
        this.keys = wallet.keys
        this.extensions = wallet.extensions;
    }

    async activationMessage(slot: bigint, ownerAddress: string, productMintAddress: string, programAddress: string): Promise<Uint8Array> {
        const messageHeader = new TextEncoder().encode("DEPHY_ID_SIGNED_MESSAGE:");
        const deviceMintAddress = await (async function (
            devicePublicKey: HexLike,
            productMintAddress: string,
            programAddress: string
        ) {
            const [deviceMintAddress, _bump] = await getProgramDerivedAddress({
                programAddress: programAddress as Address,
                seeds: [
                    new TextEncoder().encode("DePHY_ID-DEVICE"),
                    base58.decode(productMintAddress),
                    devicePublicKey,
                ],
            });

            return deviceMintAddress;
        })(u8aToU8a(this.keys.did.publicKey), productMintAddress, programAddress);
        const slotBytes = (function (x: bigint): Uint8Array {
            const bytes = Buffer.alloc(8);
            bytes.writeBigInt64LE(x);
            return new Uint8Array(bytes.buffer);
        })(slot);

        console.log(this.keys.did.publicKey);

        return new Uint8Array([
            ...messageHeader,
            ...base58.decode(deviceMintAddress),
            ...base58.decode(ownerAddress),
            ...slotBytes,
        ]);
    }

    sign(message: HexLike, key: KeySelection): Uint8Array {
        const keyPair = this.keys[key];
        switch (keyPair.keyType) {
            case "ed25519":
                return ed25519.sign(u8aToU8a(message), u8aToU8a(keyPair.privateKey));
            case "secp256k1":
                const hashedMessage = keccak256(u8aToU8a(message));
                return secp256k1.sign(
                    hashedMessage, u8aToU8a(keyPair.privateKey),
                    { extraEntropy: true }
                ).toCompactRawBytes();
        }
    }

    verify(signature: HexLike, message: HexLike, key: KeySelection): boolean {
        const keyPair = this.keys[key];
        switch (keyPair.keyType) {
            case "ed25519":
                return ed25519.verify(u8aToU8a(signature), u8aToU8a(message), u8aToU8a(keyPair.publicKey));
            case "secp256k1":
                const hashedMessage = keccak256(u8aToU8a(message));
                return secp256k1.verify(u8aToU8a(signature), hashedMessage, u8aToU8a(keyPair.publicKey));
        }
    }
}
