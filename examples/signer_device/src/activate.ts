import * as process from "node:process";
import * as fs from "node:fs"
import { parseArgs } from "node:util";
import { u8aToHex } from "@polkadot/util";
import { Device, Wallet } from "./types";
import { Address } from "@solana/addresses";

try {
    const { values: cliArgs } = parseArgs({
        options: {
            wallet: {
                type: 'string',
                short: 'w',
                default: "./tmp/default.json",
            },
            slot: {
                type: 'string',
                short: 's',
            },
            owner: {
                type: 'string',
                short: 'o',
            },
            programAddress: {
                type: 'string',
                short: 'i',
                default: "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1",
            },
            productMintAddress: {
                type: 'string',
                short: 'p',
            },
        }
    });

    if (!cliArgs.wallet || !fs.existsSync(cliArgs.wallet)) {
        console.info(`Wallet "${cliArgs.wallet}" not found, run "bun generate" to generate one.`);
        process.exit(1);
    }

    const walletJSON: Wallet = JSON.parse(fs.readFileSync(cliArgs.wallet, "utf8"));
    const device = new Device(walletJSON);

    if (!cliArgs.slot) {
        console.error(`-s <slot> is required`);
        process.exit(1);
    }
    const slot = parseInt(cliArgs.slot);

    if (!cliArgs.owner || cliArgs.owner.trim() === "") {
        console.error(`-o <owner> is required`);
        process.exit(1);
    }
    const owner = cliArgs.owner;

    if (!cliArgs.programAddress || cliArgs.programAddress.trim() === "") {
        console.error(`-i <programAddress> is required`);
        process.exit(1);
    }
    const programAddress = cliArgs.programAddress as Address;

    if (!cliArgs.productMintAddress || cliArgs.productMintAddress.trim() === "") {
        console.error(`-p <productMintAddress> is required`);
        process.exit(1);
    }
    const productMintAddress = cliArgs.productMintAddress;

    const activationMessage = await device.activationMessage(BigInt(slot), owner, productMintAddress, programAddress);
    const signature = device.sign(activationMessage, "did");
    const output = {
        keyType: device.keys["did"].keyType,
        publicKey: device.keys["did"].publicKey,
        message: u8aToHex(activationMessage),
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
