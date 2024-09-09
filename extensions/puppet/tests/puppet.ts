import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createMint,
} from "@solana/spl-token";
import { assert } from "chai";
import { Puppet } from "../target/types/puppet";

describe("puppet program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Puppet as Program<Puppet>;

  let payer = Keypair.generate();
  let deviceMint: PublicKey;
  let nftMint: PublicKey;
  let deviceAccount: PublicKey;
  let nftAccount: PublicKey;
  let deviceBindingPDA: PublicKey;
  let nftBindingPDA: PublicKey;

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        payer.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      )
    );

    deviceMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey, // mint authority
      null, // freeze authority
      0 // decimals (0 for NFTs)
    );

    nftMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      0
    );

    deviceAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        deviceMint, // deviceMint
        payer.publicKey // owner
      )
    ).address;

    nftAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        nftMint, // nftMint
        payer.publicKey // owner
      )
    ).address;

    const [deviceBindingPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("device_binding"), deviceAccount.toBuffer()],
      program.programId
    );

    const [nftBindingPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_binding"), nftAccount.toBuffer()],
      program.programId
    );

    deviceBindingPDA = deviceBindingPubkey;
    nftBindingPDA = nftBindingPubkey;
  });

  it("binds NFT to device", async () => {
    const tx = await program.methods
      .bind({
        device: deviceAccount,
        nft: nftAccount,
      })
      .accounts({
        payer: payer.publicKey,
        deviceAccount: deviceAccount,
        nftAccount: nftAccount,
      })
      .signers([payer])
      .rpc();

    const deviceBinding = await program.account.deviceBinding.fetch(
      deviceBindingPDA
    );
    const nftBinding = await program.account.nftBinding.fetch(nftBindingPDA);

    assert.equal(deviceBinding.nft.toString(), nftAccount.toString());
    assert.equal(nftBinding.device.toString(), deviceAccount.toString());
  });

  it("fails to bind if payer does not own nft", async () => {
    const unboundDeviceAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        await createMint(
          provider.connection,
          payer,
          payer.publicKey,
          null,
          0
        ), 
        payer.publicKey 
      )
    ).address
    const nftAccountNotOwned = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        nftMint, 
        Keypair.generate().publicKey 
      )
    ).address;
    
    try {
      await program.methods
        .bind({
          device: unboundDeviceAccount,
          nft: nftAccountNotOwned,
        })
        .accounts({
          payer: payer.publicKey,
          deviceAccount: unboundDeviceAccount,
          nftAccount: nftAccountNotOwned,
        })
        .signers([payer])
        .rpc();
        assert.fail("Expected error but none was thrown");
    } catch (err) {
      assert.equal(err.error.errorCode.code, "PayerDoesNotOwnNFT");
    }
  });

  it("fails to bind if payer does not own device", async () => {
    const unboundNftAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        await createMint(
          provider.connection,
          payer,
          payer.publicKey,
          null,
          0
        ), 
        payer.publicKey 
      )
    ).address
    const deviceAccountNotOwned = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        deviceMint, 
        Keypair.generate().publicKey 
      )
    ).address;

    try {
      await program.methods
        .bind({
          device: deviceAccountNotOwned,
          nft: unboundNftAccount,
        })
        .accounts({
          payer: payer.publicKey,
          deviceAccount: deviceAccountNotOwned,
          nftAccount: unboundNftAccount,
        })
        .signers([payer])
        .rpc();
        assert.fail("Expected error but none was thrown");
    } catch (err) {
      assert.equal(err.error.errorCode.code, "PayerDoesNotOwnDevice");
    }
  });

  it("fails to bind if device already bound", async () => {
    const nftAccountUnbound = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        deviceMint,
        payer.publicKey
      )
    ).address;
    try {
      await program.methods
        .bind({
          device: deviceAccount,
          nft: nftAccountUnbound,
        })
        .accounts({
          payer: payer.publicKey,
          deviceAccount: deviceAccount,
          nftAccount: nftAccountUnbound,
        })
        .signers([payer])
        .rpc();
      assert.fail("Expected error but none was thrown");
    } catch (err) {
      const logs = err.logs || [];
      assert.isTrue(logs.some((log) => log.includes("already in use")));
    }
  });

  it("fails to bind if nft already bound", async () => {
    const deviceAccountUnbound = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        deviceMint,
        payer.publicKey
      )
    ).address;
    try {
      await program.methods
        .bind({
          device: deviceAccountUnbound,
          nft: nftAccount,
        })
        .accounts({
          payer: payer.publicKey,
          deviceAccount: deviceAccountUnbound,
          nftAccount: nftAccount,
        })
        .signers([payer])
        .rpc();
      assert.fail("Expected error but none was thrown");
    } catch (err) {
      const logs = err.logs || [];
      assert.isTrue(logs.some((log) => log.includes("already in use")));
    }
  });
});
