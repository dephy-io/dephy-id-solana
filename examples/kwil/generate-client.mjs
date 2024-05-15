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
    kwilAccount: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "KWIL"),
        k.variablePdaSeedNode(
          "authority",
          k.publicKeyTypeNode(),
          "The authority of the counter account"
        ),
        k.variablePdaSeedNode(
          'kwil_signer',
          k.bytesTypeNode(),
          'Kwil ETH address'
        ),
      ],
    },
    kwilAclAccount: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "KWIL ACL"),
        k.variablePdaSeedNode(
          "kwil_account",
          k.publicKeyTypeNode(),
          "The Kwil account"
        ),
        k.variablePdaSeedNode(
          "did_pubkey",
          k.publicKeyTypeNode(),
          "The DID atoken pubkey"
        ),
        k.variablePdaSeedNode(
          "subject",
          k.bytesTypeNode(),
          'The caller address'
        ),
        k.variablePdaSeedNode(
          "target_hash",
          k.bytesTypeNode(),
          "sha256 hash of target"
        ),
      ]
    }
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
