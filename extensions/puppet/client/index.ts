import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Puppet } from "../target/types/puppet";
import { Program } from "@coral-xyz/anchor";
import {
  generateSigner,
  percentAmount,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
  none,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplTokenMetadata,
  createNft,
  fetchDigitalAsset,
  setAndVerifyCollection,
  findMetadataPda,
  findMasterEditionPda,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import fs from "fs";
import path from "path";

const DEPHY_ID_PROGRAM = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const PROGRAM_PAYER = new PublicKey("");
const DEV_RPC = "https://api.devnet.solana.com";
const SECRET_KEY = fs.readFileSync(
  path.join(__dirname, "../keypair.json"),
  "utf-8"
);
const program = anchor.workspace.Puppet as Program<Puppet>;
const [GLOBAL_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("global"), PROGRAM_PAYER.toBuffer()],
  program.programId
);

yargs(hideBin(process.argv))
  .command(
    "create-mpl-collection",
    "Create metaplex collection",
    {
      url: { type: "string", demandOption: true },
      name: { type: "string", demandOption: true },
    },
    async (args) => {
      const umi = createUmi(DEV_RPC);

      const keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(JSON.parse(SECRET_KEY))
      );
      console.log(keypair.publicKey);

      const signer = createSignerFromKeypair(umi, keypair);

      umi.use(signerIdentity(signer)).use(mplTokenMetadata());

      const mint = generateSigner(umi);
      await createNft(umi, {
        mint,
        authority: signer,
        name: args.name,
        uri: args.url,
        sellerFeeBasisPoints: percentAmount(5.5),
        isCollection: true,
        collectionDetails: none(),
      }).sendAndConfirm(umi);

      const asset = await fetchDigitalAsset(umi, mint.publicKey);
      console.log("mplCollection:", asset.mint.publicKey);
    }
  )
  .command(
    "create-mpl-nft",
    "Create metaplex nft",
    {
      collection: { type: "string", demandOption: true },
      url: { type: "string", demandOption: true },
      name: { type: "string", demandOption: true },
    },
    async (args) => {
      const umi = createUmi(DEV_RPC);

      const keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(JSON.parse(SECRET_KEY))
      );

      const signer = createSignerFromKeypair(umi, keypair);

      umi.use(signerIdentity(signer));
      umi.use(mplTokenMetadata());
      const mplMint = generateSigner(umi);
      await createNft(umi, {
        mint: mplMint,
        name: args.name,
        uri: args.url,
        sellerFeeBasisPoints: percentAmount(5.5),
      }).sendAndConfirm(umi);

      const mplMetadata = findMetadataPda(umi, { mint: mplMint.publicKey });
 
      console.log("mplMint:", mplMint.publicKey);
      console.log("mplMetadata:", mplMetadata);

      const collectionMint = publicKey(args.collection);
      const collectionMetadata = findMetadataPda(umi, { mint: collectionMint });

      await setAndVerifyCollection(umi, {
        metadata: mplMetadata,
        collectionAuthority: signer,
        collectionMint: collectionMint,
        collection: collectionMetadata,
        collectionMasterEditionAccount: findMasterEditionPda(umi, {
          mint: collectionMint,
        }),
      }).sendAndConfirm(umi);

      console.log("collection verified");

      const mplAta = await getAssociatedTokenAddress(
        new anchor.web3.PublicKey(mplMint.publicKey), // The mint address of the created NFT
        new anchor.web3.PublicKey(keypair.publicKey), // The wallet address of the NFT owner
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
          global: GLOBAL_PDA,
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
      mplMetadata: { type: "string", demandOption: true }, 
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
          global: GLOBAL_PDA,
          mplMetadata: args.mplMetadata, 
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
