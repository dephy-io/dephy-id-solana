/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
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
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';
import {
  getDeviceActivationSignatureDecoder,
  getDeviceActivationSignatureEncoder,
  type DeviceActivationSignature,
  type DeviceActivationSignatureArgs,
} from '../types';

export const ACTIVATE_DEVICE_DISCRIMINATOR = 3;

export function getActivateDeviceDiscriminatorBytes() {
  return getU8Encoder().encode(ACTIVATE_DEVICE_DISCRIMINATOR);
}

export type ActivateDeviceInstruction<
  TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountToken2022Program extends
    | string
    | IAccountMeta<string> = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  TAccountAtaProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountVendor extends string | IAccountMeta<string> = string,
  TAccountProductMint extends string | IAccountMeta<string> = string,
  TAccountProductAssociatedToken extends string | IAccountMeta<string> = string,
  TAccountDevice extends string | IAccountMeta<string> = string,
  TAccountDeviceMint extends string | IAccountMeta<string> = string,
  TAccountDeviceAssociatedToken extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
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
      TAccountAtaProgram extends string
        ? ReadonlyAccount<TAccountAtaProgram>
        : TAccountAtaProgram,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountVendor extends string
        ? ReadonlyAccount<TAccountVendor>
        : TAccountVendor,
      TAccountProductMint extends string
        ? ReadonlyAccount<TAccountProductMint>
        : TAccountProductMint,
      TAccountProductAssociatedToken extends string
        ? ReadonlyAccount<TAccountProductAssociatedToken>
        : TAccountProductAssociatedToken,
      TAccountDevice extends string
        ? ReadonlyAccount<TAccountDevice>
        : TAccountDevice,
      TAccountDeviceMint extends string
        ? WritableAccount<TAccountDeviceMint>
        : TAccountDeviceMint,
      TAccountDeviceAssociatedToken extends string
        ? WritableAccount<TAccountDeviceAssociatedToken>
        : TAccountDeviceAssociatedToken,
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      ...TRemainingAccounts,
    ]
  >;

export type ActivateDeviceInstructionData = {
  discriminator: number;
  signature: DeviceActivationSignature;
  timestamp: bigint;
};

export type ActivateDeviceInstructionDataArgs = {
  signature: DeviceActivationSignatureArgs;
  timestamp: number | bigint;
};

export function getActivateDeviceInstructionDataEncoder(): Encoder<ActivateDeviceInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['signature', getDeviceActivationSignatureEncoder()],
      ['timestamp', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: ACTIVATE_DEVICE_DISCRIMINATOR })
  );
}

export function getActivateDeviceInstructionDataDecoder(): Decoder<ActivateDeviceInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['signature', getDeviceActivationSignatureDecoder()],
    ['timestamp', getU64Decoder()],
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
  TAccountToken2022Program extends string = string,
  TAccountAtaProgram extends string = string,
  TAccountPayer extends string = string,
  TAccountVendor extends string = string,
  TAccountProductMint extends string = string,
  TAccountProductAssociatedToken extends string = string,
  TAccountDevice extends string = string,
  TAccountDeviceMint extends string = string,
  TAccountDeviceAssociatedToken extends string = string,
  TAccountOwner extends string = string,
> = {
  /** The system program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** The SPL Token 2022 program */
  token2022Program?: Address<TAccountToken2022Program>;
  /** The associated token program */
  ataProgram?: Address<TAccountAtaProgram>;
  /** The account paying for the storage fees */
  payer: TransactionSigner<TAccountPayer>;
  /** The vendor */
  vendor: Address<TAccountVendor>;
  /** The mint account for the product */
  productMint: Address<TAccountProductMint>;
  /** The associated token account for the product */
  productAssociatedToken: Address<TAccountProductAssociatedToken>;
  /** The device */
  device: Address<TAccountDevice>;
  /** The mint account for the device */
  deviceMint: Address<TAccountDeviceMint>;
  /** The associated token account for the device */
  deviceAssociatedToken: Address<TAccountDeviceAssociatedToken>;
  /** The device's owner */
  owner: Address<TAccountOwner>;
  signature: ActivateDeviceInstructionDataArgs['signature'];
  timestamp: ActivateDeviceInstructionDataArgs['timestamp'];
};

