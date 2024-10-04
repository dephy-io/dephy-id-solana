import { getProgramDerivedAddress, getAddressEncoder, address, getUtf8Encoder, getStructEncoder, addEncoderSizePrefix, getU32Encoder, getArrayEncoder, getTupleEncoder, getStructDecoder, addDecoderSizePrefix, getUtf8Decoder, getU32Decoder, getArrayDecoder, getTupleDecoder, combineCodec, getDiscriminatedUnionEncoder, fixEncoderSize, getBytesEncoder, getU8Encoder, getDiscriminatedUnionDecoder, fixDecoderSize, getBytesDecoder, getU8Decoder, getEnumEncoder, getEnumDecoder, transformEncoder, getAddressDecoder, decodeAccount, assertAccountExists, fetchEncodedAccount, assertAccountsExist, fetchEncodedAccounts, containsBytes, isProgramError, getU64Encoder, getU64Decoder, AccountRole, upgradeRoleToSigner, isTransactionSigner as isTransactionSigner$1 } from '@solana/web3.js';

// src/generated/accounts/programDataAccount.ts
async function findDeviceATokenPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getAddressEncoder().encode(seeds.ownerPubkey),
      getAddressEncoder().encode(
        address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
      ),
      getAddressEncoder().encode(seeds.deviceMintPubkey)
    ]
  });
}
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
async function findProductATokenPda(seeds, config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getAddressEncoder().encode(seeds.devicePubkey),
      getAddressEncoder().encode(
        address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
      ),
      getAddressEncoder().encode(seeds.productMintPubkey)
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
async function findProgramDataPda(config = {}) {
  const {
    programAddress = "hdMghjD73uASxgJXi6e1mGPsXqnADMsrqB1bveqABP1"
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [getUtf8Encoder().encode("DePHY_ID")]
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
function getCreateActivatedDeviceArgsEncoder() {
  return getStructEncoder([
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
    ]
  ]);
}
function getCreateActivatedDeviceArgsDecoder() {
  return getStructDecoder([
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
    ]
  ]);
}
function getCreateActivatedDeviceArgsCodec() {
  return combineCodec(
    getCreateActivatedDeviceArgsEncoder(),
    getCreateActivatedDeviceArgsDecoder()
  );
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
var DeviceSigningAlgorithm = /* @__PURE__ */ ((DeviceSigningAlgorithm2) => {
  DeviceSigningAlgorithm2[DeviceSigningAlgorithm2["Ed25519"] = 0] = "Ed25519";
  DeviceSigningAlgorithm2[DeviceSigningAlgorithm2["Secp256k1"] = 1] = "Secp256k1";
  return DeviceSigningAlgorithm2;
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
var PROGRAM_DATA_ACCOUNT_KEY = 1 /* ProgramDataAccount */;
function getProgramDataAccountKeyBytes() {
  return getKeyEncoder().encode(PROGRAM_DATA_ACCOUNT_KEY);
}
function getProgramDataAccountEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["key", getKeyEncoder()],
      ["authority", getAddressEncoder()],
      ["data", getProgramDataEncoder()]
    ]),
    (value) => ({ ...value, key: PROGRAM_DATA_ACCOUNT_KEY })
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
async function fetchProgramDataAccount(rpc, address3, config) {
  const maybeAccount = await fetchMaybeProgramDataAccount(rpc, address3, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}
async function fetchMaybeProgramDataAccount(rpc, address3, config) {
  const maybeAccount = await fetchEncodedAccount(rpc, address3, config);
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
  DephyIdInstruction2[DephyIdInstruction2["CreateActivatedDevice"] = 4] = "CreateActivatedDevice";
  DephyIdInstruction2[DephyIdInstruction2["CreateActivatedDeviceNonSigner"] = 5] = "CreateActivatedDeviceNonSigner";
  return DephyIdInstruction2;
})(DephyIdInstruction || {});
function identifyDephyIdInstruction(instruction) {
  const data = "data" in instruction ? instruction.data : instruction;
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
  if (containsBytes(data, getU8Encoder().encode(4), 0)) {
    return 4 /* CreateActivatedDevice */;
  }
  if (containsBytes(data, getU8Encoder().encode(5), 0)) {
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
  return isProgramError(
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
var ACTIVATE_DEVICE_DISCRIMINATOR = 3;
function getActivateDeviceDiscriminatorBytes() {
  return getU8Encoder().encode(ACTIVATE_DEVICE_DISCRIMINATOR);
}
function getActivateDeviceInstructionDataEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["signature", getDeviceActivationSignatureEncoder()],
      ["timestamp", getU64Encoder()]
    ]),
    (value) => ({ ...value, discriminator: ACTIVATE_DEVICE_DISCRIMINATOR })
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
  return getU8Encoder().encode(CREATE_ACTIVATED_DEVICE_DISCRIMINATOR);
}
function getCreateActivatedDeviceInstructionDataEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsEncoder()]
    ]),
    (value) => ({
      ...value,
      discriminator: CREATE_ACTIVATED_DEVICE_DISCRIMINATOR
    })
  );
}
function getCreateActivatedDeviceInstructionDataDecoder() {
  return getStructDecoder([
    ["discriminator", getU8Decoder()],
    ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsDecoder()]
  ]);
}
function getCreateActivatedDeviceInstructionDataCodec() {
  return combineCodec(
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
  return getU8Encoder().encode(
    CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR
  );
}
function getCreateActivatedDeviceNonSignerInstructionDataEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsEncoder()]
    ]),
    (value) => ({
      ...value,
      discriminator: CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR
    })
  );
}
function getCreateActivatedDeviceNonSignerInstructionDataDecoder() {
  return getStructDecoder([
    ["discriminator", getU8Decoder()],
    ["createActivatedDeviceArgs", getCreateActivatedDeviceArgsDecoder()]
  ]);
}
function getCreateActivatedDeviceNonSignerInstructionDataCodec() {
  return combineCodec(
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
  return getU8Encoder().encode(CREATE_DEVICE_DISCRIMINATOR);
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
    (value) => ({ ...value, discriminator: CREATE_DEVICE_DISCRIMINATOR })
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
  return getU8Encoder().encode(CREATE_PRODUCT_DISCRIMINATOR);
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
    (value) => ({ ...value, discriminator: CREATE_PRODUCT_DISCRIMINATOR })
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
  return getU8Encoder().encode(INITIALIZE_DISCRIMINATOR);
}
function getInitializeInstructionDataEncoder() {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", getU8Encoder()],
      ["bump", getU8Encoder()]
    ]),
    (value) => ({ ...value, discriminator: INITIALIZE_DISCRIMINATOR })
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

