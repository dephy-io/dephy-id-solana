'use strict';

var web3_js = require('@solana/web3.js');

// src/generated/accounts/programDataAccount.ts
async function findDeviceATokenPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [
      web3_js.getAddressEncoder().encode(seeds.ownerPubkey),
      web3_js.getAddressEncoder().encode(
        web3_js.address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
      ),
      web3_js.getAddressEncoder().encode(seeds.deviceMintPubkey)
    ]
  });
}
async function findDeviceMintPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [
      web3_js.getUtf8Encoder().encode("DePHY_ID-DEVICE"),
      web3_js.getAddressEncoder().encode(seeds.productMintPubkey),
      web3_js.getAddressEncoder().encode(seeds.devicePubkey)
    ]
  });
}
async function findProductATokenPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [
      web3_js.getAddressEncoder().encode(seeds.devicePubkey),
      web3_js.getAddressEncoder().encode(
        web3_js.address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
      ),
      web3_js.getAddressEncoder().encode(seeds.productMintPubkey)
    ]
  });
}
async function findProductMintPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [
      web3_js.getUtf8Encoder().encode("DePHY_ID-PRODUCT"),
      web3_js.getAddressEncoder().encode(seeds.vendorPubkey),
      web3_js.getUtf8Encoder().encode(seeds.productName)
    ]
  });
}
async function findProgramDataPda(config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [web3_js.getUtf8Encoder().encode("DePHY_ID")]
  });
}
async function findProgramDataAccountPda(config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await web3_js.getProgramDerivedAddress({
    programAddress,
    seeds: [web3_js.getUtf8Encoder().encode("DePHY_ID")]
  });
}
function getCreateActivatedDeviceArgsEncoder() {
  return web3_js.getStructEncoder([
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
    ]
  ]);
}
function getCreateActivatedDeviceArgsDecoder() {
  return web3_js.getStructDecoder([
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
    ]
  ]);
}
function getCreateActivatedDeviceArgsCodec() {
  return web3_js.combineCodec(
    getCreateActivatedDeviceArgsEncoder(),
    getCreateActivatedDeviceArgsDecoder()
  );
}
function getDeviceActivationSignatureEncoder() {
  return web3_js.getDiscriminatedUnionEncoder([
    [
      "Ed25519",
      web3_js.getStructEncoder([
        ["fields", web3_js.getTupleEncoder([web3_js.fixEncoderSize(web3_js.getBytesEncoder(), 64)])]
      ])
    ],
    [
      "Secp256k1",
      web3_js.getStructEncoder([
        [
          "fields",
          web3_js.getTupleEncoder([
            web3_js.fixEncoderSize(web3_js.getBytesEncoder(), 64),
            web3_js.getU8Encoder()
          ])
        ]
      ])
    ],
    [
      "EthSecp256k1",
      web3_js.getStructEncoder([
        [
          "fields",
          web3_js.getTupleEncoder([
            web3_js.fixEncoderSize(web3_js.getBytesEncoder(), 64),
            web3_js.getU8Encoder()
          ])
        ]
      ])
    ]
  ]);
}
function getDeviceActivationSignatureDecoder() {
  return web3_js.getDiscriminatedUnionDecoder([
    [
      "Ed25519",
      web3_js.getStructDecoder([
        ["fields", web3_js.getTupleDecoder([web3_js.fixDecoderSize(web3_js.getBytesDecoder(), 64)])]
      ])
    ],
    [
      "Secp256k1",
      web3_js.getStructDecoder([
        [
          "fields",
          web3_js.getTupleDecoder([
            web3_js.fixDecoderSize(web3_js.getBytesDecoder(), 64),
            web3_js.getU8Decoder()
          ])
        ]
      ])
    ],
    [
      "EthSecp256k1",
      web3_js.getStructDecoder([
        [
          "fields",
          web3_js.getTupleDecoder([
            web3_js.fixDecoderSize(web3_js.getBytesDecoder(), 64),
            web3_js.getU8Decoder()
          ])
        ]
      ])
    ]
  ]);
}
function getDeviceActivationSignatureCodec() {
  return web3_js.combineCodec(
    getDeviceActivationSignatureEncoder(),
    getDeviceActivationSignatureDecoder()
  );
}
function deviceActivationSignature(kind, data) {
  return Array.isArray(data) ? { __kind: kind, fields: data } : { __kind: kind, ...data ?? {} };
}
function isDeviceActivationSignature(kind, value) {
  return value.__kind === kind;
}
var DeviceSigningAlgorithm = /* @__PURE__ */ ((DeviceSigningAlgorithm2) => {
  DeviceSigningAlgorithm2[DeviceSigningAlgorithm2["Ed25519"] = 0] = "Ed25519";
  DeviceSigningAlgorithm2[DeviceSigningAlgorithm2["Secp256k1"] = 1] = "Secp256k1";
  return DeviceSigningAlgorithm2;
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
var PROGRAM_DATA_ACCOUNT_KEY = 1 /* ProgramDataAccount */;
function getProgramDataAccountKeyBytes() {
  return getKeyEncoder().encode(PROGRAM_DATA_ACCOUNT_KEY);
}
function getProgramDataAccountEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["key", getKeyEncoder()],
      ["authority", web3_js.getAddressEncoder()],
      ["data", getProgramDataEncoder()]
    ]),
    (value) => ({ ...value, key: PROGRAM_DATA_ACCOUNT_KEY })
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
async function fetchProgramDataAccount(rpc, address3, config) {
  const maybeAccount = await fetchMaybeProgramDataAccount(rpc, address3, config);
  web3_js.assertAccountExists(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeProgramDataAccount(rpc, address3, config) {
  const maybeAccount = await web3_js.fetchEncodedAccount(rpc, address3, config);
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
  const [address3] = await findProgramDataAccountPda({ programAddress });
  return await fetchMaybeProgramDataAccount(rpc, address3, fetchConfig);
}
var DEPHY_ID_PROGRAM_ADDRESS = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1";
var DephyIdAccount = /* @__PURE__ */ ((DephyIdAccount2) => {
  DephyIdAccount2[DephyIdAccount2["ProgramDataAccount"] = 0] = "ProgramDataAccount";
  return DephyIdAccount2;
})(DephyIdAccount || {});
function identifyDephyIdAccount(account) {
  const data = "data" in account ? account.data : account;
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
  DephyIdInstruction2[DephyIdInstruction2["CreateActivatedDevice"] = 4] = "CreateActivatedDevice";
  DephyIdInstruction2[DephyIdInstruction2["CreateActivatedDeviceNonSigner"] = 5] = "CreateActivatedDeviceNonSigner";
  return DephyIdInstruction2;
})(DephyIdInstruction || {});
function identifyDephyIdInstruction(instruction) {
  const data = "data" in instruction ? instruction.data : instruction;
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
  if (web3_js.containsBytes(data, web3_js.getU8Encoder().encode(4), 0)) {
    return 4 /* CreateActivatedDevice */;
  }
  if (web3_js.containsBytes(data, web3_js.getU8Encoder().encode(5), 0)) {
    return 5 /* CreateActivatedDeviceNonSigner */;
  }
  throw new Error(
    "The provided instruction could not be identified as a dephyId instruction."
  );
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
var DEPHY_ID_ERROR__SIGNATURE_MISMATCH = 12;
var dephyIdErrorMessages;
if (process.env.NODE_ENV !== "production") {
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
    [DEPHY_ID_ERROR__SERIALIZATION_ERROR]: `Error serializing an account`,
    [DEPHY_ID_ERROR__SIGNATURE_MISMATCH]: `Signature mismatch`
  };
}
function getDephyIdErrorMessage(code) {
  if (process.env.NODE_ENV !== "production") {
    return dephyIdErrorMessages[code];
  }
  return "Error message not available in production bundles.";
}
function isDephyIdError(error, transactionMessage, code) {
  return web3_js.isProgramError(
    error,
    transactionMessage,
    DEPHY_ID_PROGRAM_ADDRESS,
    code
  );
}
function expectSome(value) {
  if (value == null) {
    throw new Error("Expected a value but received null or undefined.");
  }
  return value;
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
var ACTIVATE_DEVICE_DISCRIMINATOR = 3;
function getActivateDeviceDiscriminatorBytes() {
  return web3_js.getU8Encoder().encode(ACTIVATE_DEVICE_DISCRIMINATOR);
}
function getActivateDeviceInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["signature", getDeviceActivationSignatureEncoder()],
      ["timestamp", web3_js.getU64Encoder()]
    ]),
    (value) => ({ ...value, discriminator: ACTIVATE_DEVICE_DISCRIMINATOR })
  );
}
function getActivateDeviceInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["signature", getDeviceActivationSignatureDecoder()],
    ["timestamp", web3_js.getU64Decoder()]
  ]);
}
function getActivateDeviceInstructionDataCodec() {
  return web3_js.combineCodec(
    getActivateDeviceInstructionDataEncoder(),
    getActivateDeviceInstructionDataDecoder()
  );
}
function getActivateDeviceInstruction(input, config) {
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    token2022Program: {
      value: input.token2022Program ?? null,
      isWritable: false
    },
    ataProgram: { value: input.ataProgram ?? null, isWritable: false },
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
  if (!accounts.token2022Program.value) {
    accounts.token2022Program.value = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
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
  if (instruction.accounts.length < 11) {
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
      deviceMint: getNextAccount(),
      deviceAssociatedToken: getNextAccount(),
      owner: getNextAccount()
    },
    data: getActivateDeviceInstructionDataDecoder().decode(instruction.data)
  };
}
var CREATE_ACTIVATED_DEVICE_DISCRIMINATOR = 4;
function getCreateActivatedDeviceDiscriminatorBytes() {
  return web3_js.getU8Encoder().encode(CREATE_ACTIVATED_DEVICE_DISCRIMINATOR);
}
function getCreateActivatedDeviceInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsEncoder()]
    ]),
    (value) => ({
      ...value,
      discriminator: CREATE_ACTIVATED_DEVICE_DISCRIMINATOR
    })
  );
}
function getCreateActivatedDeviceInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsDecoder()]
  ]);
}
function getCreateActivatedDeviceInstructionDataCodec() {
  return web3_js.combineCodec(
    getCreateActivatedDeviceInstructionDataEncoder(),
    getCreateActivatedDeviceInstructionDataDecoder()
  );
}
function getCreateActivatedDeviceInstruction(input, config) {
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;
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
  if (!accounts.token2022Program.value) {
    accounts.token2022Program.value = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
  }
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
  }
  if (!accounts.payer.value) {
    accounts.payer.value = expectSome(accounts.vendor.value);
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
      getAccountMeta(accounts.deviceMint),
      getAccountMeta(accounts.deviceAssociatedToken),
      getAccountMeta(accounts.owner)
    ],
    programAddress,
    data: getCreateActivatedDeviceInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}
