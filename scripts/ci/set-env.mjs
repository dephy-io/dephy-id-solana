#!/usr/bin/env zx
import { getSolanaVersion, getRustVersion } from '../utils.mjs';

await $`echo "SOLANA_VERSION=${getSolanaVersion()}" >> $GITHUB_ENV`;
await $`echo "RUST_TOOLCHAIN=${getRustVersion()}" >> $GITHUB_ENV`;
