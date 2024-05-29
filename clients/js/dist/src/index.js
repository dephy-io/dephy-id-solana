'use strict';

var web3_js = require('@solana/web3.js');

// env-shim.ts
var __DEV__ = /* @__PURE__ */ (() => process["env"].NODE_ENV === "development")();
async function findProgramDataAccountPda(config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [web3_js.getUtf8Encoder().encode("DePHY_ID")]
  });
}
var DeviceSigningAlgorithm = /* @__PURE__ */ ((DeviceSigningAlgorithm4) => {
  DeviceSigningAlgorithm4[DeviceSigningAlgorithm4["Ed25519"] = 0] = "Ed25519";
  DeviceSigningAlgorithm4[DeviceSigningAlgorithm4["Secp256k1"] = 1] = "Secp256k1";
  return DeviceSigningAlgorithm4;
})(DeviceSigningAlgorithm || {});
function getDeviceSigningAlgorithmEncoder() {
  return web3_js.getEnumEncoder(DeviceSigningAlgorithm);
}
function getDeviceSigningAlgorithmDecoder() {
  return web3_js.getEnumDecoder(DeviceSigningAlgorithm);
}
function getDeviceSigningAlgorithmCodec() {
  return web3_js.combineCodec(
    getDeviceSigningAlgorithmEncoder(),
    getDeviceSigningAlgorithmDecoder()
  );
}
var Key = /* @__PURE__ */ ((Key2) => {
  Key2[Key2["Uninitialized"] = 0] = "Uninitialized";
  Key2[Key2["ProgramDataAccount"] = 1] = "ProgramDataAccount";
  return Key2;
})(Key || {});
function getKeyEncoder() {
  return web3_js.getEnumEncoder(Key);
}
function getKeyDecoder() {
  return web3_js.getEnumDecoder(Key);
}
function getKeyCodec() {
  return web3_js.combineCodec(getKeyEncoder(), getKeyDecoder());
}
function getProgramDataEncoder() {
  return web3_js.getStructEncoder([["bump", web3_js.getU8Encoder()]]);
}
function getProgramDataDecoder() {
  return web3_js.getStructDecoder([["bump", web3_js.getU8Decoder()]]);
}
function getProgramDataCodec() {
  return web3_js.combineCodec(getProgramDataEncoder(), getProgramDataDecoder());
}