export { ACTIVATE_DEVICE_DISCRIMINATOR, CREATE_ACTIVATED_DEVICE_DISCRIMINATOR, CREATE_ACTIVATED_DEVICE_NON_SIGNER_DISCRIMINATOR, CREATE_DEVICE_DISCRIMINATOR, CREATE_PRODUCT_DISCRIMINATOR, DEPHY_ID_ERROR__ACCOUNT_MISMATCH, DEPHY_ID_ERROR__DESERIALIZATION_ERROR, DEPHY_ID_ERROR__EXPECTED_EMPTY_ACCOUNT, DEPHY_ID_ERROR__EXPECTED_NON_EMPTY_ACCOUNT, DEPHY_ID_ERROR__EXPECTED_SIGNER_ACCOUNT, DEPHY_ID_ERROR__EXPECTED_WRITABLE_ACCOUNT, DEPHY_ID_ERROR__INVALID_ACCOUNT_KEY, DEPHY_ID_ERROR__INVALID_PDA, DEPHY_ID_ERROR__INVALID_PROGRAM_OWNER, DEPHY_ID_ERROR__MISSING_INSTRUCTION, DEPHY_ID_ERROR__NUMERICAL_OVERFLOW, DEPHY_ID_ERROR__SERIALIZATION_ERROR, DEPHY_ID_ERROR__SIGNATURE_MISMATCH, DEPHY_ID_PROGRAM_ADDRESS, DephyIdAccount, DephyIdInstruction, DeviceSigningAlgorithm, INITIALIZE_DISCRIMINATOR, Key, PROGRAM_DATA_ACCOUNT_KEY, decodeProgramDataAccount, deviceActivationSignature, fetchAllMaybeProgramDataAccount, fetchAllProgramDataAccount, fetchMaybeProgramDataAccount, fetchMaybeProgramDataAccountFromSeeds, fetchProgramDataAccount, fetchProgramDataAccountFromSeeds, findDeviceATokenPda, findDeviceMintPda, findProductATokenPda, findProductMintPda, findProgramDataAccountPda, findProgramDataPda, getActivateDeviceDiscriminatorBytes, getActivateDeviceInstruction, getActivateDeviceInstructionDataCodec, getActivateDeviceInstructionDataDecoder, getActivateDeviceInstructionDataEncoder, getCreateActivatedDeviceArgsCodec, getCreateActivatedDeviceArgsDecoder, getCreateActivatedDeviceArgsEncoder, getCreateActivatedDeviceDiscriminatorBytes, getCreateActivatedDeviceInstruction, getCreateActivatedDeviceInstructionDataCodec, getCreateActivatedDeviceInstructionDataDecoder, getCreateActivatedDeviceInstructionDataEncoder, getCreateActivatedDeviceNonSignerDiscriminatorBytes, getCreateActivatedDeviceNonSignerInstruction, getCreateActivatedDeviceNonSignerInstructionDataCodec, getCreateActivatedDeviceNonSignerInstructionDataDecoder, getCreateActivatedDeviceNonSignerInstructionDataEncoder, getCreateDeviceDiscriminatorBytes, getCreateDeviceInstruction, getCreateDeviceInstructionDataCodec, getCreateDeviceInstructionDataDecoder, getCreateDeviceInstructionDataEncoder, getCreateProductDiscriminatorBytes, getCreateProductInstruction, getCreateProductInstructionDataCodec, getCreateProductInstructionDataDecoder, getCreateProductInstructionDataEncoder, getDephyIdErrorMessage, getDeviceActivationSignatureCodec, getDeviceActivationSignatureDecoder, getDeviceActivationSignatureEncoder, getDeviceSigningAlgorithmCodec, getDeviceSigningAlgorithmDecoder, getDeviceSigningAlgorithmEncoder, getInitializeDiscriminatorBytes, getInitializeInstruction, getInitializeInstructionDataCodec, getInitializeInstructionDataDecoder, getInitializeInstructionDataEncoder, getKeyCodec, getKeyDecoder, getKeyEncoder, getProgramDataAccountCodec, getProgramDataAccountDecoder, getProgramDataAccountEncoder, getProgramDataAccountKeyBytes, getProgramDataAccountSize, getProgramDataCodec, getProgramDataDecoder, getProgramDataEncoder, identifyDephyIdAccount, identifyDephyIdInstruction, isDephyIdError, isDeviceActivationSignature, parseActivateDeviceInstruction, parseCreateActivatedDeviceInstruction, parseCreateActivatedDeviceNonSignerInstruction, parseCreateDeviceInstruction, parseCreateProductInstruction, parseInitializeInstruction };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map