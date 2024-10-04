#!/usr/bin/env zx
import "zx/globals";
import fs from 'node:fs';
import * as k from "kinobi";
import {rootNodeFromAnchor} from "@kinobi-so/nodes-from-anchor";
import {renderVisitor as renderJavaScriptVisitor} from "@kinobi-so/renderers-js";
import {renderVisitor as renderRustVisitor} from "@kinobi-so/renderers-rust";
import {getAllProgramIdls, workingDirectory} from "./utils.mjs";
import {renderVisitor as renderUmiVisitor} from "@kinobi-so/renderers-js-umi";

// Instanciate Kinobi.
const idls = getAllProgramIdls().filter(fs.existsSync).map(idl => rootNodeFromAnchor(require(idl)))
const kinobi = k.createFromRoot(idls.find(idl => idl.program.name == 'dephyIdProgram'))

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
        k.constantPdaSeedNodeFromString('utf8', "DePHY_ID"),
      ],
    },
  })
);

kinobi.update(
  k.addPdasVisitor({
    dephyId: [{
      name: 'programData',
      seeds: [
        k.constantPdaSeedNodeFromString('utf8', "DePHY_ID"),
      ]
    }, {
      name: 'productMint',
      seeds: [
        k.constantPdaSeedNodeFromString('utf8', "DePHY_ID-PRODUCT"),
        k.variablePdaSeedNode('vendor_pubkey', k.publicKeyTypeNode()),
        k.variablePdaSeedNode('product_name', k.stringTypeNode('utf8')),
      ]
    }, {
      name: 'deviceMint',
      seeds: [
        k.constantPdaSeedNodeFromString('utf8', "DePHY_ID-DEVICE"),
        k.variablePdaSeedNode('product_mint_pubkey', k.publicKeyTypeNode()),
        k.variablePdaSeedNode('device_pubkey', k.publicKeyTypeNode()),
      ]
    }, {
      name: 'productAToken',
      // programAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      seeds: [
        k.variablePdaSeedNode('device_pubkey', k.publicKeyTypeNode()),
        k.constantPdaSeedNode(k.publicKeyTypeNode(), k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')),
        k.variablePdaSeedNode('product_mint_pubkey', k.publicKeyTypeNode()),
      ]
    }, {
      name: 'deviceAToken',
      // programAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      seeds: [
        k.variablePdaSeedNode('owner_pubkey', k.publicKeyTypeNode()),
        k.constantPdaSeedNode(k.publicKeyTypeNode(), k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')),
        k.variablePdaSeedNode('device_mint_pubkey', k.publicKeyTypeNode()),
      ]
    }]
  })
);


// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    initialize: {
      accounts: {
        payer: { defaultValue: k.accountValueNode("authority") },
      },
    },
    createProduct: {
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
    createDevice: {
      accounts: {
        token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
        payer: { defaultValue: k.accountValueNode("vendor") },
      },
    },
    activateDevice: {
      accounts: {
        token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
      },
    },
    createActivatedDevice: {
      accounts: {
        token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
        payer: { defaultValue: k.accountValueNode("vendor") },
      },
    },
    createActivatedDeviceNonSigner: {
      accounts: {
        token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
        payer: { defaultValue: k.accountValueNode("vendor") },
      },
    }
  })
);

// Set account discriminators.
const key = (name) => ({field: "key", value: k.enumValueNode("Key", name)});
kinobi.update(
  k.setAccountDiscriminatorFromFieldVisitor({
    programDataAccount: key("ProgramDataAccount"),
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

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
await kinobi.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json"))
  })
);

const ui = path.join(__dirname, "..", "ui");
await kinobi.accept(
  renderUmiVisitor(path.join(ui, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json"))
  })
);

// Prebuild dist
cd(path.join(workingDirectory, 'clients', 'js'));
await $`pnpm build`;
