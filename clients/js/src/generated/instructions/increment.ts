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
  Option,
  OptionOrNullable,
  combineCodec,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
  none,
} from '@solana/codecs';
import {
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlySignerAccount,
  WritableAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import { findCounterPda } from '../pdas';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import {
  ResolvedAccount,
  expectAddress,
  getAccountMetaFactory,
} from '../shared';

export type IncrementInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountCounter extends string | IAccountMeta<string> = string,
  TAccountAuthority extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountCounter extends string
        ? WritableAccount<TAccountCounter>
        : TAccountCounter,
      TAccountAuthority extends string
        ? ReadonlySignerAccount<TAccountAuthority> &
            IAccountSignerMeta<TAccountAuthority>
        : TAccountAuthority,
      ...TRemainingAccounts,
    ]
  >;

export type IncrementInstructionData = {
  discriminator: number;
  amount: Option<number>;
};

export type IncrementInstructionDataArgs = {
  amount?: OptionOrNullable<number>;
};

export function getIncrementInstructionDataEncoder(): Encoder<IncrementInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['amount', getOptionEncoder(getU32Encoder())],
    ]),
    (value) => ({ ...value, discriminator: 1, amount: value.amount ?? none() })
  );
}

export function getIncrementInstructionDataDecoder(): Decoder<IncrementInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['amount', getOptionDecoder(getU32Decoder())],
  ]);
}

export function getIncrementInstructionDataCodec(): Codec<
  IncrementInstructionDataArgs,
  IncrementInstructionData
> {
  return combineCodec(
    getIncrementInstructionDataEncoder(),
    getIncrementInstructionDataDecoder()
  );
}

export type IncrementAsyncInput<
  TAccountCounter extends string = string,
  TAccountAuthority extends string = string,
> = {
  /** The program derived address of the counter account to increment (seeds: ['counter', authority]) */
  counter?: Address<TAccountCounter>;
  /** The authority of the counter */
  authority: TransactionSigner<TAccountAuthority>;
  amount?: IncrementInstructionDataArgs['amount'];
};

export async function getIncrementInstructionAsync<
  TAccountCounter extends string,
  TAccountAuthority extends string,
>(
  input: IncrementAsyncInput<TAccountCounter, TAccountAuthority>
): Promise<
  IncrementInstruction<
    typeof DEPHY_ID_PROGRAM_ADDRESS,
    TAccountCounter,
    TAccountAuthority
  >
> {
  // Program address.
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    counter: { value: input.counter ?? null, isWritable: true },
    authority: { value: input.authority ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.counter.value) {
    accounts.counter.value = await findCounterPda({
      authority: expectAddress(accounts.authority.value),
    });
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.counter),
      getAccountMeta(accounts.authority),
    ],
    programAddress,
    data: getIncrementInstructionDataEncoder().encode(
      args as IncrementInstructionDataArgs
    ),
  } as IncrementInstruction<
    typeof DEPHY_ID_PROGRAM_ADDRESS,
    TAccountCounter,
    TAccountAuthority
  >;

  return instruction;
}

export type IncrementInput<
  TAccountCounter extends string = string,
  TAccountAuthority extends string = string,
> = {
  /** The program derived address of the counter account to increment (seeds: ['counter', authority]) */
  counter: Address<TAccountCounter>;
  /** The authority of the counter */
  authority: TransactionSigner<TAccountAuthority>;
  amount?: IncrementInstructionDataArgs['amount'];
};

export function getIncrementInstruction<
  TAccountCounter extends string,
  TAccountAuthority extends string,
>(
  input: IncrementInput<TAccountCounter, TAccountAuthority>
): IncrementInstruction<
  typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountCounter,
  TAccountAuthority
> {
  // Program address.
  const programAddress = DEPHY_ID_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    counter: { value: input.counter ?? null, isWritable: true },
    authority: { value: input.authority ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.counter),
      getAccountMeta(accounts.authority),
    ],
    programAddress,
    data: getIncrementInstructionDataEncoder().encode(
      args as IncrementInstructionDataArgs
    ),
  } as IncrementInstruction<
    typeof DEPHY_ID_PROGRAM_ADDRESS,
    TAccountCounter,
    TAccountAuthority
  >;

  return instruction;
}

export type ParsedIncrementInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The program derived address of the counter account to increment (seeds: ['counter', authority]) */
    counter: TAccountMetas[0];
    /** The authority of the counter */
    authority: TAccountMetas[1];
  };
  data: IncrementInstructionData;
};

export function parseIncrementInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedIncrementInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 2) {
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
      counter: getNextAccount(),
      authority: getNextAccount(),
    },
    data: getIncrementInstructionDataDecoder().decode(instruction.data),
  };
}
