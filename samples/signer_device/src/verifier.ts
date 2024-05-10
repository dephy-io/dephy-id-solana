import * as process from "node:process";
import * as fs from "node:fs"
import { parseArgs } from "node:util";
import { hexToU8a } from "@polkadot/util";
import { Device, KeySelection } from "./types";

const supportedKeys = ["did", "secp256k1", "ed25519"];

try {
    const { values: cliArgs } = parseArgs({
        options: {
            wallet: {
                type: 'string',
                short: 'w',
                default: "./tmp/default.json"
            },
            key: {
                type: 'string',
                short: 'k',
                default: "did"
            },
            message: {
                type: 'string',
                short: 'm',
            },
            signature: {
                type: 'string',
                short: 's',
            },
        }
    });

    if (!cliArgs.wallet || !fs.existsSync(cliArgs.wallet)) {
        console.info(`Wallet "${cliArgs.wallet}" not found, run "bun generate" to generate one.`);
        process.exit(1);
    }
    if (!cliArgs.key || !supportedKeys.includes(cliArgs.key)) {
        console.error(`Unsupported crypto type: ${cliArgs.key}, available: ${supportedKeys.join(", ")}`);
        process.exit(1);
    }
    if (!cliArgs.message || cliArgs.message.trim() === "") {
        console.error(`-m <message> is required and must not blank`);
        process.exit(1);
    }
    if (!cliArgs.signature || !cliArgs.signature.startsWith("0x")) {
        console.error(`-s <signature> is required and must be a valid hex string.`);
        process.exit(1);
    }

    const message = (function (rawMessage: string): Uint8Array {
        if (rawMessage.startsWith("0x")) {
            return hexToU8a(rawMessage);
        } else {
            return new TextEncoder().encode(rawMessage);
        }
    })(cliArgs.message);
    const signature = hexToU8a(cliArgs.signature);

    const walletJSON = JSON.parse(fs.readFileSync(cliArgs.wallet, "utf8"));
    const key = <KeySelection>cliArgs.key;
    const device = new Device(walletJSON);

    const verified = device.verify(signature, message, key);

    const output = {
        keyType: device.keys[key].keyType,
        publicKey: device.keys[key].publicKey,
        message: cliArgs.message,
        signature: cliArgs.signature,
        verified,
    };
    console.log(JSON.stringify(output));

    process.exit(0)
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
    console.error(e)
    process.exit(1)
}