// src/generated/accounts/programDataAccount.ts
function getProgramDataAccountEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["key", getKeyEncoder()],
      ["authority", web3_js.getAddressEncoder()],
      ["data", getProgramDataEncoder()]
    ]),
    (value) => ({ ...value, key: 1 /* ProgramDataAccount */ })
  );
}
function getProgramDataAccountDecoder() {
  return web3_js.getStructDecoder([
    ["key", getKeyDecoder()],
    ["authority", web3_js.getAddressDecoder()],
    ["data", getProgramDataDecoder()]
  ]);
}
function getProgramDataAccountCodec() {
  return web3_js.combineCodec(
    getProgramDataAccountEncoder(),
    getProgramDataAccountDecoder()
  );
}
function decodeProgramDataAccount(encodedAccount) {
  return web3_js.decodeAccount(
    encodedAccount,
    getProgramDataAccountDecoder()
  );
}
async function fetchProgramDataAccount(rpc, address, config) {
  const maybeAccount = await fetchMaybeProgramDataAccount(rpc, address, config);
  web3_js.assertAccountExists(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeProgramDataAccount(rpc, address, config) {
  const maybeAccount = await web3_js.fetchEncodedAccount(rpc, address, config);
  return decodeProgramDataAccount(maybeAccount);
}
async function fetchAllProgramDataAccount(rpc, addresses, config) {
  const maybeAccounts = await fetchAllMaybeProgramDataAccount(
    rpc,
    addresses,
    config
  );
  web3_js.assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}
async function fetchAllMaybeProgramDataAccount(rpc, addresses, config) {
  const maybeAccounts = await web3_js.fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map(
    (maybeAccount) => decodeProgramDataAccount(maybeAccount)
  );
}
function getProgramDataAccountSize() {
  return 34;
}
async function fetchProgramDataAccountFromSeeds(rpc, config = {}) {
  const maybeAccount = await fetchMaybeProgramDataAccountFromSeeds(rpc, config);
  web3_js.assertAccountExists(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeProgramDataAccountFromSeeds(rpc, config = {}) {
  const { programAddress, ...fetchConfig } = config;
  const [address] = await findProgramDataAccountPda({ programAddress });
  return await fetchMaybeProgramDataAccount(rpc, address, fetchConfig);
}

// src/generated/errors/dephyId.ts
var DEPHY_ID_ERROR__DESERIALIZATION_ERROR = 0;
var DEPHY_ID_ERROR__SERIALIZATION_ERROR = 1;
var DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER = 2;
var DEPHY_ID_ERROR__INVALID_PDA = 3;
var DEPHY_ID_ERROR__EXPECTED_EMPTY_ACCOUNT = 4;
var DEPHY_ID_ERROR__EXPECTED_NON_EMPTY_ACCOUNT = 5;
var DEPHY_ID_ERROR__EXPECTED_SIGNER_ACCOUNT = 6;
var DEPHY_ID_ERROR__EXPECTED_WRITABLE_ACCOUNT = 7;
var DEPHY_ID_ERROR__ACCOUNT_MISMATCH = 8;
var DEPHY_ID_ERROR__INVALID_ACCOUNT_KEY = 9;
var DEPHY_ID_ERROR__NUMERICAL_OVERFLOW = 10;
var DEPHY_ID_ERROR__MISSING_INSTRUCTION = 11;
var dephyIdErrorMessages;
if (__DEV__) {
  dephyIdErrorMessages = {
    [DEPHY_ID_ERROR__ACCOUNT_MISMATCH]: `Account mismatch`,
    [DEPHY_ID_ERROR__DESERIALIZATION_ERROR]: `Error deserializing an account`,
    [DEPHY_ID_ERROR__EXPECTED_EMPTY_ACCOUNT]: `Expected empty account`,
    [DEPHY_ID_ERROR__EXPECTED_NON_EMPTY_ACCOUNT]: `Expected non empty account`,
    [DEPHY_ID_ERROR__EXPECTED_SIGNER_ACCOUNT]: `Expected signer account`,
    [DEPHY_ID_ERROR__EXPECTED_WRITABLE_ACCOUNT]: `Expected writable account`,
    [DEPHY_ID_ERROR__INVALID_ACCOUNT_KEY]: `Invalid account key`,
    [DEPHY_ID_ERROR__INVALID_PDA]: `Invalid PDA derivation`,
    [DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER]: `Invalid program owner. This likely mean the provided account does not exist`,
    [DEPHY_ID_ERROR__MISSING_INSTRUCTION]: `Missing instruction`,
    [DEPHY_ID_ERROR__NUMERICAL_OVERFLOW]: `Numerical overflow`,
    [DEPHY_ID_ERROR__SERIALIZATION_ERROR]: `Error serializing an account`
  };
}
function getDephyIdErrorMessage(code) {
  if (__DEV__) {
    return dephyIdErrorMessages[code];
  }
  return "Error message not available in production bundles. Compile with `__DEV__` set to true to see more information.";
}
var DEPHY_ID_PROGRAM_ADDRESS = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1";
var DephyIdAccount = /* @__PURE__ */ ((DephyIdAccount2) => {
  DephyIdAccount2[DephyIdAccount2["ProgramDataAccount"] = 0] = "ProgramDataAccount";
  return DephyIdAccount2;
})(DephyIdAccount || {});
function identifyDephyIdAccount(account) {
  const data = account instanceof Uint8Array ? account : account.data;
  if (web3_js.containsBytes(data, getKeyEncoder().encode(1 /* ProgramDataAccount */), 0)) {
    return 0 /* ProgramDataAccount */;
  }
  throw new Error(
    "The provided account could not be identified as a dephyId account."
  );
}
var DephyIdInstruction = /* @__PURE__ */ ((DephyIdInstruction2) => {
  DephyIdInstruction2[DephyIdInstruction2["Initialize"] = 0] = "Initialize";
  DephyIdInstruction2[DephyIdInstruction2["CreateProduct"] = 1] = "CreateProduct";
  DephyIdInstruction2[DephyIdInstruction2["CreateDevice"] = 2] = "CreateDevice";
  DephyIdInstruction2[DephyIdInstruction2["ActivateDevice"] = 3] = "ActivateDevice";
  return DephyIdInstruction2;
})(DephyIdInstruction || {});
function identifyDephyIdInstruction(instruction) {
  const data = instruction instanceof Uint8Array ? instruction : instruction.data;
  if (web3_js.containsBytes(data, web3_js.getU8Encoder().encode(0), 0)) {
    return 0 /* Initialize */;
  }
  if (web3_js.containsBytes(data, web3_js.getU8Encoder().encode(1), 0)) {
    return 1 /* CreateProduct */;
  }
  if (web3_js.containsBytes(data, web3_js.getU8Encoder().encode(2), 0)) {
    return 2 /* CreateDevice */;
  }
  if (web3_js.containsBytes(data, web3_js.getU8Encoder().encode(3), 0)) {
    return 3 /* ActivateDevice */;
  }
  throw new Error(
    "The provided instruction could not be identified as a dephyId instruction."
  );
}
function expectAddress(value) {
  if (!value) {
    throw new Error("Expected a Address.");
  }
  if (typeof value === "object" && "address" in value) {
    return value.address;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
function getAccountMetaFactory(programAddress, optionalAccountStrategy) {
  return (account) => {
    if (!account.value) {
      return Object.freeze({
        address: programAddress,
        role: web3_js.AccountRole.READONLY
      });
    }
    const writableRole = account.isWritable ? web3_js.AccountRole.WRITABLE : web3_js.AccountRole.READONLY;
    return Object.freeze({
      address: expectAddress(account.value),
      role: isTransactionSigner(account.value) ? web3_js.upgradeRoleToSigner(writableRole) : writableRole,
      ...isTransactionSigner(account.value) ? { signer: account.value } : {}
    });
  };
}
function isTransactionSigner(value) {
  return !!value && typeof value === "object" && "address" in value && web3_js.isTransactionSigner(value);
}

// src/generated/instructions/activateDevice.ts
function getActivateDeviceInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["signingAlg", getDeviceSigningAlgorithmEncoder()]
    ]),
    (value) => ({ ...value, discriminator: 3 })
  );
}
function getActivateDeviceInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["signingAlg", getDeviceSigningAlgorithmDecoder()]
  ]);
}
function getActivateDeviceInstructionDataCodec() {
  return web3_js.combineCodec(
    getActivateDeviceInstructionDataEncoder(),
    getActivateDeviceInstructionDataDecoder()
  );
}
function getActivateDeviceInstruction(input) {
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    token2022Program: {
      value: input.token2022Program ?? null,
      isWritable: false
    },
    ataProgram: { value: input.ataProgram ?? null, isWritable: false },
    instructions: { value: input.instructions ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    vendor: { value: input.vendor ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: false },
    productAssociatedToken: {
      value: input.productAssociatedToken ?? null,
      isWritable: false
    },
    device: { value: input.device ?? null, isWritable: false },
    deviceMint: { value: input.deviceMint ?? null, isWritable: true },
    deviceAssociatedToken: {
      value: input.deviceAssociatedToken ?? null,
      isWritable: true
    },
    owner: { value: input.owner ?? null, isWritable: false }
  };
  const accounts = originalAccounts;
  const args = { ...input };
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress);
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.token2022Program),
      getAccountMeta(accounts.ataProgram),
      getAccountMeta(accounts.instructions),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.productMint),
      getAccountMeta(accounts.productAssociatedToken),
      getAccountMeta(accounts.device),
      getAccountMeta(accounts.deviceMint),
      getAccountMeta(accounts.deviceAssociatedToken),
      getAccountMeta(accounts.owner)
    ],
    programAddress,
    data: getActivateDeviceInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}
