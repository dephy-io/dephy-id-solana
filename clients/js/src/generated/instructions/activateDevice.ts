/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  getStructDecoder,
  getStructEncoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
} from '@solana/codecs';
import {
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlySignerAccount,
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type ActivateDeviceInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTokenProgram2022 extends string | IAccountMeta<string> = string,
  TAccountAtokenProgram extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountDevice extends string | IAccountMeta<string> = string,
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
      TAccountAtokenProgram extends string
        ? ReadonlyAccount<TAccountAtokenProgram>
        : TAccountAtokenProgram,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountDevice extends string
        ? ReadonlySignerAccount<TAccountDevice> &
            IAccountSignerMeta<TAccountDevice>
        : TAccountDevice,
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

export type ActivateDeviceInstructionData = {
  discriminator: number;
  bump: number;
};

export type ActivateDeviceInstructionDataArgs = { bump: number };

export function getActivateDeviceInstructionDataEncoder(): Encoder<ActivateDeviceInstructionDataArgs> {
  return mapEncoder(
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
  TAccountAtokenProgram extends string = string,
  TAccountPayer extends string = string,
  TAccountDevice extends string = string,
  TAccountUser extends string = string,
  TAccountDidMint extends string = string,
  TAccountDidAtoken extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The SPL Token 2022 program */
  tokenProgram2022: Address<TAccountTokenProgram2022>;
  /** The associated token program */
  atokenProgram: Address<TAccountAtokenProgram>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The Device */
  device: TransactionSigner<TAccountDevice>;
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
  TAccountAtokenProgram extends string,
  TAccountPayer extends string,
  TAccountDevice extends string,
  TAccountUser extends string,
  TAccountDidMint extends string,
  TAccountDidAtoken extends string,
>(
  input: ActivateDeviceInput<
    TAccountSystemProgram,
    TAccountTokenProgram2022,
    TAccountAtokenProgram,
    TAccountPayer,
    TAccountDevice,
    TAccountUser,
    TAccountDidMint,
    TAccountDidAtoken
  >
): ActivateDeviceInstruction<
  typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram,
  TAccountTokenProgram2022,
  TAccountAtokenProgram,
  TAccountPayer,
  TAccountDevice,
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
    atokenProgram: { value: input.atokenProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    device: { value: input.device ?? null, isWritable: false },
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
      getAccountMeta(accounts.tokenProgram2022),
      getAccountMeta(accounts.atokenProgram),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.device),
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
    TAccountAtokenProgram,
    TAccountPayer,
    TAccountDevice,
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
    atokenProgram: TAccountMetas[2];
    /** The account paying for the storage fees */
    payer: TAccountMetas[3];
    /** The Device */
    device: TAccountMetas[4];
    /** The Device Owner pubkey */
    user: TAccountMetas[5];
    /** The NFT mint account */
    didMint: TAccountMetas[6];
    /** The NFT atoken account */
    didAtoken: TAccountMetas[7];
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
  if (instruction.accounts.length < 8) {
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
      device: getNextAccount(),
      user: getNextAccount(),
      didMint: getNextAccount(),
      didAtoken: getNextAccount(),
    },
    data: getActivateDeviceInstructionDataDecoder().decode(instruction.data),
  };
}
