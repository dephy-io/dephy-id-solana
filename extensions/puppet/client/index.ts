import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(
    "create-product",
    "Create product",
    {
      rpc: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {

    }
  )
  .command(
    "create-device",
    "Create device",
    {
      rpc: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {

    },
  )
  .command(
    "create-mpl-mint",
    "Create metaplex mint",
    {
      rpc: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {

    },
  )
  .command(
    "create-mpl-nft",
    "Create metaplex nft",
    {
      rpc: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {

    },
  )
  .command(
    "bind-collection",
    "Bind product to metaplex mint",
    {
      rpc: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {

    },
  )
  .command(
    "bind",
    "Bind device to metaplex nft",
    {
      rpc: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {

    },
  )
  .help().argv;
