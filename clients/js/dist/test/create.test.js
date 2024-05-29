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
var require_create_test = __commonJS({
  "test/create.test.ts"() {
    init_env_shim();
    test__default.default("it creates a new counter account", async (t) => {
      const client = _setup.createDefaultSolanaClient();
      const authority = await _setup.generateKeyPairSignerWithSol(client);
      const createIx = await src.getCreateInstructionAsync({ authority });
      await web3_js.pipe(
        await _setup.createDefaultTransaction(client, authority),
        (tx) => web3_js.appendTransactionMessageInstruction(createIx, tx),
        (tx) => _setup.signAndSendTransaction(client, tx)
      );
      const counter = await src.fetchCounterFromSeeds(client.rpc, {
        authority: authority.address
      });
      t.like(counter, {
        data: {
          authority: authority.address,
          value: 0
        }
      });
    });
  }
});
var create_test = require_create_test();

module.exports = create_test;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=create.test.js.map