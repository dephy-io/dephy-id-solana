'use strict';

var web3_js = require('@solana/web3.js');
var src = require('../src');

const createDefaultSolanaClient = () => {
  const rpc = web3_js.createSolanaRpc("http://127.0.0.1:8899");
  const rpcSubscriptions = web3_js.createSolanaRpcSubscriptions("ws://127.0.0.1:8900");
  return { rpc, rpcSubscriptions };
};
const generateKeyPairSignerWithSol = async (client, putativeLamports = 1000000000n) => {
  const signer = await web3_js.generateKeyPairSigner();
  await web3_js.airdropFactory(client)({
    recipientAddress: signer.address,
    lamports: web3_js.lamports(putativeLamports),
    commitment: "confirmed"
  });
  return signer;
};
const createDefaultTransaction = async (client, feePayer) => {
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();
  return web3_js.pipe(
    web3_js.createTransactionMessage({ version: 0 }),
    (tx) => web3_js.setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => web3_js.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
  );
};
const signAndSendTransaction = async (client, transactionMessage, commitment = "confirmed") => {
  const signedTransaction = await web3_js.signTransactionMessageWithSigners(transactionMessage);
  const signature = web3_js.getSignatureFromTransaction(signedTransaction);
  await web3_js.sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment
  });
  return signature;
};
const getBalance = async (client, address) => (await client.rpc.getBalance(address, { commitment: "confirmed" }).send()).value;
const createCounterForAuthority = async (client, authority) => {
  const [transaction, counterPda, createIx] = await Promise.all([
    createDefaultTransaction(client, authority),
    src.findCounterPda({ authority: authority.address }),
    src.getCreateInstructionAsync({ authority })
  ]);
  await web3_js.pipe(
    transaction,
    (tx) => web3_js.appendTransactionMessageInstruction(createIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  return counterPda;
};

exports.createCounterForAuthority = createCounterForAuthority;
exports.createDefaultSolanaClient = createDefaultSolanaClient;
exports.createDefaultTransaction = createDefaultTransaction;
exports.generateKeyPairSignerWithSol = generateKeyPairSignerWithSol;
exports.getBalance = getBalance;
exports.signAndSendTransaction = signAndSendTransaction;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=_setup.js.map