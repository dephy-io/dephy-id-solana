#!/usr/bin/env zx
import "zx/globals";
import * as k from "kinobi";
import { rootNodeFromAnchor } from "@kinobi-so/nodes-from-anchor";
import { renderVisitor as renderJavaScriptVisitor } from "@kinobi-so/renderers-js";
import { getAllProgramIdls } from "./utils.mjs";
import { DEPHY_ID_PROGRAM_ADDRESS } from "@dephy-io/dephy-id-program-client";

// Instanciate Kinobi.
const [idl, ...additionalIdls] = getAllProgramIdls().map(idl => rootNodeFromAnchor(require(idl)))
const kinobi = k.createFromRoot(idl, additionalIdls);


// Update programs.
kinobi.update(
  k.updateProgramsVisitor({
    dephyIdWallet: { name: "dephyIdWallet" },
  })
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    wallet: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "WALLET"),
        k.variablePdaSeedNode("device", k.publicKeyTypeNode(), "The device of the wallet account"),
        k.variablePdaSeedNode("authority", k.publicKeyTypeNode(), "The authority of the wallet account"),
      ],
    },
  })
);

kinobi.update(
  k.addPdasVisitor({
    dephyId: [{
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
    }],
    dephyIdWallet: [{
      name: 'vault',
      seeds: [
        k.constantPdaSeedNodeFromString('utf8', 'VAULT'),
        k.variablePdaSeedNode('wallet', k.publicKeyTypeNode())
      ]
    }],
  })
)

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    create: {
      // byteDeltas: [k.instructionByteDeltaNode(k.accountLinkNode("wallet"))],
      accounts: {
        // #[account(0, writable, name="wallet", desc = "The program derived address of the wallet account to create (seeds: ['WALLET', authority])")]
        wallet: { defaultValue: k.pdaValueNode("wallet") },
        // #[account(1, signer, name="authority", desc = "The authority of the wallet")]
        // #[account(2, name="vault", desc = "The wallet vault (seeds: ['VAULT', wallet])")]
        vault: { defaultValue: k.pdaValueNode('vault') },
        // #[account(3, name="vendor", desc="The vendor")]
        // #[account(4, name="product_mint", desc="The mint account for the product")]
        productMint: {
          defaultValue: k.pdaValueNode(k.pdaLinkNode('productMint', '@dephy-io/dephy-id-program-client'), [
            k.pdaSeedValueNode('vendorPubkey', k.accountValueNode('vendor')),
            k.pdaSeedValueNode('productName', k.argumentValueNode('productName')),
          ])
        },
        // #[account(5, name="product_associated_token", desc="The associated token account for the product")]
        // TODO: wait kinobi update
        // productAssociatedToken: {
        //   defaultValue: k.pdaValueNode(k.pdaNode({}), [])
        // },
        // #[account(6, name="device", desc="The device")]
        // #[account(7, name="device_mint", desc="The mint account for the device")]
        deviceMint: {
          defaultValue: k.pdaValueNode(k.pdaLinkNode('deviceMint', '@dephy-io/dephy-id-program-client'), [
            k.pdaSeedValueNode('productMintPubkey', k.accountValueNode('productMint')),
            k.pdaSeedValueNode('devicePubkey', k.accountValueNode('device')),
          ])
        },
        // #[account(8, name="did_atoken", desc = "DID atoken owned by authority")]
        // did_atoken: { defaultValue: k.pdaValueNode() },
        // #[account(9, writable, signer, name="payer", desc = "The account paying for the storage fees")]
        payer: { defaultValue: k.accountValueNode("authority") },
        // #[account(10, name="system_program", desc = "The system program")]
        // #[account(11, name="token_2022_program", desc="The SPL Token 2022 program")]
        token2022Program: { defaultValue: k.publicKeyValueNode('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') },
        // #[account(12, name="ata_program", desc="The associated token program")]
        // #[account(13, name="dephy_id_program", desc="The DePHY ID program")]
        dephyIdProgram: { defaultValue: k.publicKeyValueNode(DEPHY_ID_PROGRAM_ADDRESS) },
      },
      arguments: {
        bump: k.instructionArgumentNode({
          name: 'bump',
          defaultValue: k.accountBumpValueNode('wallet'),
        }),
        productName: k.instructionArgumentNode({
          name: 'productName',
          type: k.stringTypeNode('utf8'),
        }),
      }
    },
    proxyCall: {
      accounts: {
        vault: { defaultValue: k.pdaValueNode('vault') },
      },
      arguments: {
        ixData: { defaultValue: null },
      }
    },
  })
);

// Set account discriminators.
const key = (name) => ({ field: "key", value: k.enumValueNode("Key", name) });
kinobi.update(
  k.setAccountDiscriminatorFromFieldVisitor({
    wallet: key("wallet"),
  })
);

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
kinobi.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json"))
  })
);