export function getActivateDeviceInstruction<
  TAccountSystemProgram extends string,
  TAccountToken2022Program extends string,
  TAccountAtaProgram extends string,
  TAccountPayer extends string,
  TAccountVendor extends string,
  TAccountProductMint extends string,
  TAccountProductAssociatedToken extends string,
  TAccountDevice extends string,
  TAccountDeviceMint extends string,
  TAccountDeviceAssociatedToken extends string,
  TAccountOwner extends string,
  TProgramAddress extends Address = typeof DEPHY_ID_PROGRAM_ADDRESS,
>(
  input: ActivateDeviceInput<
    TAccountSystemProgram,
    TAccountToken2022Program,
    TAccountAtaProgram,
    TAccountPayer,
    TAccountVendor,
    TAccountProductMint,
    TAccountProductAssociatedToken,
    TAccountDevice,
    TAccountDeviceMint,
    TAccountDeviceAssociatedToken,
    TAccountOwner
  >,
  config?: { programAddress?: TProgramAddress }
): ActivateDeviceInstruction<
  TProgramAddress,
  TAccountSystemProgram,
  TAccountToken2022Program,
  TAccountAtaProgram,
  TAccountPayer,
  TAccountVendor,
  TAccountProductMint,
  TAccountProductAssociatedToken,
  TAccountDevice,
  TAccountDeviceMint,
  TAccountDeviceAssociatedToken,
  TAccountOwner
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
    ataProgram: { value: input.ataProgram ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    vendor: { value: input.vendor ?? null, isWritable: false },
    productMint: { value: input.productMint ?? null, isWritable: false },
    productAssociatedToken: {
      value: input.productAssociatedToken ?? null,
      isWritable: false,
    },
    device: { value: input.device ?? null, isWritable: false },
    deviceMint: { value: input.deviceMint ?? null, isWritable: true },
    deviceAssociatedToken: {
      value: input.deviceAssociatedToken ?? null,
      isWritable: true,
    },
    owner: { value: input.owner ?? null, isWritable: false },
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
  if (!accounts.ataProgram.value) {
    accounts.ataProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
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
      getAccountMeta(accounts.owner),
    ],
    programAddress,
    data: getActivateDeviceInstructionDataEncoder().encode(
      args as ActivateDeviceInstructionDataArgs
    ),
  } as ActivateDeviceInstruction<
    TProgramAddress,
    TAccountSystemProgram,
    TAccountToken2022Program,
    TAccountAtaProgram,
    TAccountPayer,
    TAccountVendor,
    TAccountProductMint,
    TAccountProductAssociatedToken,
    TAccountDevice,
    TAccountDeviceMint,
    TAccountDeviceAssociatedToken,
    TAccountOwner
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
    token2022Program: TAccountMetas[1];
    /** The associated token program */
    ataProgram: TAccountMetas[2];
    /** The account paying for the storage fees */
    payer: TAccountMetas[3];
    /** The vendor */
    vendor: TAccountMetas[4];
    /** The mint account for the product */
    productMint: TAccountMetas[5];
    /** The associated token account for the product */
    productAssociatedToken: TAccountMetas[6];
    /** The device */
    device: TAccountMetas[7];
    /** The mint account for the device */
    deviceMint: TAccountMetas[8];
    /** The associated token account for the device */
    deviceAssociatedToken: TAccountMetas[9];
    /** The device's owner */
    owner: TAccountMetas[10];
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
      token2022Program: getNextAccount(),
      ataProgram: getNextAccount(),
      payer: getNextAccount(),
      vendor: getNextAccount(),
      productMint: getNextAccount(),
      productAssociatedToken: getNextAccount(),
      device: getNextAccount(),
      deviceMint: getNextAccount(),
      deviceAssociatedToken: getNextAccount(),
      owner: getNextAccount(),
    },
    data: getActivateDeviceInstructionDataDecoder().decode(instruction.data),
  };
}
