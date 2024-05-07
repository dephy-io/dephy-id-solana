import * as process from "node:process";
import * as fs from "node:fs"
import { parseArgs } from "node:util";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { Device } from "./device";

try {
    const { values: cliArgs } = parseArgs({
        options: {
            wallet: {
                type: 'string',
                short: 'w',
                default: "./tmp/default.json"
            },
            message: {
                type: 'string',
                short: 'm',
            }
        }
    });

    if (!cliArgs.wallet || !fs.existsSync(cliArgs.wallet)) {
        console.info(`Wallet "${cliArgs.wallet}" not found, run "bun generate" to generate one.`);
        process.exit(1);
    }

    const walletJSON = JSON.parse(fs.readFileSync(cliArgs.wallet, "utf8"));
    console.info(`Public key: ${walletJSON.publicKey}`);

    const device = new Device(walletJSON.type, walletJSON.privateKey, walletJSON.extensions);
    if (u8aToHex(device.publicKey) != walletJSON.publicKey) {
        console.error(`Public key assertion failed, wallet may corrupt.`);
        process.exit(1)
    }

    if (!cliArgs.message || cliArgs.message.trim() === "") {
        console.error(`-m <message> is required`);
        process.exit(1);
    }

    const message = (function (rawMessage: string): Uint8Array {
        if (cliArgs.message.startsWith("0x")) {
            return hexToU8a(cliArgs.message);
        } else {
            return new TextEncoder().encode(cliArgs.message);
        }
    })(cliArgs.message);

    const signature = device.sign(message);
    const output = {
        type: walletJSON.type,
        publicKey: walletJSON.publicKey,
        message: u8aToHex(message),
        signature: u8aToHex(signature),
    };
    console.log(JSON.stringify(output));

    process.exit(0)
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
    console.error(e)
    process.exit(1)
}