function parseActivateDeviceInstruction(instruction) {
  if (instruction.accounts.length < 12) {
    throw new Error("Not enough accounts");
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts[accountIndex];
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      systemProgram: getNextAccount(),
      token2022Program: getNextAccount(),
      ataProgram: getNextAccount(),
      instructions: getNextAccount(),
      payer: getNextAccount(),
      vendor: getNextAccount(),
      productMint: getNextAccount(),
      productAssociatedToken: getNextAccount(),
      device: getNextAccount(),
      deviceMint: getNextAccount(),
      deviceAssociatedToken: getNextAccount(),
      owner: getNextAccount()
    },
    data: getActivateDeviceInstructionDataDecoder().decode(instruction.data)
  };
}
function getCreateDeviceInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["name", web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())],
      ["uri", web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())],
      [
        "additionalMetadata",
        web3_js.getArrayEncoder(
          web3_js.getTupleEncoder([
            web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder()),
            web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())
          ])
        )
      ],
      ["signingAlg", getDeviceSigningAlgorithmEncoder()]
    ]),
    (value) => ({ ...value, discriminator: 2 })
  );
}
function getCreateDeviceInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["name", web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())],
    ["uri", web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())],
    [
      "additionalMetadata",
      web3_js.getArrayDecoder(
        web3_js.getTupleDecoder([
          web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder()),
          web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())
        ])
      )
    ],
    ["signingAlg", getDeviceSigningAlgorithmDecoder()]
  ]);
}
function getCreateDeviceInstructionDataCodec() {
  return web3_js.combineCodec(
    getCreateDeviceInstructionDataEncoder(),
    getCreateDeviceInstructionDataDecoder()
  );
}
function getCreateDeviceInstruction(input) {
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    token2022Program: {
      value: input.token2022Program ?? null,
      isWritable: false
    },
    ataProgram: { value: input.ataProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    vendor: { value: input.vendor ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: true },
    productAssociatedToken: {
      value: input.productAssociatedToken ?? null,
      isWritable: true
    },
    device: { value: input.device ?? null, isWritable: false },
    deviceMint: { value: input.deviceMint ?? null, isWritable: true }
  };
  const accounts = originalAccounts;
  const args = { ...input };
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress);
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.token2022Program),
      getAccountMeta(accounts.ataProgram),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.productMint),
      getAccountMeta(accounts.productAssociatedToken),
      getAccountMeta(accounts.device),
      getAccountMeta(accounts.deviceMint)
    ],
    programAddress,
    data: getCreateDeviceInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}
