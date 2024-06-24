/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */
import { fetchEncodedAccount, fetchEncodedAccounts, type Account, type Address, type Codec, type Decoder, type EncodedAccount, type Encoder, type FetchAccountConfig, type FetchAccountsConfig, type MaybeAccount, type MaybeEncodedAccount } from '@solana/web3.js';
import { Key, type ProgramData, type ProgramDataArgs } from '../types';
export type ProgramDataAccount = {
    key: Key;
    authority: Address;
    data: ProgramData;
};
export type ProgramDataAccountArgs = {
    authority: Address;
    data: ProgramDataArgs;
};
export declare function getProgramDataAccountEncoder(): Encoder<ProgramDataAccountArgs>;
export declare function getProgramDataAccountDecoder(): Decoder<ProgramDataAccount>;
export declare function getProgramDataAccountCodec(): Codec<ProgramDataAccountArgs, ProgramDataAccount>;
export declare function decodeProgramDataAccount<TAddress extends string = string>(encodedAccount: EncodedAccount<TAddress>): Account<ProgramDataAccount, TAddress>;
export declare function decodeProgramDataAccount<TAddress extends string = string>(encodedAccount: MaybeEncodedAccount<TAddress>): MaybeAccount<ProgramDataAccount, TAddress>;
export declare function fetchProgramDataAccount<TAddress extends string = string>(rpc: Parameters<typeof fetchEncodedAccount>[0], address: Address<TAddress>, config?: FetchAccountConfig): Promise<Account<ProgramDataAccount, TAddress>>;
export declare function fetchMaybeProgramDataAccount<TAddress extends string = string>(rpc: Parameters<typeof fetchEncodedAccount>[0], address: Address<TAddress>, config?: FetchAccountConfig): Promise<MaybeAccount<ProgramDataAccount, TAddress>>;
export declare function fetchAllProgramDataAccount(rpc: Parameters<typeof fetchEncodedAccounts>[0], addresses: Array<Address>, config?: FetchAccountsConfig): Promise<Account<ProgramDataAccount>[]>;
export declare function fetchAllMaybeProgramDataAccount(rpc: Parameters<typeof fetchEncodedAccounts>[0], addresses: Array<Address>, config?: FetchAccountsConfig): Promise<MaybeAccount<ProgramDataAccount>[]>;
export declare function getProgramDataAccountSize(): number;
export declare function fetchProgramDataAccountFromSeeds(rpc: Parameters<typeof fetchEncodedAccount>[0], config?: FetchAccountConfig & {
    programAddress?: Address;
}): Promise<Account<ProgramDataAccount>>;
export declare function fetchMaybeProgramDataAccountFromSeeds(rpc: Parameters<typeof fetchEncodedAccount>[0], config?: FetchAccountConfig & {
    programAddress?: Address;
}): Promise<MaybeAccount<ProgramDataAccount>>;
//# sourceMappingURL=programDataAccount.d.ts.map