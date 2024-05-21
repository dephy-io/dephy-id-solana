/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
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
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getU8Decoder,
  getU8Encoder,
  transformEncoder,
} from '@solana/web3.js';
import { KWIL_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type PublishInstruction<
  TProgram extends string = typeof KWIL_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountDephyProgram extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountPublisher extends string | IAccountMeta<string> = string,
  TAccountVendor extends string | IAccountMeta<string> = string,
  TAccountVendorMint extends string | IAccountMeta<string> = string,
  TAccountVendorAtoken extends string | IAccountMeta<string> = string,
  TAccountDevice extends string | IAccountMeta<string> = string,
  TAccountProductMint extends string | IAccountMeta<string> = string,
  TAccountProductAtoken extends string | IAccountMeta<string> = string,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountDidMint extends string | IAccountMeta<string> = string,
  TAccountDidAtoken extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountDephyProgram extends string
        ? ReadonlyAccount<TAccountDephyProgram>
        : TAccountDephyProgram,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountOwner extends string
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountPublisher extends string
        ? WritableAccount<TAccountPublisher>
        : TAccountPublisher,
      TAccountVendor extends string
        ? ReadonlyAccount<TAccountVendor>
        : TAccountVendor,
      TAccountVendorMint extends string
        ? ReadonlyAccount<TAccountVendorMint>
        : TAccountVendorMint,
      TAccountVendorAtoken extends string
        ? ReadonlyAccount<TAccountVendorAtoken>
        : TAccountVendorAtoken,
      TAccountDevice extends string
        ? ReadonlyAccount<TAccountDevice>
        : TAccountDevice,
      TAccountProductMint extends string
        ? ReadonlyAccount<TAccountProductMint>
        : TAccountProductMint,
      TAccountProductAtoken extends string
        ? ReadonlyAccount<TAccountProductAtoken>
        : TAccountProductAtoken,
      TAccountUser extends string
        ? ReadonlyAccount<TAccountUser>
        : TAccountUser,
      TAccountDidMint extends string
        ? ReadonlyAccount<TAccountDidMint>
        : TAccountDidMint,
      TAccountDidAtoken extends string
        ? ReadonlyAccount<TAccountDidAtoken>
        : TAccountDidAtoken,
      ...TRemainingAccounts,
    ]
  >;

export type PublishInstructionData = {
  discriminator: number;
  bump: number;
  ethAddress: Array<number>;
};

export type PublishInstructionDataArgs = {
  bump: number;
  ethAddress: Array<number>;
};

export function getPublishInstructionDataEncoder(): Encoder<PublishInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['bump', getU8Encoder()],
      ['ethAddress', getArrayEncoder(getU8Encoder(), { size: 20 })],
    ]),
    (value) => ({ ...value, discriminator: 0 })
  );
}

export function getPublishInstructionDataDecoder(): Decoder<PublishInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['bump', getU8Decoder()],
    ['ethAddress', getArrayDecoder(getU8Decoder(), { size: 20 })],
  ]);
}

export function getPublishInstructionDataCodec(): Codec<
  PublishInstructionDataArgs,
  PublishInstructionData
> {
  return combineCodec(
    getPublishInstructionDataEncoder(),
    getPublishInstructionDataDecoder()
  );
}

export type PublishInput<
  TAccountSystemProgram extends string = string,
  TAccountDephyProgram extends string = string,
  TAccountPayer extends string = string,
  TAccountOwner extends string = string,
  TAccountPublisher extends string = string,
  TAccountVendor extends string = string,
  TAccountVendorMint extends string = string,
  TAccountVendorAtoken extends string = string,
  TAccountDevice extends string = string,
  TAccountProductMint extends string = string,
  TAccountProductAtoken extends string = string,
  TAccountUser extends string = string,
  TAccountDidMint extends string = string,
  TAccountDidAtoken extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The DePHY program */
  dephyProgram: Address<TAccountDephyProgram>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The DID owner */
  owner: TransactionSigner<TAccountOwner>;
  /** The Publisher account */
  publisher: Address<TAccountPublisher>;
  /** Vendor of the Device */
  vendor: Address<TAccountVendor>;
  /** Vendor Mint */
  vendorMint: Address<TAccountVendorMint>;
  /** Vendor AToken */
  vendorAtoken: Address<TAccountVendorAtoken>;
  /** The Device pubkey */
  device: Address<TAccountDevice>;
  /** Product of the Device */
  productMint: Address<TAccountProductMint>;
  /** The Product atoken for Device */
  productAtoken: Address<TAccountProductAtoken>;
  /** The Device Owner pubkey */
  user: Address<TAccountUser>;
  /** The NFT mint account */
  didMint: Address<TAccountDidMint>;
  /** The NFT atoken account */
  didAtoken: Address<TAccountDidAtoken>;
  bump: PublishInstructionDataArgs['bump'];
  ethAddress: PublishInstructionDataArgs['ethAddress'];
};

