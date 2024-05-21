#!/usr/bin/env zx
import "zx/globals";
import * as k from "kinobi";
import {rootNodeFromAnchor} from "@kinobi-so/nodes-from-anchor";
import {renderVisitor as renderJavaScriptVisitor} from "@kinobi-so/renderers-js";
import {renderVisitor as renderRustVisitor} from "@kinobi-so/renderers-rust";
import {getAllProgramIdls} from "./utils.mjs";

// Instanciate Kinobi.
const [idl, ...additionalIdls] = getAllProgramIdls().map(idl => rootNodeFromAnchor(require(idl)))
const kinobi = k.createFromRoot(idl, additionalIdls);

// Update programs.
kinobi.update(
    k.updateProgramsVisitor({
        "dephyIdProgram": {name: "dephyId"},
    })
);

// Update accounts.
kinobi.update(
    k.updateAccountsVisitor({
        programDataAccount: {
            seeds: [
                k.constantPdaSeedNodeFromString('utf8', "DePHY ID"),
            ],
        },
    })
);

// // Update instructions.
// kinobi.update(
//   k.updateInstructionsVisitor({
//     create: {
//       byteDeltas: [k.instructionByteDeltaNode(k.accountLinkNode("dephy"))],
//       accounts: {
//         dephy: { defaultValue: k.pdaValueNode("dephy") },
//         payer: { defaultValue: k.accountValueNode("authority") },
//       },
//     },
//     increment: {
//       accounts: {
//         dephy: { defaultValue: k.pdaValueNode("dephy") },
//       },
//       arguments: {
//         amount: { defaultValue: k.noneValueNode() },
//       },
//     },
//   })
// );

// Set account discriminators.
const key = (name) => ({field: "key", value: k.enumValueNode("Key", name)});
kinobi.update(
    k.setAccountDiscriminatorFromFieldVisitor({
        programDataAccount: key("ProgramDataAccount"),
    })
);

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
await kinobi.accept(
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
