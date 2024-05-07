import * as process from "node:process";
import * as fs from "node:fs"
import { parseArgs } from "node:util";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import * as ed25519 from "@noble/ed25519";
import * as secp256k1 from "@noble/secp256k1";

import { sha512 } from '@noble/hashes/sha512';
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

const supportedCryptoTypes = ["secp256k1", "ed25519"];

try {
    const { values: cliArgs } = parseArgs({
        options: {
            type: {
                type: 'string',
                short: 't',
                default: 'ed25519',
            },
            privateKey: {
                type: 'string',
                short: 's',
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
    if (!cliArgs.type || !supportedCryptoTypes.includes(cliArgs.type)) {
        console.error(`Unsupported crypto type: ${cliArgs.type}, available: ${supportedCryptoTypes.join(", ")}`);
        process.exit(1);
    }

    let privateKey: Uint8Array;
    if (cliArgs.privateKey) {
        privateKey = hexToU8a(cliArgs.privateKey);
    } else {
        switch (cliArgs.type) {
            case "ed25519":
                privateKey = ed25519.utils.randomPrivateKey();
                break;
            case "secp256k1":
                privateKey = secp256k1.utils.randomPrivateKey();
                break;
            default:
                // Shouldn't go here
                process.exit(1);
        }
    }

    let publicKey: Uint8Array;
    switch (cliArgs.type) {
        case "ed25519":
            publicKey = ed25519.getPublicKey(privateKey);
            break;
        case "secp256k1":
            publicKey = secp256k1.getPublicKey(privateKey);
            break;
        default:
            // Shouldn't go here
            process.exit(1);
    }

    const wallet = {
        type: cliArgs.type,
        privateKey: u8aToHex(privateKey),
        publicKey: u8aToHex(publicKey),
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