function parseCreateActivatedDeviceInstruction(instruction) {
  if (instruction.accounts.length < 11) {
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
      deviceMint: getNextAccount(),
      deviceAssociatedToken: getNextAccount(),
      owner: getNextAccount()
    },
    data: getCreateActivatedDeviceInstructionDataDecoder().decode(
      instruction.data
    )
  };
}
var CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR = 5;
function getCreateActivatedDeviceNonSignerDiscriminatorBytes() {
  return web3_js.getU8Encoder().encode(
    CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR
  );
}
function getCreateActivatedDeviceNonSignerInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsEncoder()]
    ]),
    (value) => ({
      ...value,
      discriminator: CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR
    })
  );
}
function getCreateActivatedDeviceNonSignerInstructionDataDecoder() {
  return web3_js.getStructDecoder([
    ["discriminator", web3_js.getU8Decoder()],
    ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsDecoder()]
  ]);
}
function getCreateActivatedDeviceNonSignerInstructionDataCodec() {
  return web3_js.combineCodec(
    getCreateActivatedDeviceNonSignerInstructionDataEncoder(),
    getCreateActivatedDeviceNonSignerInstructionDataDecoder()
  );
}
function getCreateActivatedDeviceNonSignerInstruction(input, config) {
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;
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
  if (!accounts.token2022Program.value) {
    accounts.token2022Program.value = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
  }
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
  }
  if (!accounts.payer.value) {
    accounts.payer.value = expectSome(accounts.vendor.value);
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
      getAccountMeta(accounts.deviceMint),
      getAccountMeta(accounts.deviceAssociatedToken),
      getAccountMeta(accounts.owner)
    ],
    programAddress,
    data: getCreateActivatedDeviceNonSignerInstructionDataEncoder().encode(
      args
    )
  };
  return instruction;
}
function parseCreateActivatedDeviceNonSignerInstruction(instruction) {
  if (instruction.accounts.length < 11) {
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
      deviceMint: getNextAccount(),
      deviceAssociatedToken: getNextAccount(),
      owner: getNextAccount()
    },
    data: getCreateActivatedDeviceNonSignerInstructionDataDecoder().decode(
      instruction.data
    )
  };
}
var CREATE_DEVICE_DISCRIMINATOR = 2;
function getCreateDeviceDiscriminatorBytes() {
  return web3_js.getU8Encoder().encode(CREATE_DEVICE_DISCRIMINATOR);
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
    (value) => ({ ...value, discriminator: CREATE_DEVICE_DISCRIMINATOR })
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
function getCreateDeviceInstruction(input, config) {
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;
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
  if (!accounts.token2022Program.value) {
    accounts.token2022Program.value = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
  }
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
  }
  if (!accounts.payer.value) {
    accounts.payer.value = expectSome(accounts.vendor.value);
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
var CREATE_PRODUCT_DISCRIMINATOR = 1;
function getCreateProductDiscriminatorBytes() {
  return web3_js.getU8Encoder().encode(CREATE_PRODUCT_DISCRIMINATOR);
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
    (value) => ({ ...value, discriminator: CREATE_PRODUCT_DISCRIMINATOR })
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
function getCreateProductInstruction(input, config) {
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;
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
  if (!accounts.token2022Program.value) {
    accounts.token2022Program.value = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
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
var INITIALIZE_DISCRIMINATOR = 0;
function getInitializeDiscriminatorBytes() {
  return web3_js.getU8Encoder().encode(INITIALIZE_DISCRIMINATOR);
}
function getInitializeInstructionDataEncoder() {
  return web3_js.transformEncoder(
    web3_js.getStructEncoder([
      ["discriminator", web3_js.getU8Encoder()],
      ["bump", web3_js.getU8Encoder()]
    ]),
    (value) => ({ ...value, discriminator: INITIALIZE_DISCRIMINATOR })
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
function getInitializeInstruction(input, config) {
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;
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
  if (!accounts.payer.value) {
    accounts.payer.value = expectSome(accounts.authority.value);
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

exports.ACTIVATE_DEVICE_DISCRIMINATOR = ACTIVATE_DEVICE_DISCRIMINATOR;
exports.CREATE_ACTIVATED_DEVICE_DISCRIMINATOR = CREATE_ACTIVATED_DEVICE_DISCRIMINATOR;
exports.CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR = CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR;
exports.CREATE_DEVICE_DISCRIMINATOR = CREATE_DEVICE_DISCRIMINATOR;
exports.CREATE_PRODUCT_DISCRIMINATOR = CREATE_PRODUCT_DISCRIMINATOR;
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
exports.DEPHY_ID_ERROR__SIGNATURE_MISMATCH = DEPHY_ID_ERROR__SIGNATURE_MISMATCH;
exports.DEPHY_ID_PROGRAM_ADDRESS = DEPHY_ID_PROGRAM_ADDRESS;
exports.DephyIdAccount = DephyIdAccount;
exports.DephyIdInstruction = DephyIdInstruction;
exports.DeviceSigningAlgorithm = DeviceSigningAlgorithm;
exports.INITIALIZE_DISCRIMINATOR = INITIALIZE_DISCRIMINATOR;
exports.Key = Key;
exports.PROGRAM_DATA_ACCOUNT_KEY = PROGRAM_DATA_ACCOUNT_KEY;
exports.decodeProgramDataAccount = decodeProgramDataAccount;
exports.deviceActivationSignature = deviceActivationSignature;
exports.fetchAllMaybeProgramDataAccount = fetchAllMaybeProgramDataAccount;
exports.fetchAllProgramDataAccount = fetchAllProgramDataAccount;
exports.fetchMaybeProgramDataAccount = fetchMaybeProgramDataAccount;
exports.fetchMaybeProgramDataAccountFromSeeds = fetchMaybeProgramDataAccountFromSeeds;
exports.fetchProgramDataAccount = fetchProgramDataAccount;
exports.fetchProgramDataAccountFromSeeds = fetchProgramDataAccountFromSeeds;
exports.findDeviceATokenPda = findDeviceATokenPda;
exports.findDeviceMintPda = findDeviceMintPda;
exports.findProductATokenPda = findProductATokenPda;
exports.findProductMintPda = findProductMintPda;
exports.findProgramDataAccountPda = findProgramDataAccountPda;
exports.findProgramDataPda = findProgramDataPda;
exports.getActivateDeviceDiscriminatorBytes = getActivateDeviceDiscriminatorBytes;
exports.getActivateDeviceInstruction = getActivateDeviceInstruction;
exports.getActivateDeviceInstructionDataCodec = getActivateDeviceInstructionDataCodec;
exports.getActivateDeviceInstructionDataDecoder = getActivateDeviceInstructionDataDecoder;
exports.getActivateDeviceInstructionDataEncoder = getActivateDeviceInstructionDataEncoder;
exports.getCreateActivatedDeviceArgsCodec = getCreateActivatedDeviceArgsCodec;
exports.getCreateActivatedDeviceArgsDecoder = getCreateActivatedDeviceArgsDecoder;
exports.getCreateActivatedDeviceArgsEncoder = getCreateActivatedDeviceArgsEncoder;
exports.getCreateActivatedDeviceDiscriminatorBytes = getCreateActivatedDeviceDiscriminatorBytes;
exports.getCreateActivatedDeviceInstruction = getCreateActivatedDeviceInstruction;
exports.getCreateActivatedDeviceInstructionDataCodec = getCreateActivatedDeviceInstructionDataCodec;
exports.getCreateActivatedDeviceInstructionDataDecoder = getCreateActivatedDeviceInstructionDataDecoder;
exports.getCreateActivatedDeviceInstructionDataEncoder = getCreateActivatedDeviceInstructionDataEncoder;
exports.getCreateActivatedDeviceNonSignerDiscriminatorBytes = getCreateActivatedDeviceNonSignerDiscriminatorBytes;
exports.getCreateActivatedDeviceNonSignerInstruction = getCreateActivatedDeviceNonSignerInstruction;
exports.getCreateActivatedDeviceNonSignerInstructionDataCodec = getCreateActivatedDeviceNonSignerInstructionDataCodec;
exports.getCreateActivatedDeviceNonSignerInstructionDataDecoder = getCreateActivatedDeviceNonSignerInstructionDataDecoder;
exports.getCreateActivatedDeviceNonSignerInstructionDataEncoder = getCreateActivatedDeviceNonSignerInstructionDataEncoder;
exports.getCreateDeviceDiscriminatorBytes = getCreateDeviceDiscriminatorBytes;
exports.getCreateDeviceInstruction = getCreateDeviceInstruction;
exports.getCreateDeviceInstructionDataCodec = getCreateDeviceInstructionDataCodec;
exports.getCreateDeviceInstructionDataDecoder = getCreateDeviceInstructionDataDecoder;
exports.getCreateDeviceInstructionDataEncoder = getCreateDeviceInstructionDataEncoder;
exports.getCreateProductDiscriminatorBytes = getCreateProductDiscriminatorBytes;
exports.getCreateProductInstruction = getCreateProductInstruction;
exports.getCreateProductInstructionDataCodec = getCreateProductInstructionDataCodec;
exports.getCreateProductInstructionDataDecoder = getCreateProductInstructionDataDecoder;
exports.getCreateProductInstructionDataEncoder = getCreateProductInstructionDataEncoder;
exports.getDephyIdErrorMessage = getDephyIdErrorMessage;
exports.getDeviceActivationSignatureCodec = getDeviceActivationSignatureCodec;
exports.getDeviceActivationSignatureDecoder = getDeviceActivationSignatureDecoder;
exports.getDeviceActivationSignatureEncoder = getDeviceActivationSignatureEncoder;
exports.getDeviceSigningAlgorithmCodec = getDeviceSigningAlgorithmCodec;
exports.getDeviceSigningAlgorithmDecoder = getDeviceSigningAlgorithmDecoder;
exports.getDeviceSigningAlgorithmEncoder = getDeviceSigningAlgorithmEncoder;
exports.getInitializeDiscriminatorBytes = getInitializeDiscriminatorBytes;
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
exports.getProgramDataAccountKeyBytes = getProgramDataAccountKeyBytes;
exports.getProgramDataAccountSize = getProgramDataAccountSize;
exports.getProgramDataCodec = getProgramDataCodec;
exports.getProgramDataDecoder = getProgramDataDecoder;
exports.getProgramDataEncoder = getProgramDataEncoder;
exports.identifyDephyIdAccount = identifyDephyIdAccount;
exports.identifyDephyIdInstruction = identifyDephyIdInstruction;
exports.isDephyIdError = isDephyIdError;
exports.isDeviceActivationSignature = isDeviceActivationSignature;
exports.parseActivateDeviceInstruction = parseActivateDeviceInstruction;
exports.parseCreateActivatedDeviceInstruction = parseCreateActivatedDeviceInstruction;
exports.parseCreateActivatedDeviceNonSignerInstruction = parseCreateActivatedDeviceNonSignerInstruction;
exports.parseCreateDeviceInstruction = parseCreateDeviceInstruction;
exports.parseCreateProductInstruction = parseCreateProductInstruction;
exports.parseInitializeInstruction = parseInitializeInstruction;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map