import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Puppet } from "../target/types/puppet";
import { Program } from "@coral-xyz/anchor";
import {
  Metaplex,
  irysStorage,
  keypairIdentity,
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const DEPHY_ID_PROGRAM = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const DEV_RPC = "https://api.apr.dev";

yargs(hideBin(process.argv))
  .command(
    "create-mpl-collection",
    "Create metaplex collection",
    {
      url: { type: "string", demandOption: true },
      name: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {
      const payer = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(args.privatekey))
      );
      console.log("pubkey:", payer.publicKey);
      const connection = new Connection(clusterApiUrl("devnet"));
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(payer))
        .use(irysStorage());

      const { nft: collectionNft } = await metaplex.nfts().create({
        uri: args.url,
        name: args.name,
        sellerFeeBasisPoints: 500, // Represents 5.00%.
        isCollection: true,
      });

      console.log("mplCollection:", collectionNft.address.toBase58());
    }
  )
  .command(
    "create-mpl-nft",
    "Create metaplex nft",
    {
      collection: { type: "string", demandOption: true },
      url: { type: "string", demandOption: true },
      name: { type: "string", demandOption: true },
      privatekey: { type: "string", demandOption: true },
    },
    async (args) => {
      const payer = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(args.privatekey))
      );
      const connection = new Connection(clusterApiUrl("devnet"));
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(payer))
        .use(irysStorage());

      // Create an NFT under the specified collection.
      const { nft } = await metaplex.nfts().create({
        uri: args.url,
        name: args.name,
        sellerFeeBasisPoints: 500, // Represents 5.00%.
        collection: new PublicKey(args.collection),
      });

      console.log("mpl_mint:", nft.address.toBase58());

      const mplAta = await getAssociatedTokenAddress(
        nft.address, // The mint address of the created NFT
        payer.publicKey, // The wallet address of the NFT owner
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log("mpl_associated_token:", mplAta.toString());
    }
  )
  .command(
    "bind-collection",
    "Bind product to metaplex mint",
    {
      productMetadataName: { type: "string", demandOption: true },
      deviceCollection: { type: "string", demandOption: true },
      mplCollection: { type: "string", demandOption: true },
    },
    async (args) => {
      const provider = anchor.AnchorProvider.local(DEV_RPC, {
        commitment: "confirmed",
        preflightCommitment: "processed",
      });

      anchor.setProvider(provider);

      const wallet = anchor.Wallet.local();
      const payer = wallet.payer;
      const vendor = wallet.publicKey;

      const program = anchor.workspace.Puppet as Program<Puppet>;

      const tx = await program.methods
        .bindCollection({
          productMetadataName: args.productMetadataName,
          deviceCollection: new PublicKey(args.deviceCollection),
          mplCollection: new PublicKey(args.mplCollection),
        })
        .accounts({
          mplCollection: new PublicKey(args.mplCollection),
          vendor,
          payer: payer.publicKey,
        })
        .signers([payer])
        .rpc();

      console.log("tx:", tx);
    }
  )
  .command(
    "bind",
    "Bind device to metaplex nft",
    {
      device: { type: "string", demandOption: true }, // device address
      mplAta: { type: "string", demandOption: true }, // Metaplex associated token address
    },
    async (args) => {
      const provider = anchor.AnchorProvider.local(DEV_RPC, {
        commitment: "confirmed",
        preflightCommitment: "processed",
      });

      anchor.setProvider(provider);

      const wallet = anchor.Wallet.local();
      const payer = wallet.payer;
      const owner = wallet.publicKey;

      const program = anchor.workspace.Puppet as Program<Puppet>;

      const mplAssociatedToken = new PublicKey(args.mplAta);

      // Calculate the device mint PDA
      const deviceCollectionBindingPda = PublicKey.findProgramAddressSync(
        [Buffer.from("device_binding"), new PublicKey(args.device).toBuffer()],
        program.programId
      );

      // Calculate the Metaplex collection binding PDA
      const mplCollectionBindingPda = PublicKey.findProgramAddressSync(
        [Buffer.from("mpl_binding"), mplAssociatedToken.toBuffer()],
        program.programId
      );

      const mplCollectionBinding =
        await program.account.mplCollectionBinding.fetch(
          mplCollectionBindingPda[0]
        );
      const deviceMintPda = PublicKey.findProgramAddressSync(
        [
          Buffer.from("device_mint"),
          mplCollectionBinding.deviceCollection.toBuffer(),
          new PublicKey(args.device).toBuffer(),
        ],
        DEPHY_ID_PROGRAM
      );
      const [deviceAssociatedToken] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [owner.toBuffer(), deviceMintPda[0].toBuffer()],
          DEPHY_ID_PROGRAM
        );

      await program.methods
        .bind({
          device: new PublicKey(args.device),
          mplAta: new PublicKey(args.mplAta),
        })
        .accounts({
          mplAssociatedToken, // The ATA for the Metaplex NFT
          deviceAssociatedToken,
          deviceCollectionBinding: deviceCollectionBindingPda[0], // Device collection binding PDA
          mplCollectionBinding: mplCollectionBindingPda[0], // Metaplex collection binding PDA
          owner: owner, // Owner of the device and NFT
          payer: payer.publicKey, // Payer of the transaction
        })
        .signers([payer])
        .rpc();
    }
  )
  .help().argv;
