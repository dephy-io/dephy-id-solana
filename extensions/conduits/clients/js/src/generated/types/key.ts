/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  getEnumDecoder,
  getEnumEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';

export enum Key {
  Uninitialized,
  App,
  ListingInfo,
  RentalInfo,
}

export type KeyArgs = Key;

export function getKeyEncoder(): Encoder<KeyArgs> {
  return getEnumEncoder(Key);
}

export function getKeyDecoder(): Decoder<Key> {
  return getEnumDecoder(Key);
}

export function getKeyCodec(): Codec<KeyArgs, Key> {
  return combineCodec(getKeyEncoder(), getKeyDecoder());
}
