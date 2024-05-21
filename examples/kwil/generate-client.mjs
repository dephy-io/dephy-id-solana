#!/usr/bin/env zx
import "zx/globals";
import * as k from "kinobi";
import path from "path";
import { rootNodeFromAnchor } from '@kinobi-so/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from "@kinobi-so/renderers-js";

// Instantiate Kinobi.
const idl = rootNodeFromAnchor(require(path.resolve(__dirname, 'idl.json')));
console.log(idl)
const kinobi = k.createFromRoot(idl);

// Update programs.
kinobi.update(
  k.updateProgramsVisitor({
    "dephyKwilExample": { name: "kwil" },
  })
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    publisherAccount: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "PUBLISHER"),
        k.variablePdaSeedNode(
          "did_atoken",
          k.publicKeyTypeNode(),
          "The DID of publisher"
        ),
      ],
    },
    linkedAccount: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "LINKED"),
        k.variablePdaSeedNode(
          "user",
          k.publicKeyTypeNode(),
          "The user pubkey"
        ),
        k.variablePdaSeedNode(
          "eth_address",
          k.bytesTypeNode(),
          "ETH address"
        ),
      ]
    },
    subscriberAccount: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "SUBSCRIBER"),
        k.variablePdaSeedNode(
          "publisher",
          k.publicKeyTypeNode(),
          "The publisher account"
        ),
        k.variablePdaSeedNode(
          "linked",
          k.publicKeyTypeNode(),
          "The linked account"
        ),
      ]
    },
  })
);

// Render JavaScript.
const indexerPlugin = path.join(__dirname, "indexer", "src", "plugins");
await kinobi.accept(
  renderJavaScriptVisitor(
    path.join(indexerPlugin, "kwil", "generated"),
    {}
  )
);