function parseCreateDeviceInstruction(instruction) {
  if (instruction.accounts.length < 9) {
    throw new Error("Not enough accounts");
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts[accountIndex];
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      systemProgram: getNextAccount(),
      token2022Program: getNextAccount(),
      ataProgram: getNextAccount(),
      payer: getNextAccount(),
      vendor: getNextAccount(),
      productMint: getNextAccount(),
      productAssociatedToken: getNextAccount(),
      device: getNextAccount(),
      deviceMint: getNextAccount()
    },
    data: getCreateDeviceInstructionDataDecoder().decode(instruction.data)
  };
}
function getCreateProductInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["name", web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())],
      ["symbol", web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())],
      ["uri", web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())],
      [
        "additionalMetadata",
        web3_js.getArrayEncoder(
          web3_js.getTupleEncoder([
            web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder()),
            web3_js.addEncoderSizePrefix(web3_js.getUtf8Encoder(), web3_js.getU32Encoder())
          ])
        )
      ]
    ]),
    (value) => ({ ...value, discriminator: 1 })
  );
}
function getCreateProductInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["name", web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())],
    ["symbol", web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())],
    ["uri", web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())],
    [
      "additionalMetadata",
      web3_js.getArrayDecoder(
        web3_js.getTupleDecoder([
          web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder()),
          web3_js.addDecoderSizePrefix(web3_js.getUtf8Decoder(), web3_js.getU32Decoder())
        ])
      )
    ]
  ]);
}
function getCreateProductInstructionDataCodec() {
  return web3_js.combineCodec(
    getCreateProductInstructionDataEncoder(),
    getCreateProductInstructionDataDecoder()
  );
}
function getCreateProductInstruction(input) {
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    token2022Program: {
      value: input.token2022Program ?? null,
      isWritable: false
    },
    payer: { value: input.payer ?? null, isWritable: true },
    vendor: { value: input.vendor ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: true }
  };
  const accounts = originalAccounts;
  const args = { ...input };
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress);
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.token2022Program),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.productMint)
    ],
    programAddress,
    data: getCreateProductInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}
