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
  combineCodec,
  getStructDecoder,
  getStructEncoder,
  getU8Decoder,
  getU8Encoder,
  transformEncoder,
} from '@solana/web3.js';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type ActivateDeviceInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTokenProgram2022 extends string | IAccountMeta<string> = string,
  TAccountAtaProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountDevice extends string | IAccountMeta<string> = string,
  TAccountVendor extends string | IAccountMeta<string> = string,
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
      TAccountTokenProgram2022 extends string
        ? ReadonlyAccount<TAccountTokenProgram2022>
        : TAccountTokenProgram2022,
      TAccountAtaProgram extends string
        ? ReadonlyAccount<TAccountAtaProgram>
        : TAccountAtaProgram,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountDevice extends string
        ? ReadonlySignerAccount<TAccountDevice> &
            IAccountSignerMeta<TAccountDevice>
        : TAccountDevice,
      TAccountVendor extends string
        ? ReadonlyAccount<TAccountVendor>
        : TAccountVendor,
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
        ? WritableAccount<TAccountDidMint>
        : TAccountDidMint,
      TAccountDidAtoken extends string
        ? WritableAccount<TAccountDidAtoken>
        : TAccountDidAtoken,
      ...TRemainingAccounts,
    ]
  >;

export type ActivateDeviceInstructionData = {
  discriminator: number;
  bump: number;
};

export type ActivateDeviceInstructionDataArgs = { bump: number };

export function getActivateDeviceInstructionDataEncoder(): Encoder<ActivateDeviceInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['bump', getU8Encoder()],
    ]),
    (value) => ({ ...value, discriminator: 4 })
  );
}

export function getActivateDeviceInstructionDataDecoder(): Decoder<ActivateDeviceInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['bump', getU8Decoder()],
  ]);
}

export function getActivateDeviceInstructionDataCodec(): Codec<
  ActivateDeviceInstructionDataArgs,
  ActivateDeviceInstructionData
> {
  return combineCodec(
    getActivateDeviceInstructionDataEncoder(),
    getActivateDeviceInstructionDataDecoder()
  );
}

export type ActivateDeviceInput<
  TAccountSystemProgram extends string = string,
  TAccountTokenProgram2022 extends string = string,
  TAccountAtaProgram extends string = string,
  TAccountPayer extends string = string,
  TAccountDevice extends string = string,
  TAccountVendor extends string = string,
  TAccountProductMint extends string = string,
  TAccountProductAtoken extends string = string,
  TAccountUser extends string = string,
  TAccountDidMint extends string = string,
  TAccountDidAtoken extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The SPL Token 2022 program */
  tokenProgram2022: Address<TAccountTokenProgram2022>;
  /** The associated token program */
  ataProgram?: Address<TAccountAtaProgram>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The Device pubkey */
  device: TransactionSigner<TAccountDevice>;
  /** Vendor of the Device */
  vendor: Address<TAccountVendor>;
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
  bump: ActivateDeviceInstructionDataArgs['bump'];
};

export function getActivateDeviceInstruction<
  TAccountSystemProgram extends string,
  TAccountTokenProgram2022 extends string,
  TAccountAtaProgram extends string,
  TAccountPayer extends string,
  TAccountDevice extends string,
  TAccountVendor extends string,
  TAccountProductMint extends string,
  TAccountProductAtoken extends string,
  TAccountUser extends string,
  TAccountDidMint extends string,
  TAccountDidAtoken extends string,
>(
  input: ActivateDeviceInput<
    TAccountSystemProgram,
    TAccountTokenProgram2022,
    TAccountAtaProgram,
    TAccountPayer,
    TAccountDevice,
    TAccountVendor,
    TAccountProductMint,
    TAccountProductAtoken,
    TAccountUser,
    TAccountDidMint,
    TAccountDidAtoken
  >
): ActivateDeviceInstruction<
  typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram,
  TAccountTokenProgram2022,
  TAccountAtaProgram,
  TAccountPayer,
  TAccountDevice,
  TAccountVendor,
  TAccountProductMint,
  TAccountProductAtoken,
  TAccountUser,
  TAccountDidMint,
  TAccountDidAtoken
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
    ataProgram: { value: input.ataProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    device: { value: input.device ?? null, isWritable: false },
    vendor: { value: input.vendor ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: false },
    productAtoken: { value: input.productAtoken ?? null, isWritable: false },
    user: { value: input.user ?? null, isWritable: false },
    didMint: { value: input.didMint ?? null, isWritable: true },
    didAtoken: { value: input.didAtoken ?? null, isWritable: true },
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
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.tokenProgram2022),
      getAccountMeta(accounts.ataProgram),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.device),
      getAccountMeta(accounts.vendor),
      getAccountMeta(accounts.productMint),
      getAccountMeta(accounts.productAtoken),
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.didMint),
      getAccountMeta(accounts.didAtoken),
    ],
    programAddress,
    data: getActivateDeviceInstructionDataEncoder().encode(
      args as ActivateDeviceInstructionDataArgs
    ),
  } as ActivateDeviceInstruction<
    typeof DEPHY_ID_PROGRAM_ADDRESS,
    TAccountSystemProgram,
    TAccountTokenProgram2022,
    TAccountAtaProgram,
    TAccountPayer,
    TAccountDevice,
    TAccountVendor,
    TAccountProductMint,
    TAccountProductAtoken,
    TAccountUser,
    TAccountDidMint,
    TAccountDidAtoken
  >;

  return instruction;
}

export type ParsedActivateDeviceInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The system program */
    systemProgram: TAccountMetas[0];
    /** The SPL Token 2022 program */
    tokenProgram2022: TAccountMetas[1];
    /** The associated token program */
    ataProgram: TAccountMetas[2];
    /** The account paying for the storage fees */
    payer: TAccountMetas[3];
    /** The Device pubkey */
    device: TAccountMetas[4];
    /** Vendor of the Device */
    vendor: TAccountMetas[5];
    /** Product of the Device */
    productMint: TAccountMetas[6];
    /** The Product atoken for Device */
    productAtoken: TAccountMetas[7];
    /** The Device Owner pubkey */
    user: TAccountMetas[8];
    /** The NFT mint account */
    didMint: TAccountMetas[9];
    /** The NFT atoken account */
    didAtoken: TAccountMetas[10];
  };
  data: ActivateDeviceInstructionData;
};

export function parseActivateDeviceInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedActivateDeviceInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 11) {
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
      ataProgram: getNextAccount(),
      payer: getNextAccount(),
      device: getNextAccount(),
      vendor: getNextAccount(),
      productMint: getNextAccount(),
      productAtoken: getNextAccount(),
      user: getNextAccount(),
      didMint: getNextAccount(),
      didAtoken: getNextAccount(),
    },
    data: getActivateDeviceInstructionDataDecoder().decode(instruction.data),
  };
}
