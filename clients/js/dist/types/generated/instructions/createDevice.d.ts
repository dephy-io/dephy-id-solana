/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */
import { type Address, type Codec, type Decoder, type Encoder, type IAccountMeta, type IAccountSignerMeta, type IInstruction, type IInstructionWithAccounts, type IInstructionWithData, type ReadonlyAccount, type ReadonlySignerAccount, type TransactionSigner, type WritableAccount, type WritableSignerAccount } from '@solana/web3.js';
import { DEPHY_ID_PROGRAM_ADDRESS } from '../programs';
import { type DeviceSigningAlgorithm, type DeviceSigningAlgorithmArgs } from '../types';
export type CreateDeviceInstruction<TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS, TAccountSystemProgram extends string | IAccountMeta<string> = '11111111111111111111111111111111', TAccountToken2022Program extends string | IAccountMeta<string> = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', TAccountAtaProgram extends string | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', TAccountPayer extends string | IAccountMeta<string> = string, TAccountVendor extends string | IAccountMeta<string> = string, TAccountProductMint extends string | IAccountMeta<string> = string, TAccountProductAssociatedToken extends string | IAccountMeta<string> = string, TAccountDevice extends string | IAccountMeta<string> = string, TAccountDeviceMint extends string | IAccountMeta<string> = string, TRemainingAccounts extends readonly IAccountMeta<string>[] = []> = IInstruction<TProgram> & IInstructionWithData<Uint8Array> & IInstructionWithAccounts<[
    TAccountSystemProgram extends string ? ReadonlyAccount<TAccountSystemProgram> : TAccountSystemProgram,
    TAccountToken2022Program extends string ? ReadonlyAccount<TAccountToken2022Program> : TAccountToken2022Program,
    TAccountAtaProgram extends string ? ReadonlyAccount<TAccountAtaProgram> : TAccountAtaProgram,
    TAccountPayer extends string ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer> : TAccountPayer,
    TAccountVendor extends string ? ReadonlySignerAccount<TAccountVendor> & IAccountSignerMeta<TAccountVendor> : TAccountVendor,
    TAccountProductMint extends string ? WritableAccount<TAccountProductMint> : TAccountProductMint,
    TAccountProductAssociatedToken extends string ? WritableAccount<TAccountProductAssociatedToken> : TAccountProductAssociatedToken,
    TAccountDevice extends string ? ReadonlyAccount<TAccountDevice> : TAccountDevice,
    TAccountDeviceMint extends string ? WritableAccount<TAccountDeviceMint> : TAccountDeviceMint,
    ...TRemainingAccounts
]>;
export type CreateDeviceInstructionData = {
    discriminator: number;
    name: string;
    uri: string;
    additionalMetadata: Array<readonly [string, string]>;
    signingAlg: DeviceSigningAlgorithm;
};
export type CreateDeviceInstructionDataArgs = {
    name: string;
    uri: string;
    additionalMetadata: Array<readonly [string, string]>;
    signingAlg: DeviceSigningAlgorithmArgs;
};
export declare function getCreateDeviceInstructionDataEncoder(): Encoder<CreateDeviceInstructionDataArgs>;
export declare function getCreateDeviceInstructionDataDecoder(): Decoder<CreateDeviceInstructionData>;
export declare function getCreateDeviceInstructionDataCodec(): Codec<CreateDeviceInstructionDataArgs, CreateDeviceInstructionData>;
export type CreateDeviceInput<TAccountSystemProgram extends string = string, TAccountToken2022Program extends string = string, TAccountAtaProgram extends string = string, TAccountPayer extends string = string, TAccountVendor extends string = string, TAccountProductMint extends string = string, TAccountProductAssociatedToken extends string = string, TAccountDevice extends string = string, TAccountDeviceMint extends string = string> = {
    /** The system program */
    systemProgram?: Address<TAccountSystemProgram>;
    /** The SPL Token 2022 program */
    token2022Program?: Address<TAccountToken2022Program>;
    /** The associated token program */
    ataProgram?: Address<TAccountAtaProgram>;
    /** The account paying for the storage fees */
    payer?: TransactionSigner<TAccountPayer>;
    /** The vendor */
    vendor: TransactionSigner<TAccountVendor>;
    /** The mint account of the product */
    productMint: Address<TAccountProductMint>;
    /** The associated token account of the product */
    productAssociatedToken: Address<TAccountProductAssociatedToken>;
    /** The device */
    device: Address<TAccountDevice>;
    /** The mint account of the device */
    deviceMint: Address<TAccountDeviceMint>;
    name: CreateDeviceInstructionDataArgs['name'];
    uri: CreateDeviceInstructionDataArgs['uri'];
    additionalMetadata: CreateDeviceInstructionDataArgs['additionalMetadata'];
    signingAlg: CreateDeviceInstructionDataArgs['signingAlg'];
};
export declare function getCreateDeviceInstruction<TAccountSystemProgram extends string, TAccountToken2022Program extends string, TAccountAtaProgram extends string, TAccountPayer extends string, TAccountVendor extends string, TAccountProductMint extends string, TAccountProductAssociatedToken extends string, TAccountDevice extends string, TAccountDeviceMint extends string>(input: CreateDeviceInput<TAccountSystemProgram, TAccountToken2022Program, TAccountAtaProgram, TAccountPayer, TAccountVendor, TAccountProductMint, TAccountProductAssociatedToken, TAccountDevice, TAccountDeviceMint>): CreateDeviceInstruction<typeof DEPHY_ID_PROGRAM_ADDRESS, TAccountSystemProgram, TAccountToken2022Program, TAccountAtaProgram, TAccountPayer, TAccountVendor, TAccountProductMint, TAccountProductAssociatedToken, TAccountDevice, TAccountDeviceMint>;
export type ParsedCreateDeviceInstruction<TProgram extends string = typeof DEPHY_ID_PROGRAM_ADDRESS, TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]> = {
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
        /** The mint account of the product */
        productMint: TAccountMetas[5];
        /** The associated token account of the product */
        productAssociatedToken: TAccountMetas[6];
        /** The device */
        device: TAccountMetas[7];
        /** The mint account of the device */
        deviceMint: TAccountMetas[8];
    };
    data: CreateDeviceInstructionData;
};
export declare function parseCreateDeviceInstruction<TProgram extends string, TAccountMetas extends readonly IAccountMeta[]>(instruction: IInstruction<TProgram> & IInstructionWithAccounts<TAccountMetas> & IInstructionWithData<Uint8Array>): ParsedCreateDeviceInstruction<TProgram, TAccountMetas>;
//# sourceMappingURL=createDevice.d.ts.map