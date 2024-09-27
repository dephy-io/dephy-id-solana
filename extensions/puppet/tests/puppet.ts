import * as fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
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
import { exec } from "child_process";
import { promisify } from "util";
import { assert } from "chai";
import { Puppet } from "../target/types/puppet";

const CLI_DIR = "../../cli";
const KEY_PATH = "tests/key.json";
const DEVICE_PATH = "tests/device.json";
const execPromise = promisify(exec);

describe("puppet program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Puppet as Program<Puppet>;

  const productName = "Test Product";

  const payer = Keypair.generate();

  // collection
  let product: PublicKey;
  let mplCollection: PublicKey;

  // device & nft
  let device: PublicKey;
  let deviceAta: PublicKey;
  let mplAta: PublicKey;

  // binding PDA
  let deviceCollectionBindingPDA: PublicKey;
  let mplCollectionBindingPDA: PublicKey;
  let deviceBindingPDA: PublicKey;
  let mplBindingPDA: PublicKey;

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        payer.publicKey,
        10 * anchor.web3.LAMPORTS_PER_SOL
      )
    );

    // write vendor secret key json
    fs.writeFileSync(KEY_PATH, `[${payer.secretKey.toString()}]`);

    // write device secret key json
    const deviceKeypair = Keypair.generate();
    device = new PublicKey(deviceKeypair.publicKey);
    fs.writeFileSync(DEVICE_PATH, `[${deviceKeypair.secretKey.toString()}]`);

    // create product
    const productPubkeyStr = await createProduct(productName);
    console.log("productMint:", productPubkeyStr);
    product = new PublicKey(productPubkeyStr);

    console.log("===")
    // create activated device
    const { deviceAta: deviceAtaStr } = await createDevice(
      payer.publicKey.toString(),
      product.toString(),
      device.toString()
    );
    console.log("deviceAta:", deviceAtaStr);
    deviceAta = new PublicKey(deviceAtaStr);

    // create mpl collection nft
    const _mplCollection = await createMplCollection(
      provider.connection,
      payer,
      "test collection",
      "http://"
    );
    mplCollection = new PublicKey(_mplCollection);
    console.log("mplCollection:", mplCollection.toString());

    // create mpl nft
    const _mplAta = await createMplNft(
      provider.connection,
      payer,
      "test nft",
      "http://",
      _mplCollection
    );
    mplAta = new PublicKey(_mplAta);
    console.log("mplAta:", mplCollection.toString());

    const [deviceCollectionBindingPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("device_collection_binding"), product.toBuffer()],
      program.programId
    );

    const [mplCollectionBindingPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("mpl_collection_binding"), mplCollection.toBuffer()],
      program.programId
    );

    const [mplBindingPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("mpl_binding"), mplAta.toBuffer()],
      program.programId
    );

    const [deviceBindingPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("device_binding"), deviceAta.toBuffer()],
      program.programId
    );

    deviceCollectionBindingPDA = deviceCollectionBindingPubkey;
    mplCollectionBindingPDA = mplCollectionBindingPubkey;
    deviceBindingPDA = deviceBindingPubkey;
    mplBindingPDA = mplBindingPubkey;
  });

  it("binds device collection and mpl collection", async () => {
    await program.methods
      .bindCollection({
        productMetadataName: productName,
        deviceCollection: product,
        mplCollection,
      })
      .accounts({
        payer: payer.publicKey,
        mplCollection,
      })
      .signers([payer])
      .rpc();

    const deviceCollectionBinding =
      await program.account.deviceCollectionBinding.fetch(
        deviceCollectionBindingPDA
      );
    const mplCollectionBinding =
      await program.account.mplCollectionBinding.fetch(mplCollectionBindingPDA);

    assert.equal(
      deviceCollectionBinding.mplCollection.toString(),
      mplCollection.toString()
    );
    assert.equal(
      mplCollectionBinding.deviceCollection.toString(),
      product.toString()
    );
  });

  it("binds device and mpl nft", async () => {
    await program.methods
      .bind({
        device,
        mplAta,
      })
      .accounts({
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    const deviceBinding = await program.account.deviceBinding.fetch(
      deviceBindingPDA
    );
    const mplBinding = await program.account.mplBinding.fetch(mplBindingPDA);

    assert.equal(deviceBinding.mplAta.toString(), mplAta.toString());
    assert.equal(mplBinding.deviceAta.toString(), deviceAta.toString());
  });
});

