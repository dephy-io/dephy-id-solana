import * as process from "node:process";
import * as fs from "node:fs"
import { parseArgs } from "node:util";
import { u8aToHex } from "@polkadot/util";
import { base58 } from '@scure/base';
import * as ed25519 from "@noble/ed25519";
import * as secp256k1 from "@noble/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import type { KeyType, Wallet } from "./types";

import { sha512 } from '@noble/hashes/sha512';
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

const supportedKeyTypes = ["secp256k1", "ed25519"];

try {
    const { values: cliArgs } = parseArgs({
        options: {
            didKeyType: {
                type: 'string',
                short: 't',
                default: 'secp256k1',
            },
            vendorPublicKey: {
                type: 'string',
                short: 'v',
            },
            productPublicKey: {
                type: 'string',
                short: 'p',
            },
            output: {
                type: 'string',
                short: 'o',
                default: './tmp/default.json',
            },
            force: {
                type: 'boolean',
                short: 'f',
                default: false,
            }
        }
    });

    if (!cliArgs.vendorPublicKey || cliArgs.vendorPublicKey.trim() === "") {
        console.error(`-v <vendor_public_key> is required and must be a valid Solana address.`);
        process.exit(1);
    }
    if (!cliArgs.productPublicKey || cliArgs.productPublicKey.trim() === "") {
        console.error(`-v <product_public_key> is required and must be a valid Solana address.`);
        process.exit(1);
    }
    if (!cliArgs.didKeyType || !supportedKeyTypes.includes(cliArgs.didKeyType)) {
        console.error(`Unsupported crypto type: ${cliArgs.didKeyType}, available: ${supportedKeyTypes.join(", ")}`);
        process.exit(1);
    }

    const didPrivateKey = (function (keyType: string): Uint8Array {
        switch (keyType) {
            case "ed25519":
                return ed25519.utils.randomPrivateKey();
            case "secp256k1":
                return secp256k1.utils.randomPrivateKey();
            default:
                throw new Error(`Unsupported key type: ${keyType}`);
        }
    })(cliArgs.didKeyType);
    const didPublicKey = (function (keyType: string, privateKey: Uint8Array): Uint8Array {
        switch (keyType) {
            case "ed25519":
                return ed25519.getPublicKey(privateKey);
            case "secp256k1":
                return secp256k1.getPublicKey(privateKey, false).slice(1);
            default:
                throw new Error(`Unsupported key type: ${keyType}`);
        }
    })(cliArgs.didKeyType, didPrivateKey);
    const didAddress = (function (keyType: string, publicKey: Uint8Array): string {
        switch (keyType) {
            case "ed25519":
                return base58.encode(publicKey);
            case "secp256k1":
                return base58.encode(keccak256(didPublicKey));
            default:
                throw new Error(`Unsupported key type: ${keyType}`);
        }
    })(cliArgs.didKeyType, didPublicKey);

    const secp256k1PrivateKey = secp256k1.utils.randomPrivateKey();
    const secp256k1PublicKey = secp256k1.getPublicKey(secp256k1PrivateKey);
    const ed25519PrivateKey = ed25519.utils.randomPrivateKey();
    const ed25519PublicKey = ed25519.getPublicKey(ed25519PrivateKey)

    const wallet: Wallet = {
        keys: {
            did: {
                keyType: <KeyType>cliArgs.didKeyType,
                privateKey: u8aToHex(didPrivateKey),
                publicKey: u8aToHex(didPublicKey),
                mappedAddress: didAddress,
            },
            secp256k1: {
                keyType: "secp256k1",
                privateKey: u8aToHex(secp256k1PrivateKey),
                publicKey: u8aToHex(secp256k1PublicKey),
            },
            ed25519: {
                keyType: "ed25519",
                privateKey: u8aToHex(ed25519PrivateKey),
                publicKey: u8aToHex(ed25519PublicKey),
            },
        },
        extensions: {
            vendor: cliArgs.vendorPublicKey,
            product: cliArgs.productPublicKey,
        }
    };
    console.info(wallet);

    if (!cliArgs.output) {
        process.exit(0);
    }

    if (fs.existsSync(cliArgs.output) && !cliArgs.force) {
        console.error(`${cliArgs.output} exists, add "-f" to override.`);
        process.exit(1);
    }

    fs.writeFileSync(cliArgs.output, JSON.stringify(wallet));

    process.exit(0)
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
    console.error(e)
    process.exit(1)
}