function parseCreateProductInstruction(instruction) {
  if (instruction.accounts.length < 5) {
    throw new Error("Not enough accounts");
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts[accountIndex];
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      systemProgram: getNextAccount(),
      token2022Program: getNextAccount(),
      payer: getNextAccount(),
      vendor: getNextAccount(),
      productMint: getNextAccount()
    },
    data: getCreateProductInstructionDataDecoder().decode(instruction.data)
  };
}
function getInitializeInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["bump", web3_js.getU8Encoder()]
    ]),
    (value) => ({ ...value, discriminator: 0 })
  );
}
function getInitializeInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["bump", web3_js.getU8Decoder()]
  ]);
}
function getInitializeInstructionDataCodec() {
  return web3_js.combineCodec(
    getInitializeInstructionDataEncoder(),
    getInitializeInstructionDataDecoder()
  );
}
function getInitializeInstruction(input) {
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    programData: { value: input.programData ?? null, isWritable: true },
    authority: { value: input.authority ?? null, isWritable: false }
  };
  const accounts = originalAccounts;
  const args = { ...input };
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111";
  }
  const getAccountMeta = getAccountMetaFactory(programAddress);
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.programData),
      getAccountMeta(accounts.authority)
    ],
    programAddress,
    data: getInitializeInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}
function parseInitializeInstruction(instruction) {
  if (instruction.accounts.length < 4) {
    throw new Error("Not enough accounts");
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts[accountIndex];
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      systemProgram: getNextAccount(),
      payer: getNextAccount(),
      programData: getNextAccount(),
      authority: getNextAccount()
    },
    data: getInitializeInstructionDataDecoder().decode(instruction.data)
  };
}

