import { getProgramDerivedAddress, getUtf8Encoder, getAddressEncoder, getDiscriminatedUnionEncoder, getStructEncoder, getTupleEncoder, fixEncoderSize, getBytesEncoder, getU8Encoder, getDiscriminatedUnionDecoder, getStructDecoder, getTupleDecoder, fixDecoderSize, getBytesDecoder, getU8Decoder, combineCodec, getEnumEncoder, getEnumDecoder, transformEncoder, getAddressDecoder, decodeAccount, assertAccountExists, fetchEncodedAccount, assertAccountsExist, fetchEncodedAccounts, containsBytes, getU64Encoder, getU64Decoder, addEncoderSizePrefix, getU32Encoder, getArrayEncoder, addDecoderSizePrefix, getUtf8Decoder, getU32Decoder, getArrayDecoder, AccountRole, upgradeRoleToSigner, isTransactionSigner as isTransactionSigner$1 } from '@solana/web3.js';

// env-shim.ts
var __DEV__ = /* @__PURE__ */ (() => process["env"].NODE_ENV === "development")();
async function findDeviceMintPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode("DePHY_ID-DEVICE"),
      getAddressEncoder().encode(seeds.productMintPubkey),
      getAddressEncoder().encode(seeds.devicePubkey)
    ]
  });
}
async function findProductMintPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode("DePHY_ID-PRODUCT"),
      getAddressEncoder().encode(seeds.vendorPubkey),
      getUtf8Encoder().encode(seeds.productName)
    ]
  });
}
async function findProgramDataAccountPda(config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [getUtf8Encoder().encode("DePHY_ID")]
  });
}
function getDeviceActivationSignatureEncoder() {
  return getDiscriminatedUnionEncoder([
    [
      "Ed25519",
      getStructEncoder([
        ["fields", getTupleEncoder([fixEncoderSize(getBytesEncoder(), 64)])]
      ])
    ],
    [
      "Secp256k1",
      getStructEncoder([
        [
          "fields",
          getTupleEncoder([
            fixEncoderSize(getBytesEncoder(), 64),
            getU8Encoder()
          ])
        ]
      ])
    ],
    [
      "EthSecp256k1",
      getStructEncoder([
        [
          "fields",
          getTupleEncoder([
            fixEncoderSize(getBytesEncoder(), 64),
            getU8Encoder()
          ])
        ]
      ])
    ]
  ]);
}
function getDeviceActivationSignatureDecoder() {
  return getDiscriminatedUnionDecoder([
    [
      "Ed25519",
      getStructDecoder([
        ["fields", getTupleDecoder([fixDecoderSize(getBytesDecoder(), 64)])]
      ])
    ],
    [
      "Secp256k1",
      getStructDecoder([
        [
          "fields",
          getTupleDecoder([
            fixDecoderSize(getBytesDecoder(), 64),
            getU8Decoder()
          ])
        ]
      ])
    ],
    [
      "EthSecp256k1",
      getStructDecoder([
        [
          "fields",
          getTupleDecoder([
            fixDecoderSize(getBytesDecoder(), 64),
            getU8Decoder()
          ])
        ]
      ])
    ]
  ]);
}
function getDeviceActivationSignatureCodec() {
  return combineCodec(
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
var DeviceSigningAlgorithm = /* @__PURE__ */ ((DeviceSigningAlgorithm3) => {
  DeviceSigningAlgorithm3[DeviceSigningAlgorithm3["Ed25519"] = 0] = "Ed25519";
  DeviceSigningAlgorithm3[DeviceSigningAlgorithm3["Secp256k1"] = 1] = "Secp256k1";
  return DeviceSigningAlgorithm3;
})(DeviceSigningAlgorithm || {});
function getDeviceSigningAlgorithmEncoder() {
  return getEnumEncoder(DeviceSigningAlgorithm);
}
function getDeviceSigningAlgorithmDecoder() {
  return getEnumDecoder(DeviceSigningAlgorithm);
}
function getDeviceSigningAlgorithmCodec() {
  return combineCodec(
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
  return getEnumEncoder(Key);
}
function getKeyDecoder() {
  return getEnumDecoder(Key);
}
function getKeyCodec() {
  return combineCodec(getKeyEncoder(), getKeyDecoder());
}
function getProgramDataEncoder() {
  return getStructEncoder([["bump", getU8Encoder()]]);
}
function getProgramDataDecoder() {
  return getStructDecoder([["bump", getU8Decoder()]]);
}
function getProgramDataCodec() {
  return combineCodec(getProgramDataEncoder(), getProgramDataDecoder());
}

// src/generated/accounts/programDataAccount.ts
function getProgramDataAccountEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["key", getKeyEncoder()],
      ["authority", getAddressEncoder()],
      ["data", getProgramDataEncoder()]
    ]),
    (value) => ({ ...value, key: 1 /* ProgramDataAccount */ })
  );
}
function getProgramDataAccountDecoder() {
  return getStructDecoder([
    ["key", getKeyDecoder()],
    ["authority", getAddressDecoder()],
    ["data", getProgramDataDecoder()]
  ]);
}
function getProgramDataAccountCodec() {
  return combineCodec(
    getProgramDataAccountEncoder(),
    getProgramDataAccountDecoder()
  );
}
function decodeProgramDataAccount(encodedAccount) {
  return decodeAccount(
    encodedAccount,
    getProgramDataAccountDecoder()
  );
}
async function fetchProgramDataAccount(rpc, address, config) {
  const maybeAccount = await fetchMaybeProgramDataAccount(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeProgramDataAccount(rpc, address, config) {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeProgramDataAccount(maybeAccount);
}
async function fetchAllProgramDataAccount(rpc, addresses, config) {
  const maybeAccounts = await fetchAllMaybeProgramDataAccount(
    rpc,
    addresses,
    config
  );
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}
async function fetchAllMaybeProgramDataAccount(rpc, addresses, config) {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map(
    (maybeAccount) => decodeProgramDataAccount(maybeAccount)
  );
}
function getProgramDataAccountSize() {
  return 34;
}
async function fetchProgramDataAccountFromSeeds(rpc, config = {}) {
  const maybeAccount = await fetchMaybeProgramDataAccountFromSeeds(rpc, config);
  assertAccountExists(maybeAccount);
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
var DEPHY_ID_ERROR__SIGNATURE_MISMATCH = 12;
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
    [DEPHY_ID_ERROR__SERIALIZATION_ERROR]: `Error serializing an account`,
    [DEPHY_ID_ERROR__SIGNATURE_MISMATCH]: `Signature mismatch`
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
  if (containsBytes(data, getKeyEncoder().encode(1 /* ProgramDataAccount */), 0)) {
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
  if (containsBytes(data, getU8Encoder().encode(0), 0)) {
    return 0 /* Initialize */;
  }
  if (containsBytes(data, getU8Encoder().encode(1), 0)) {
    return 1 /* CreateProduct */;
  }
  if (containsBytes(data, getU8Encoder().encode(2), 0)) {
    return 2 /* CreateDevice */;
  }
  if (containsBytes(data, getU8Encoder().encode(3), 0)) {
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
        role: AccountRole.READONLY
      });
    }
    const writableRole = account.isWritable ? AccountRole.WRITABLE : AccountRole.READONLY;
    return Object.freeze({
      address: expectAddress(account.value),
      role: isTransactionSigner(account.value) ? upgradeRoleToSigner(writableRole) : writableRole,
      ...isTransactionSigner(account.value) ? { signer: account.value } : {}
    });
  };
}
function isTransactionSigner(value) {
  return !!value && typeof value === "object" && "address" in value && isTransactionSigner$1(value);
}

