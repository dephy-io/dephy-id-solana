import * as process from "node:process";
import * as fs from "node:fs"
import { parseArgs } from "node:util";

try {
    const { values: cliArgs } = parseArgs({
        options: {
            wallet: {
                type: 'string',
                short: 'w',
                default: "./tmp/default.json"
            },
        }
    });

    if (!cliArgs.wallet || !fs.existsSync(cliArgs.wallet)) {
        console.info(`Wallet "${cliArgs.wallet}" not found, run "bun generate" to generate one.`);
        process.exit(1);
    }

    const walletJSON = JSON.parse(fs.readFileSync(cliArgs.wallet, "utf8"));
    const output = {
        address: walletJSON.keys.did.bs58PublicKey,
        keys: {
            did: {
                keyType: walletJSON.keys.did.keyType,
                publicKey: walletJSON.keys.did.publicKey,
                mappedAddress: walletJSON.keys.did.mappedAddress,
            },
            secp256k1: {
                keyType: walletJSON.keys.secp256k1.keyType,
                publicKey: walletJSON.keys.secp256k1.publicKey,
            },
            ed25519: {
                keyType: walletJSON.keys.ed25519.keyType,
                publicKey: walletJSON.keys.ed25519.publicKey,
            },
        },
        extensions: walletJSON.extensions,
    };
    console.log(JSON.stringify(output));

    process.exit(0)
} catch (e) {
    // [FAILED] Reaching this line means the subscription went down.
    // Retry it, then recover from potential missed messages.
    console.error(e)
    process.exit(1)
}
