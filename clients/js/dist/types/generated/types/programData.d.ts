/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */
import { Codec, Decoder, Encoder } from '@solana/web3.js';
export type ProgramData = {
    bump: number;
};
export type ProgramDataArgs = ProgramData;
export declare function getProgramDataEncoder(): Encoder<ProgramDataArgs>;
export declare function getProgramDataDecoder(): Decoder<ProgramData>;
export declare function getProgramDataCodec(): Codec<ProgramDataArgs, ProgramData>;
//# sourceMappingURL=programData.d.ts.map