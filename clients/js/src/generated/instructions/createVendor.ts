/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Address,
  Codec,
  Decoder,
  Encoder,
  IAccountMeta,
  IAccountSignerMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlySignerAccount,
  TransactionSigner,
  WritableAccount,
  WritableSignerAccount,
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getTupleDecoder,
  getTupleEncoder,
  getU32Decoder,
  getU32Encoder,
  getU8Decoder,
  getU8Encoder,
  getUtf8Decoder,
  getUtf8Encoder,
  transformEncoder,
} from '@solana/web3.js';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type CreateVendorInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTokenProgram2022 extends string | IAccountMeta<string> = string,
  TAccountAtokenProgram extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountAuthority extends string | IAccountMeta<string> = string,
  TAccountDephy extends string | IAccountMeta<string> = string,
  TAccountVendor extends string | IAccountMeta<string> = string,
  TAccountVendorMint extends string | IAccountMeta<string> = string,
  TAccountVendorAtoken extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountTokenProgram2022 extends string
        ? ReadonlyAccount<TAccountTokenProgram2022>
        : TAccountTokenProgram2022,
      TAccountAtokenProgram extends string
        ? ReadonlyAccount<TAccountAtokenProgram>
        : TAccountAtokenProgram,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountAuthority extends string
        ? ReadonlySignerAccount<TAccountAuthority> &
            IAccountSignerMeta<TAccountAuthority>
        : TAccountAuthority,
      TAccountDephy extends string
        ? ReadonlyAccount<TAccountDephy>
        : TAccountDephy,
      TAccountVendor extends string
        ? ReadonlyAccount<TAccountVendor>
        : TAccountVendor,
      TAccountVendorMint extends string
        ? WritableAccount<TAccountVendorMint>
        : TAccountVendorMint,
      TAccountVendorAtoken extends string
        ? WritableAccount<TAccountVendorAtoken>
        : TAccountVendorAtoken,
      ...TRemainingAccounts,
    ]
  >;

export type CreateVendorInstructionData = {
  discriminator: number;
  bump: number;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: Array<readonly [string, string]>;
};

export type CreateVendorInstructionDataArgs = {
  bump: number;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: Array<readonly [string, string]>;
};

export function getCreateVendorInstructionDataEncoder(): Encoder<CreateVendorInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['bump', getU8Encoder()],
      ['name', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ['symbol', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ['uri', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      [
        'additionalMetadata',
        getArrayEncoder(
          getTupleEncoder([
            addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder()),
            addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder()),
          ])
        ),
      ],
    ]),
    (value) => ({ ...value, discriminator: 1 })
  );
}

export function getCreateVendorInstructionDataDecoder(): Decoder<CreateVendorInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['bump', getU8Decoder()],
    ['name', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['symbol', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['uri', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    [
      'additionalMetadata',
      getArrayDecoder(
        getTupleDecoder([
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder()),
          addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder()),
        ])
      ),
    ],
  ]);
}

export function getCreateVendorInstructionDataCodec(): Codec<
  CreateVendorInstructionDataArgs,
  CreateVendorInstructionData
> {
  return combineCodec(
    getCreateVendorInstructionDataEncoder(),
    getCreateVendorInstructionDataDecoder()
  );
}

export type CreateVendorInput<
  TAccountSystemProgram extends string = string,
  TAccountTokenProgram2022 extends string = string,
  TAccountAtokenProgram extends string = string,
  TAccountPayer extends string = string,
  TAccountAuthority extends string = string,
  TAccountDephy extends string = string,
  TAccountVendor extends string = string,
  TAccountVendorMint extends string = string,
  TAccountVendorAtoken extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The token 2022 program */
  tokenProgram2022: Address<TAccountTokenProgram2022>;
  /** The associated token program */
  atokenProgram: Address<TAccountAtokenProgram>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The DePHY authority */
  authority: TransactionSigner<TAccountAuthority>;
  /** The DePHY account */
  dephy: Address<TAccountDephy>;
  /** Vendor account */
  vendor: Address<TAccountVendor>;
  /** The Vendor mint */
  vendorMint: Address<TAccountVendorMint>;
  /** The atoken account for vendor */
  vendorAtoken: Address<TAccountVendorAtoken>;
  bump: CreateVendorInstructionDataArgs['bump'];
  name: CreateVendorInstructionDataArgs['name'];
  symbol: CreateVendorInstructionDataArgs['symbol'];
  uri: CreateVendorInstructionDataArgs['uri'];
  additionalMetadata: CreateVendorInstructionDataArgs['additionalMetadata'];
};