// src/generated/instructions/activateDevice.ts
function getActivateDeviceInstructionDataEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["signature", getDeviceActivationSignatureEncoder()],
      ["timestamp", getU64Encoder()]
    ]),
    (value) => ({ ...value, discriminator: 3 })
  );
}
function getActivateDeviceInstructionDataDecoder() {
  return getStructDecoder([
    ["discriminator", getU8Decoder()],
    ["signature", getDeviceActivationSignatureDecoder()],
    ["timestamp", getU64Decoder()]
  ]);
}
function getActivateDeviceInstructionDataCodec() {
  return combineCodec(
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
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["name", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ["uri", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      [
        "additionalMetadata",
        getArrayEncoder(
          getTupleEncoder([
            addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder()),
            addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())
          ])
        )
      ],
      ["signingAlg", getDeviceSigningAlgorithmEncoder()]
    ]),
    (value) => ({ ...value, discriminator: 2 })
  );
}
function getCreateDeviceInstructionDataDecoder() {
  return getStructDecoder([
    ["discriminator", getU8Decoder()],
    ["name", addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ["uri", addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    [
      "additionalMetadata",
      getArrayDecoder(
        getTupleDecoder([
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder()),
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())
        ])
      )
    ],
    ["signingAlg", getDeviceSigningAlgorithmDecoder()]
  ]);
}
function getCreateDeviceInstructionDataCodec() {
  return combineCodec(
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
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["name", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ["symbol", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ["uri", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      [
        "additionalMetadata",
        getArrayEncoder(
          getTupleEncoder([
            addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder()),
            addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())
          ])
        )
      ]
    ]),
    (value) => ({ ...value, discriminator: 1 })
  );
}
function getCreateProductInstructionDataDecoder() {
  return getStructDecoder([
    ["discriminator", getU8Decoder()],
    ["name", addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ["symbol", addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ["uri", addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    [
      "additionalMetadata",
      getArrayDecoder(
        getTupleDecoder([
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder()),
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())
        ])
      )
    ]
  ]);
}
function getCreateProductInstructionDataCodec() {
  return combineCodec(
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
function getInitializeInstructionDataEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["bump", getU8Encoder()]
    ]),
    (value) => ({ ...value, discriminator: 0 })
  );
}
function getInitializeInstructionDataDecoder() {
  return getStructDecoder([
    ["discriminator", getU8Decoder()],
    ["bump", getU8Decoder()]
  ]);
}
function getInitializeInstructionDataCodec() {
  return combineCodec(
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

export { DEPHY_ID_ERROR__ACCOUNT_MISMATCH, DEPHY_ID_ERROR__DESERIALIZATION_ERROR, DEPHY_ID_ERROR__EXPECTED_EMPTY_ACCOUNT, DEPHY_ID_ERROR__EXPECTED_NON_EMPTY_ACCOUNT, DEPHY_ID_ERROR__EXPECTED_SIGNER_ACCOUNT, DEPHY_ID_ERROR__EXPECTED_WRITABLE_ACCOUNT, DEPHY_ID_ERROR__INVALID_ACCOUNT_KEY, DEPHY_ID_ERROR__INVALID_PDA, DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER, DEPHY_ID_ERROR__MISSING_INSTRUCTION, DEPHY_ID_ERROR__NUMERICAL_OVERFLOW, DEPHY_ID_ERROR__SERIALIZATION_ERROR, DEPHY_ID_ERROR__SIGNATURE_MISMATCH, DEPHY_ID_PROGRAM_ADDRESS, DephyIdAccount, DephyIdInstruction, DeviceSigningAlgorithm, Key, decodeProgramDataAccount, deviceActivationSignature, fetchAllMaybeProgramDataAccount, fetchAllProgramDataAccount, fetchMaybeProgramDataAccount, fetchMaybeProgramDataAccountFromSeeds, fetchProgramDataAccount, fetchProgramDataAccountFromSeeds, findDeviceMintPda, findProductMintPda, findProgramDataAccountPda, getActivateDeviceInstruction, getActivateDeviceInstructionDataCodec, getActivateDeviceInstructionDataDecoder, getActivateDeviceInstructionDataEncoder, getCreateDeviceInstruction, getCreateDeviceInstructionDataCodec, getCreateDeviceInstructionDataDecoder, getCreateDeviceInstructionDataEncoder, getCreateProductInstruction, getCreateProductInstructionDataCodec, getCreateProductInstructionDataDecoder, getCreateProductInstructionDataEncoder, getDephyIdErrorMessage, getDeviceActivationSignatureCodec, getDeviceActivationSignatureDecoder, getDeviceActivationSignatureEncoder, getDeviceSigningAlgorithmCodec, getDeviceSigningAlgorithmDecoder, getDeviceSigningAlgorithmEncoder, getInitializeInstruction, getInitializeInstructionDataCodec, getInitializeInstructionDataDecoder, getInitializeInstructionDataEncoder, getKeyCodec, getKeyDecoder, getKeyEncoder, getProgramDataAccountCodec, getProgramDataAccountDecoder, getProgramDataAccountEncoder, getProgramDataAccountSize, getProgramDataCodec, getProgramDataDecoder, getProgramDataEncoder, identifyDephyIdAccount, identifyDephyIdInstruction, isDeviceActivationSignature, parseActivateDeviceInstruction, parseCreateDeviceInstruction, parseCreateProductInstruction, parseInitializeInstruction };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map