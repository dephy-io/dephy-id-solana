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

export type LinkInstruction<
  TProgram extends string = typeof KWIL_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountDephyProgram extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountLinked extends string | IAccountMeta<string> = string,
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
      TAccountUser extends string
        ? ReadonlySignerAccount<TAccountUser> & IAccountSignerMeta<TAccountUser>
        : TAccountUser,
      TAccountLinked extends string
        ? WritableAccount<TAccountLinked>
        : TAccountLinked,
      ...TRemainingAccounts,
    ]
  >;

export type LinkInstructionData = {
  discriminator: number;
  bump: number;
  ethAddress: Array<number>;
};

export type LinkInstructionDataArgs = {
  bump: number;
  ethAddress: Array<number>;
};

export function getLinkInstructionDataEncoder(): Encoder<LinkInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['bump', getU8Encoder()],
      ['ethAddress', getArrayEncoder(getU8Encoder(), { size: 20 })],
    ]),
    (value) => ({ ...value, discriminator: 1 })
  );
}

export function getLinkInstructionDataDecoder(): Decoder<LinkInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['bump', getU8Decoder()],
    ['ethAddress', getArrayDecoder(getU8Decoder(), { size: 20 })],
  ]);
}

export function getLinkInstructionDataCodec(): Codec<
  LinkInstructionDataArgs,
  LinkInstructionData
> {
  return combineCodec(
    getLinkInstructionDataEncoder(),
    getLinkInstructionDataDecoder()
  );
}

export type LinkInput<
  TAccountSystemProgram extends string = string,
  TAccountDephyProgram extends string = string,
  TAccountPayer extends string = string,
  TAccountUser extends string = string,
  TAccountLinked extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The DePHY program */
  dephyProgram: Address<TAccountDephyProgram>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The Registered user */
  user: TransactionSigner<TAccountUser>;
  /** The Linked account */
  linked: Address<TAccountLinked>;
  bump: LinkInstructionDataArgs['bump'];
  ethAddress: LinkInstructionDataArgs['ethAddress'];
};

export function getLinkInstruction<
  TAccountSystemProgram extends string,
  TAccountDephyProgram extends string,
  TAccountPayer extends string,
  TAccountUser extends string,
  TAccountLinked extends string,
>(
  input: LinkInput<
    TAccountSystemProgram,
    TAccountDephyProgram,
    TAccountPayer,
    TAccountUser,
    TAccountLinked
  >
): LinkInstruction<
  typeof KWIL_PROGRAM_ADDRESS,
  TAccountSystemProgram,
  TAccountDephyProgram,
  TAccountPayer,
  TAccountUser,
  TAccountLinked
> {
  // Program address.
  const programAddress = KWIL_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    dephyProgram: { value: input.dephyProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    user: { value: input.user ?? null, isWritable: false },
    linked: { value: input.linked ?? null, isWritable: true },
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
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.linked),
    ],
    programAddress,
    data: getLinkInstructionDataEncoder().encode(
      args as LinkInstructionDataArgs
    ),
  } as LinkInstruction<
    typeof KWIL_PROGRAM_ADDRESS,
    TAccountSystemProgram,
    TAccountDephyProgram,
    TAccountPayer,
    TAccountUser,
    TAccountLinked
  >;

  return instruction;
}

export type ParsedLinkInstruction<
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
    /** The Registered user */
    user: TAccountMetas[3];
    /** The Linked account */
    linked: TAccountMetas[4];
  };
  data: LinkInstructionData;
};

export function parseLinkInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedLinkInstruction<TProgram, TAccountMetas> {
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
      dephyProgram: getNextAccount(),
      payer: getNextAccount(),
      user: getNextAccount(),
      linked: getNextAccount(),
    },
    data: getLinkInstructionDataDecoder().decode(instruction.data),
  };
}