export function getPublishInstruction<
  TAccountSystemProgram extends string,
  TAccountDephyProgram extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountPublisher extends string,
  TAccountVendor extends string,
  TAccountVendorMint extends string,
  TAccountVendorAtoken extends string,
  TAccountDevice extends string,
  TAccountProductMint extends string,
  TAccountProductAtoken extends string,
  TAccountUser extends string,
  TAccountDidMint extends string,
  TAccountDidAtoken extends string,
>(
  input: PublishInput<
    TAccountSystemProgram,
    TAccountDephyProgram,
    TAccountPayer,
    TAccountOwner,
    TAccountPublisher,
    TAccountVendor,
    TAccountVendorMint,
    TAccountVendorAtoken,
    TAccountDevice,
    TAccountProductMint,
    TAccountProductAtoken,
    TAccountUser,
    TAccountDidMint,
    TAccountDidAtoken
  >
): PublishInstruction<
  typeof KWIL_PROGRAM_ADDRESS,
  TAccountSystemProgram,
  TAccountDephyProgram,
  TAccountPayer,
  TAccountOwner,
  TAccountPublisher,
  TAccountVendor,
  TAccountVendorMint,
  TAccountVendorAtoken,
  TAccountDevice,
  TAccountProductMint,
  TAccountProductAtoken,
  TAccountUser,
  TAccountDidMint,
  TAccountDidAtoken
> {
  // Program address.
  const programAddress = KWIL_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    dephyProgram: { value: input.dephyProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    publisher: { value: input.publisher ?? null, isWritable: true },
    vendor: { value: input.vendor ?? null, isWritable: false },
    vendorMint: { value: input.vendorMint ?? null, isWritable: false },
    vendorAtoken: { value: input.vendorAtoken ?? null, isWritable: false },
    device: { value: input.device ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: false },
    productAtoken: { value: input.productAtoken ?? null, isWritable: false },
    user: { value: input.user ?? null, isWritable: false },
    didMint: { value: input.didMint ?? null, isWritable: false },
    didAtoken: { value: input.didAtoken ?? null, isWritable: false },
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
      getAccountMeta(accounts.dephyProgram),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.publisher),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.vendorMint),
      getAccountMeta(accounts.vendorAtoken),
      getAccountMeta(accounts.device),
      getAccountMeta(accounts.productMint),
      getAccountMeta(accounts.productAtoken),
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.didMint),
      getAccountMeta(accounts.didAtoken),
    ],
    programAddress,
    data: getPublishInstructionDataEncoder().encode(
      args as PublishInstructionDataArgs
    ),
  } as PublishInstruction<
    typeof KWIL_PROGRAM_ADDRESS,
    TAccountSystemProgram,
    TAccountDephyProgram,
    TAccountPayer,
    TAccountOwner,
    TAccountPublisher,
    TAccountVendor,
    TAccountVendorMint,
    TAccountVendorAtoken,
    TAccountDevice,
    TAccountProductMint,
    TAccountProductAtoken,
    TAccountUser,
    TAccountDidMint,
    TAccountDidAtoken
  >;

  return instruction;
}

export type ParsedPublishInstruction<
  TProgram extends string = typeof KWIL_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The system program */
    systemProgram: TAccountMetas[0];
    /** The DePHY program */
    dephyProgram: TAccountMetas[1];
    /** The account paying for the storage fees */
    payer: TAccountMetas[2];
    /** The DID owner */
    owner: TAccountMetas[3];
    /** The Publisher account */
    publisher: TAccountMetas[4];
    /** Vendor of the Device */
    vendor: TAccountMetas[5];
    /** Vendor Mint */
    vendorMint: TAccountMetas[6];
    /** Vendor AToken */
    vendorAtoken: TAccountMetas[7];
    /** The Device pubkey */
    device: TAccountMetas[8];
    /** Product of the Device */
    productMint: TAccountMetas[9];
    /** The Product atoken for Device */
    productAtoken: TAccountMetas[10];
    /** The Device Owner pubkey */
    user: TAccountMetas[11];
    /** The NFT mint account */
    didMint: TAccountMetas[12];
    /** The NFT atoken account */
    didAtoken: TAccountMetas[13];
  };
  data: PublishInstructionData;
};

export function parsePublishInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedPublishInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 14) {
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
      dephyProgram: getNextAccount(),
      payer: getNextAccount(),
      owner: getNextAccount(),
      publisher: getNextAccount(),
      vendor: getNextAccount(),
      vendorMint: getNextAccount(),
      vendorAtoken: getNextAccount(),
      device: getNextAccount(),
      productMint: getNextAccount(),
      productAtoken: getNextAccount(),
      user: getNextAccount(),
      didMint: getNextAccount(),
      didAtoken: getNextAccount(),
    },
    data: getPublishInstructionDataDecoder().decode(instruction.data),
  };
}
