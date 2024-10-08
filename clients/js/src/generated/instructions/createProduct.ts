/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
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
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';

export const CREATE_PRODUCT_DISCRIMINATOR = 1;

export function getCreateProductDiscriminatorBytes() {
  return getU8Encoder().encode(CREATE_PRODUCT_DISCRIMINATOR);
}

export type CreateProductInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountToken2022Program extends
    | string
    | IAccountMeta<string> = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountVendor extends string | IAccountMeta<string> = string,
  TAccountProductMint extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountToken2022Program extends string
        ? ReadonlyAccount<TAccountToken2022Program>
        : TAccountToken2022Program,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountVendor extends string
        ? ReadonlySignerAccount<TAccountVendor> &
            IAccountSignerMeta<TAccountVendor>
        : TAccountVendor,
      TAccountProductMint extends string
        ? WritableAccount<TAccountProductMint>
        : TAccountProductMint,
      ...TRemainingAccounts,
    ]
  >;

export type CreateProductInstructionData = {
  discriminator: number;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: Array<readonly [string, string]>;
};

export type CreateProductInstructionDataArgs = {
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: Array<readonly [string, string]>;
};

export function getCreateProductInstructionDataEncoder(): Encoder<CreateProductInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
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
    (value) => ({ ...value, discriminator: CREATE_PRODUCT_DISCRIMINATOR })
  );
}

export function getCreateProductInstructionDataDecoder(): Decoder<CreateProductInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
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

export function getCreateProductInstructionDataCodec(): Codec<
  CreateProductInstructionDataArgs,
  CreateProductInstructionData
> {
  return combineCodec(
    getCreateProductInstructionDataEncoder(),
    getCreateProductInstructionDataDecoder()
  );
}

export type CreateProductInput<
  TAccountSystemProgram extends string = string,
  TAccountToken2022Program extends string = string,
  TAccountPayer extends string = string,
  TAccountVendor extends string = string,
  TAccountProductMint extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The SPL Token 2022 program */
  token2022Program?: Address<TAccountToken2022Program>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The vendor */
  vendor: TransactionSigner<TAccountVendor>;
  /** The mint account of the product */
  productMint: Address<TAccountProductMint>;
  name: CreateProductInstructionDataArgs['name'];
  symbol: CreateProductInstructionDataArgs['symbol'];
  uri: CreateProductInstructionDataArgs['uri'];
  additionalMetadata: CreateProductInstructionDataArgs['additionalMetadata'];
};

export function getCreateProductInstruction<
  TAccountSystemProgram extends string,
  TAccountToken2022Program extends string,
  TAccountPayer extends string,
  TAccountVendor extends string,
  TAccountProductMint extends string,
  TProgramAddress extends Address = typeof DEPHY_ID_PROGRAM_ADDRESS,
>(
  input: CreateProductInput<
    TAccountSystemProgram,
    TAccountToken2022Program,
    TAccountPayer,
    TAccountVendor,
    TAccountProductMint
  >,
  config?: { programAddress?: TProgramAddress }
): CreateProductInstruction<
  TProgramAddress,
  TAccountSystemProgram,
  TAccountToken2022Program,
  TAccountPayer,
  TAccountVendor,
  TAccountProductMint
> {
  // Program address.
  const programAddress = config?.programAddress ?? DEPHY_ID_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    token2022Program: {
      value: input.token2022Program ?? null,
      isWritable: false,
    },
    payer: { value: input.payer ?? null, isWritable: true },
    vendor: { value: input.vendor ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: true },
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
  if (!accounts.token2022Program.value) {
    accounts.token2022Program.value =
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.token2022Program),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.productMint),
    ],
    programAddress,
    data: getCreateProductInstructionDataEncoder().encode(
      args as CreateProductInstructionDataArgs
    ),
  } as CreateProductInstruction<
    TProgramAddress,
    TAccountSystemProgram,
    TAccountToken2022Program,
    TAccountPayer,
    TAccountVendor,
    TAccountProductMint
  >;

  return instruction;
}

export type ParsedCreateProductInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The system program */
    systemProgram: TAccountMetas[0];
    /** The SPL Token 2022 program */
    token2022Program: TAccountMetas[1];
    /** The account paying for the storage fees */
    payer: TAccountMetas[2];
    /** The vendor */
    vendor: TAccountMetas[3];
    /** The mint account of the product */
    productMint: TAccountMetas[4];
  };
  data: CreateProductInstructionData;
};

export function parseCreateProductInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCreateProductInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 5) {
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
      token2022Program: getNextAccount(),
      payer: getNextAccount(),
      vendor: getNextAccount(),
      productMint: getNextAccount(),
    },
    data: getCreateProductInstructionDataDecoder().decode(instruction.data),
  };
}