export function getCreateVendorInstruction<
  TAccountSystemProgram extends string,
  TAccountTokenProgram2022 extends string,
  TAccountAtokenProgram extends string,
  TAccountPayer extends string,
  TAccountAuthority extends string,
  TAccountDephy extends string,
  TAccountVendor extends string,
  TAccountVendorMint extends string,
  TAccountVendorAtoken extends string,
>(
  input: CreateVendorInput<
    TAccountSystemProgram,
    TAccountTokenProgram2022,
    TAccountAtokenProgram,
    TAccountPayer,
    TAccountAuthority,
    TAccountDephy,
    TAccountVendor,
    TAccountVendorMint,
    TAccountVendorAtoken
  >
): CreateVendorInstruction<
  typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram,
  TAccountTokenProgram2022,
  TAccountAtokenProgram,
  TAccountPayer,
  TAccountAuthority,
  TAccountDephy,
  TAccountVendor,
  TAccountVendorMint,
  TAccountVendorAtoken
> {
  // Program address.
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    tokenProgram2022: {
      value: input.tokenProgram2022 ?? null,
      isWritable: false,
    },
    atokenProgram: { value: input.atokenProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    authority: { value: input.authority ?? null, isWritable: false },
    dephy: { value: input.dephy ?? null, isWritable: false },
    vendor: { value: input.vendor ?? null, isWritable: false },
    vendorMint: { value: input.vendorMint ?? null, isWritable: true },
    vendorAtoken: { value: input.vendorAtoken ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.tokenProgram2022),
      getAccountMeta(accounts.atokenProgram),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.authority),
      getAccountMeta(accounts.dephy),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.vendorMint),
      getAccountMeta(accounts.vendorAtoken),
    ],
    programAddress,
    data: getCreateVendorInstructionDataEncoder().encode(
      args as CreateVendorInstructionDataArgs
    ),
  } as CreateVendorInstruction<
    typeof DEPHY_ID_PROGRAM_ADDRESS,
    TAccountSystemProgram,
    TAccountTokenProgram2022,
    TAccountAtokenProgram,
    TAccountPayer,
    TAccountAuthority,
    TAccountDephy,
    TAccountVendor,
    TAccountVendorMint,
    TAccountVendorAtoken
  >;

  return instruction;
}

export type ParsedCreateVendorInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The system program */
    systemProgram: TAccountMetas[0];
    /** The token 2022 program */
    tokenProgram2022: TAccountMetas[1];
    /** The associated token program */
    atokenProgram: TAccountMetas[2];
    /** The account paying for the storage fees */
    payer: TAccountMetas[3];
    /** The DePHY authority */
    authority: TAccountMetas[4];
    /** The DePHY account */
    dephy: TAccountMetas[5];
    /** Vendor account */
    vendor: TAccountMetas[6];
    /** The Vendor mint */
    vendorMint: TAccountMetas[7];
    /** The atoken account for vendor */
    vendorAtoken: TAccountMetas[8];
  };
  data: CreateVendorInstructionData;
};

export function parseCreateVendorInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCreateVendorInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 9) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      systemProgram: getNextAccount(),
      tokenProgram2022: getNextAccount(),
      atokenProgram: getNextAccount(),
      payer: getNextAccount(),
      authority: getNextAccount(),
      dephy: getNextAccount(),
      vendor: getNextAccount(),
      vendorMint: getNextAccount(),
      vendorAtoken: getNextAccount(),
    },
    data: getCreateVendorInstructionDataDecoder().decode(instruction.data),
  };
}
