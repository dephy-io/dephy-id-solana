import * as secp256k1 from '@noble/secp256k1';
import * as ed25519 from '@noble/ed25519';
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { u8aToU8a } from "@polkadot/util";

import { sha512 } from '@noble/hashes/sha512';
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

export type DeviceCryptoType = "ed25519" | "secp256k1";
export type DeviceExtensionsType = {
    vendor: string,
    product: string,
}
type HexLike = Uint8Array | string;

export class Device {
    type: DeviceCryptoType;
    privateKey: Uint8Array;
    publicKey: Uint8Array;
    extensions: DeviceExtensionsType;

    constructor(type: DeviceCryptoType, hexedPrivateKey: string, extensions: DeviceExtensionsType) {
        this.type = type;
        this.privateKey = u8aToU8a(hexedPrivateKey);
        this.publicKey = (function (type: DeviceCryptoType, privateKey: Uint8Array): Uint8Array {
            switch (type) {
                case "ed25519":
                    return ed25519.getPublicKey(privateKey);
                case "secp256k1":
                    return secp256k1.getPublicKey(privateKey);
            }
        })(this.type, this.privateKey);
        this.extensions = extensions;
    }

    sign(message: HexLike): Uint8Array {
        switch (this.type) {
            case "ed25519":
                return ed25519.sign(message, this.privateKey);
            case "secp256k1":
                const hashedMessage = keccak256(u8aToU8a(message));
                return secp256k1.sign(hashedMessage, this.privateKey, { extraEntropy: true }).toCompactRawBytes();
        }
    }

    verify(signature: HexLike, message: HexLike): boolean {
        switch (this.type) {
            case "ed25519":
                return ed25519.verify(signature, message, this.publicKey);
            case "secp256k1":
                const hashedMessage = keccak256(u8aToU8a(message));
                return secp256k1.verify(signature, hashedMessage, this.publicKey);
        }
    }
}
