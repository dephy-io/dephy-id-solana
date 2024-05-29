'use strict';

var web3_js = require('@solana/web3.js');
var test = require('ava');
var src = require('../src');
var _setup = require('./_setup');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var test__default = /*#__PURE__*/_interopDefault(test);

var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var init_env_shim = __esm({
  "env-shim.ts"() {
  }
});
var require_increment_test = __commonJS({
  "test/increment.test.ts"() {
    init_env_shim();
    test__default.default("it increments an existing counter by 1 by default", async (t) => {
      const client = _setup.createDefaultSolanaClient();
      const authority = await _setup.generateKeyPairSignerWithSol(client);
      const [counterPda] = await _setup.createCounterForAuthority(client, authority);
      t.is((await src.fetchCounter(client.rpc, counterPda)).data.value, 0);
      const incrementIx = await src.getIncrementInstructionAsync({ authority });
      await web3_js.pipe(
        await _setup.createDefaultTransaction(client, authority),
        (tx) => web3_js.appendTransactionMessageInstruction(incrementIx, tx),
        (tx) => _setup.signAndSendTransaction(client, tx)
      );
      const counter = await src.fetchCounter(client.rpc, counterPda);
      t.is(counter.data.value, 1);
    });
    test__default.default("it can increment an existing counter by a specified amount", async (t) => {
      const client = _setup.createDefaultSolanaClient();
      const authority = await _setup.generateKeyPairSignerWithSol(client);
      const [counterPda] = await _setup.createCounterForAuthority(client, authority);
      t.is((await src.fetchCounter(client.rpc, counterPda)).data.value, 0);
      const incrementIx = await src.getIncrementInstructionAsync({
        authority,
        amount: 5
      });
      await web3_js.pipe(
        await _setup.createDefaultTransaction(client, authority),
        (tx) => web3_js.appendTransactionMessageInstruction(incrementIx, tx),
        (tx) => _setup.signAndSendTransaction(client, tx)
      );
      const counter = await src.fetchCounter(client.rpc, counterPda);
      t.is(counter.data.value, 5);
    });
    test__default.default("it cannot increment a counter that does not exist", async (t) => {
      const client = _setup.createDefaultSolanaClient();
      const authority = await _setup.generateKeyPairSignerWithSol(client);
      const [counterPda] = await src.findCounterPda({ authority: authority.address });
      t.is(await _setup.getBalance(client, counterPda), web3_js.lamports(0n));
      const incrementIx = await src.getIncrementInstructionAsync({ authority });
      const transactionMessage = web3_js.pipe(
        await _setup.createDefaultTransaction(client, authority),
        (tx) => web3_js.appendTransactionMessageInstruction(incrementIx, tx)
      );
      const promise = _setup.signAndSendTransaction(client, transactionMessage);
      const error = await t.throwsAsync(promise);
      t.true(
        web3_js.isSolanaError(
          error,
          web3_js.SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE
        )
      );
      t.true(
        web3_js.isProgramError(
          error.cause,
          transactionMessage,
          src.DEPHY_ID_PROGRAM_ADDRESS,
          src.DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER
        )
      );
    });
    test__default.default("it cannot increment a counter that belongs to another authority", async (t) => {
      const client = _setup.createDefaultSolanaClient();
      const [authorityA, authorityB] = await Promise.all([
        _setup.generateKeyPairSignerWithSol(client),
        _setup.generateKeyPairSignerWithSol(client)
      ]);
      const [counterPda] = await _setup.createCounterForAuthority(client, authorityA);
      const incrementIx = src.getIncrementInstruction({
        authority: authorityB,
        counter: counterPda
      });
      const transactionMessage = web3_js.pipe(
        await _setup.createDefaultTransaction(client, authorityB),
        (tx) => web3_js.appendTransactionMessageInstruction(incrementIx, tx)
      );
      const promise = _setup.signAndSendTransaction(client, transactionMessage);
      const error = await t.throwsAsync(promise);
      t.true(
        web3_js.isSolanaError(
          error,
          web3_js.SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE
        )
      );
      t.true(
        web3_js.isProgramError(
          error.cause,
          transactionMessage,
          src.DEPHY_ID_PROGRAM_ADDRESS,
          src.DEPHY_ID_ERROR__INVALID_PDA
        )
      );
    });
  }
});
var increment_test = require_increment_test();

module.exports = increment_test;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=increment.test.js.map