exports.DEPHY_ID_ERROR__ACCOUNT_MISMATCH = DEPHY_ID_ERROR__ACCOUNT_MISMATCH;
exports.DEPHY_ID_ERROR__DESERIALIZATION_ERROR = DEPHY_ID_ERROR__DESERIALIZATION_ERROR;
exports.DEPHY_ID_ERROR__EXPECTED_EMPTY_ACCOUNT = DEPHY_ID_ERROR__EXPECTED_EMPTY_ACCOUNT;
exports.DEPHY_ID_ERROR__EXPECTED_NON_EMPTY_ACCOUNT = DEPHY_ID_ERROR__EXPECTED_NON_EMPTY_ACCOUNT;
exports.DEPHY_ID_ERROR__EXPECTED_SIGNER_ACCOUNT = DEPHY_ID_ERROR__EXPECTED_SIGNER_ACCOUNT;
exports.DEPHY_ID_ERROR__EXPECTED_WRITABLE_ACCOUNT = DEPHY_ID_ERROR__EXPECTED_WRITABLE_ACCOUNT;
exports.DEPHY_ID_ERROR__INVALID_ACCOUNT_KEY = DEPHY_ID_ERROR__INVALID_ACCOUNT_KEY;
exports.DEPHY_ID_ERROR__INVALID_PDA = DEPHY_ID_ERROR__INVALID_PDA;
exports.DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER = DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER;
exports.DEPHY_ID_ERROR__MISSING_INSTRUCTION = DEPHY_ID_ERROR__MISSING_INSTRUCTION;
exports.DEPHY_ID_ERROR__NUMERICAL_OVERFLOW = DEPHY_ID_ERROR__NUMERICAL_OVERFLOW;
exports.DEPHY_ID_ERROR__SERIALIZATION_ERROR = DEPHY_ID_ERROR__SERIALIZATION_ERROR;
exports.DEPHY_ID_PROGRAM_ADDRESS = DEPHY_ID_PROGRAM_ADDRESS;
exports.DephyIdAccount = DephyIdAccount;
exports.DephyIdInstruction = DephyIdInstruction;
exports.DeviceSigningAlgorithm = DeviceSigningAlgorithm;
exports.Key = Key;
exports.decodeProgramDataAccount = decodeProgramDataAccount;
exports.fetchAllMaybeProgramDataAccount = fetchAllMaybeProgramDataAccount;
exports.fetchAllProgramDataAccount = fetchAllProgramDataAccount;
exports.fetchMaybeProgramDataAccount = fetchMaybeProgramDataAccount;
exports.fetchMaybeProgramDataAccountFromSeeds = fetchMaybeProgramDataAccountFromSeeds;
exports.fetchProgramDataAccount = fetchProgramDataAccount;
exports.fetchProgramDataAccountFromSeeds = fetchProgramDataAccountFromSeeds;
exports.findProgramDataAccountPda = findProgramDataAccountPda;
exports.getActivateDeviceInstruction = getActivateDeviceInstruction;
exports.getActivateDeviceInstructionDataCodec = getActivateDeviceInstructionDataCodec;
exports.getActivateDeviceInstructionDataDecoder = getActivateDeviceInstructionDataDecoder;
exports.getActivateDeviceInstructionDataEncoder = getActivateDeviceInstructionDataEncoder;
exports.getCreateDeviceInstruction = getCreateDeviceInstruction;
exports.getCreateDeviceInstructionDataCodec = getCreateDeviceInstructionDataCodec;
exports.getCreateDeviceInstructionDataDecoder = getCreateDeviceInstructionDataDecoder;
exports.getCreateDeviceInstructionDataEncoder = getCreateDeviceInstructionDataEncoder;
exports.getCreateProductInstruction = getCreateProductInstruction;
exports.getCreateProductInstructionDataCodec = getCreateProductInstructionDataCodec;
exports.getCreateProductInstructionDataDecoder = getCreateProductInstructionDataDecoder;
exports.getCreateProductInstructionDataEncoder = getCreateProductInstructionDataEncoder;
exports.getDephyIdErrorMessage = getDephyIdErrorMessage;
exports.getDeviceSigningAlgorithmCodec = getDeviceSigningAlgorithmCodec;
exports.getDeviceSigningAlgorithmDecoder = getDeviceSigningAlgorithmDecoder;
exports.getDeviceSigningAlgorithmEncoder = getDeviceSigningAlgorithmEncoder;
exports.getInitializeInstruction = getInitializeInstruction;
exports.getInitializeInstructionDataCodec = getInitializeInstructionDataCodec;
exports.getInitializeInstructionDataDecoder = getInitializeInstructionDataDecoder;
exports.getInitializeInstructionDataEncoder = getInitializeInstructionDataEncoder;
exports.getKeyCodec = getKeyCodec;
exports.getKeyDecoder = getKeyDecoder;
exports.getKeyEncoder = getKeyEncoder;
exports.getProgramDataAccountCodec = getProgramDataAccountCodec;
exports.getProgramDataAccountDecoder = getProgramDataAccountDecoder;
exports.getProgramDataAccountEncoder = getProgramDataAccountEncoder;
exports.getProgramDataAccountSize = getProgramDataAccountSize;
exports.getProgramDataCodec = getProgramDataCodec;
exports.getProgramDataDecoder = getProgramDataDecoder;
exports.getProgramDataEncoder = getProgramDataEncoder;
exports.identifyDephyIdAccount = identifyDephyIdAccount;
exports.identifyDephyIdInstruction = identifyDephyIdInstruction;
exports.parseActivateDeviceInstruction = parseActivateDeviceInstruction;
exports.parseCreateDeviceInstruction = parseCreateDeviceInstruction;
exports.parseCreateProductInstruction = parseCreateProductInstruction;
exports.parseInitializeInstruction = parseInitializeInstruction;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map