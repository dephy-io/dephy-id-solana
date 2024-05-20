#!/usr/bin/env zx
import "zx/globals";
import * as k from "@metaplex-foundation/kinobi";
import path from "path";

// Instanciate Kinobi.
const cwd = path.resolve(__dirname)
const idl = path.resolve(cwd, 'idl.json')
const kinobi = k.createFromIdl(idl)

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
const indexerPlugin = path.join(__dirname, "..", "..", "indexer", "src", "plugins");
kinobi.accept(
  k.renderJavaScriptExperimentalVisitor(
    path.join(indexerPlugin, "kwil", "generated"),
    {}
  )
);

kinobi.accept(
  k.renderJavaScriptExperimentalVisitor(
    path.join(cwd, "client", "js", "generated"),
    {}
  )
);