async function executeCommandInDirectory(
  directory: string,
  command: string,
  showStderr = false
) {
  try {
    const { stdout, stderr } = await execPromise(command, { cwd: directory });
    if (showStderr) {
      console.error("stderr:", stderr);
    }
    return stdout;
  } catch (error) {
    console.error("Execution failed:", error);
  }
}

const createProduct = async (name: string) => {
  const productMint = await executeCommandInDirectory(
    CLI_DIR,
    `cargo run create-product --vendor ../extensions/puppet/${KEY_PATH} '${name}' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor" -u http://127.0.0.1:8899 -p hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`
  );
  return productMint.trimEnd();
};

const createDevice = async (
  vendorPubkey: string,
  productMint: string,
  device: string
) => {
  const deviceMint = await executeCommandInDirectory(
    CLI_DIR,
    `cargo run dev-create-activated-device --vendor ../extensions/puppet/${KEY_PATH} --product ${productMint} --device ../extensions/puppet/${DEVICE_PATH} --user ../extensions/puppet/${KEY_PATH} -u http://127.0.0.1:8899 -p hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`
    ,true
  );

  console.log("deviceMint:", deviceMint)

  // const deviceAta = await executeCommandInDirectory(
  //   CLI_DIR,
  //   `cargo run dev-activate-device --user ../extensions/puppet/${KEY_PATH} --device ../extensions/puppet/${DEVICE_PATH} --vendor ${vendorPubkey} --product ${productMint} -u http://127.0.0.1:8899 -p hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`,
  //   true
  // );

  return {
    deviceMint: deviceMint.trimEnd(),
    deviceAta: deviceMint.trimEnd(),
  };
};

const createMplCollection = async (
  rpc: any,
  keypair: Keypair,
  name: string,
  uri: string
) => {
  const umi = createUmi(rpc);

  const keypairSigner = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);

  const signer = createSignerFromKeypair(umi, keypairSigner);

  umi.use(signerIdentity(signer)).use(mplTokenMetadata());

  const mint = generateSigner(umi);
  await createNft(umi, {
    mint,
    authority: signer,
    name,
    uri,
    sellerFeeBasisPoints: percentAmount(5.5),
    isCollection: true,
    collectionDetails: none(),
  }).sendAndConfirm(umi);

  const asset = await fetchDigitalAsset(umi, mint.publicKey);
  return asset.mint.publicKey;
};

const createMplNft = async (
  rpc: any,
  keypair: Keypair,
  name: string,
  uri: string,
  collection: string
) => {
  const umi = createUmi(rpc);

  const keypairSigner = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);

  const signer = createSignerFromKeypair(umi, keypairSigner);

  umi.use(signerIdentity(signer));
  umi.use(mplTokenMetadata());
  const mint = generateSigner(umi);
  await createNft(umi, {
    mint,
    name,
    uri,
    sellerFeeBasisPoints: percentAmount(5.5),
  }).sendAndConfirm(umi);

  const asset = await fetchDigitalAsset(umi, mint.publicKey);
  console.log("mpl_mint:", asset.mint.publicKey);

  const collectionMint = publicKey(collection);
  const collectionMetadata = findMetadataPda(umi, { mint: collectionMint });

  await setAndVerifyCollection(umi, {
    metadata: findMetadataPda(umi, { mint: asset.mint.publicKey }),
    collectionAuthority: signer,
    collectionMint: collectionMint,
    collection: collectionMetadata,
    collectionMasterEditionAccount: findMasterEditionPda(umi, {
      mint: collectionMint,
    }),
  }).sendAndConfirm(umi);

  console.log("collection verified");

  const mplAta = await getAssociatedTokenAddress(
    new anchor.web3.PublicKey(asset.mint.publicKey), // The mint address of the created NFT
    new anchor.web3.PublicKey(keypairSigner.publicKey), // The wallet address of the NFT owner
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return mplAta;
};
