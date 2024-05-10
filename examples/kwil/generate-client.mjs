#!/usr/bin/env zx
import "zx/globals";
import * as k from "@metaplex-foundation/kinobi";
import path from "path";

// Instanciate Kinobi.
const idl = path.resolve('examples/kwil', 'idl.json');
const kinobi = k.createFromIdl(idl);

// Update programs.
kinobi.update(
  k.updateProgramsVisitor({
    "dephyKwilExample": { name: "kwil" },
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
