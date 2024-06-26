#!/usr/bin/env zx
import "zx/globals";
import fs from "node:fs";
import * as k from "kinobi";
import {rootNodeFromAnchor} from "@kinobi-so/nodes-from-anchor";
import {renderVisitor as renderJavaScriptVisitor} from "@kinobi-so/renderers-js";
import {renderVisitor as renderRustVisitor} from "@kinobi-so/renderers-rust";
import {getAllProgramIdls} from "./utils.mjs";

// Instanciate Kinobi.
const [idl, ...additionalIdls] = getAllProgramIdls().filter(fs.existsSync).map(idl => rootNodeFromAnchor(require(idl)))
const kinobi = k.createFromRoot(idl, additionalIdls);

// Update programs.
kinobi.update(
    k.updateProgramsVisitor({
        "dephyIdProductProgram": { name: "productProgram"} ,
    })
);

// Update accounts.
kinobi.update(
    k.updateAccountsVisitor({
        programAccount: {
            seeds: [
                k.constantPdaSeedNodeFromString("utf8", "Program"),
                k.variablePdaSeedNode(
                    "authority",
                    k.publicKeyTypeNode(),
                    "The authority of the program account"
                ),
                k.variablePdaSeedNode(
                    "productMint",
                    k.publicKeyTypeNode(),
                    "The mapped DePHY ID product account of the program"
                ),
            ],
        },
    })
);

// Update instructions.
kinobi.update(
    k.updateInstructionsVisitor({
        init: {
            accounts: {
                token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
                // Umi renderer seems not support this yet
                // productMint: {
                //     defaultValue: k.pdaValueNode('productMint', [
                //         k.pdaSeedValueNode('vendor_pubkey', k.accountValueNode('vendor')),
                //         k.pdaSeedValueNode('product_name', k.argumentValueNode('name')),
                //     ]),
                // },
            },
        },
        createVirtualDevice: {
            accounts: {
                token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
            },
        },
    })
);

// Set account discriminators.
const key = (name) => ({field: "key", value: k.enumValueNode("Key", name)});
kinobi.update(
    k.setAccountDiscriminatorFromFieldVisitor({
        programAccount: key("ProgramAccount"),
    })
);

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
kinobi.accept(
    renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
        prettier: require(path.join(jsClient, ".prettierrc.json"))
    })
);

// Render Rust.
const rustClient = path.join(__dirname, "..", "clients", "rust");
kinobi.accept(
    renderRustVisitor(path.join(rustClient, "src", "generated"), {
        formatCode: true,
        crateFolder: rustClient,
    })
);
