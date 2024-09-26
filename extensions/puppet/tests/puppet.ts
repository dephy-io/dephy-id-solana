import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createMint,
} from "@solana/spl-token";
import { exec } from 'child_process';
import { promisify } from 'util';
import { assert } from "chai";
import { Puppet } from "../target/types/puppet";

const execPromise = promisify(exec);

describe("puppet program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Puppet as Program<Puppet>;

  console.log("loaded")

  before(() => {
    console.log("before")
    executeCommandInDirectory(CLI, CREATE_PRODUCT);
  })

  it("success", async() => {

  })

  // let payer = Keypair.generate();
  // let deviceMint: PublicKey;
  // let nftMint: PublicKey;
  // let deviceAccount: PublicKey;
  // let nftAccount: PublicKey;
  // let deviceBindingPDA: PublicKey;
  // let nftBindingPDA: PublicKey;

  // // before(async () => {
  // //   await provider.connection.confirmTransaction(
  // //     await provider.connection.requestAirdrop(
  // //       payer.publicKey,
  // //       anchor.web3.LAMPORTS_PER_SOL
  // //     )
  // //   );

  // //   deviceMint = await createMint(
  // //     provider.connection,
  // //     payer,
  // //     payer.publicKey, // mint authority
  // //     null, // freeze authority
  // //     0 // decimals (0 for NFTs)
  // //   );

  // //   nftMint = await createMint(
  // //     provider.connection,
  // //     payer,
  // //     payer.publicKey,
  // //     null,
  // //     0
  // //   );

  // //   deviceAccount = (
  // //     await getOrCreateAssociatedTokenAccount(
  // //       provider.connection,
  // //       payer,
  // //       deviceMint, // deviceMint
  // //       payer.publicKey // owner
  // //     )
  // //   ).address;

  // //   nftAccount = (
  // //     await getOrCreateAssociatedTokenAccount(
  // //       provider.connection,
  // //       payer,
  // //       nftMint, // nftMint
  // //       payer.publicKey // owner
  // //     )
  // //   ).address;

  // //   const [deviceBindingPubkey] = PublicKey.findProgramAddressSync(
  // //     [Buffer.from("device_binding"), deviceAccount.toBuffer()],
  // //     program.programId
  // //   );

  // //   const [nftBindingPubkey] = PublicKey.findProgramAddressSync(
  // //     [Buffer.from("mpl_binding"), nftAccount.toBuffer()],
  // //     program.programId
  // //   );

  // //   deviceBindingPDA = deviceBindingPubkey;
  // //   nftBindingPDA = nftBindingPubkey;
  // // });

  // // it("binds device and nft", async () => {
  // //   const tx = await program.methods
  // //     .bind({
  // //       device: deviceAccount,
  // //       nft: nftAccount,
  // //     })
  // //     .accounts({
  // //       payer: payer.publicKey,
  // //       deviceAccount: deviceAccount,
  // //       nftAccount: nftAccount,
  // //     })
  // //     .signers([payer])
  // //     .rpc();

  // //   const deviceBinding = await program.account.deviceBinding.fetch(
  // //     deviceBindingPDA
  // //   );
  // //   const nftBinding = await program.account.nftBinding.fetch(nftBindingPDA);

  // //   assert.equal(deviceBinding.nft.toString(), nftAccount.toString());
  // //   assert.equal(nftBinding.device.toString(), deviceAccount.toString());
  // // });

  // // it("fails to bind if payer does not own nft", async () => {
  // //   const nftAccountNotOwned = (
  // //     await getOrCreateAssociatedTokenAccount(
  // //       provider.connection,
  // //       payer,
  // //       nftMint, 
  // //       Keypair.generate().publicKey 
  // //     )
  // //   ).address;
    
  // //   try {
  // //     await program.methods
  // //       .bind({
  // //         device: deviceAccount,
  // //         nft: nftAccountNotOwned,
  // //       })
  // //       .accounts({
  // //         payer: payer.publicKey,
  // //         deviceAccount: deviceAccount,
  // //         nftAccount: nftAccountNotOwned,
  // //       })
  // //       .signers([payer])
  // //       .rpc();
  // //       assert.fail("Expected error but none was thrown");
  // //   } catch (err) {
  // //     assert.equal(err.error.errorCode.code, "PayerDoesNotOwnNFT");
  // //   }
  // // });

  // // it("fails to bind if payer does not own device", async () => {
  // //   const deviceAccountNotOwned = (
  // //     await getOrCreateAssociatedTokenAccount(
  // //       provider.connection,
  // //       payer,
  // //       deviceMint, 
  // //       Keypair.generate().publicKey 
  // //     )
  // //   ).address;

  // //   try {
  // //     await program.methods
  // //       .bind({
  // //         device: deviceAccountNotOwned,
  // //         nft: nftAccount,
  // //       })
  // //       .accounts({
  // //         payer: payer.publicKey,
  // //         deviceAccount: deviceAccountNotOwned,
  // //         nftAccount: nftAccount,
  // //       })
  // //       .signers([payer])
  // //       .rpc();
  // //       assert.fail("Expected error but none was thrown");
  // //   } catch (err) {
  // //     assert.equal(err.error.errorCode.code, "PayerDoesNotOwnDevice");
  // //   }
  // // });

  // // it("fails to bind if device already bound", async () => {
  // //   await program.methods
  // //     .bind({
  // //       device: deviceAccount,
  // //       nft: nftAccount,
  // //     })
  // //     .accounts({
  // //       payer: payer.publicKey,
  // //       deviceAccount: deviceAccount,
  // //       nftAccount: nftAccount,
  // //     })
  // //     .signers([payer])
  // //     .rpc();

  // //   const nftAccountUnbound = (
  // //     await getOrCreateAssociatedTokenAccount(
  // //       provider.connection,
  // //       payer,
  // //       await createMint(
  // //         provider.connection,
  // //         payer,
  // //         payer.publicKey,
  // //         null,
  // //         0
  // //       ),
  // //       payer.publicKey
  // //     )
  // //   ).address;

  // //   try {
  // //     await program.methods
  // //       .bind({
  // //         device: deviceAccount,
  // //         nft: nftAccountUnbound,
  // //       })
  // //       .accounts({
  // //         payer: payer.publicKey,
  // //         deviceAccount: deviceAccount,
  // //         nftAccount: nftAccountUnbound,
  // //       })
  // //       .signers([payer])
  // //       .rpc();
  // //     assert.fail("Expected error but none was thrown");
  // //   } catch (err) {
  // //     assert.equal(err.error.errorCode.code, "DeviceAlreadyBound");
  // //   }
  // // });

  // // it("fails to bind if nft already bound", async () => {
  // //   const deviceAccountUnbound = (
  // //     await getOrCreateAssociatedTokenAccount(
  // //       provider.connection,
  // //       payer,
  // //       await createMint(
  // //         provider.connection,
  // //         payer,
  // //         payer.publicKey,
  // //         null,
  // //         0
  // //       ),
  // //       payer.publicKey
  // //     )
  // //   ).address;

  // //   try {
  // //     await program.methods
  // //       .bind({
  // //         device: deviceAccountUnbound,
  // //         nft: nftAccount,
  // //       })
  // //       .accounts({
  // //         payer: payer.publicKey,
  // //         deviceAccount: deviceAccountUnbound,
  // //         nftAccount: nftAccount,
  // //       })
  // //       .signers([payer])
  // //       .rpc();
  // //     assert.fail("Expected error but none was thrown");
  // //   } catch (err) {
  // //     assert.equal(err.error.errorCode.code, "NFTAlreadyBound");
  // //   }
  // // });
});

const CLI = "../../cli"
const CREATE_PRODUCT = `cargo run create-product --vendor ../extensions/puppet/keypair.json 'Product 1' 'SYMBOL' 'METADATA_URI' -m desc="First Product by Example Vendor" -u http://127.0.0.1:8899 -p hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1`

async function executeCommandInDirectory(directory: string, command: string) {
    try {
        const { stdout, stderr } = await execPromise(command, { cwd: directory });
        console.log('Output:', stdout);
        if (stderr) {
            console.error('Error:', stderr);
        }
    } catch (error) {
        console.error('Execution failed:', error);
    }
}