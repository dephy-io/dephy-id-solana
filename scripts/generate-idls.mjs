#!/usr/bin/env zx
import 'zx/globals';
import { getCargo, getProgramFolders } from './utils.mjs';

getProgramFolders().forEach(async (folder) => {
  const cargo = getCargo(folder);
  const isShank = Object.keys(cargo.dependencies).includes('shank');
  const programDir = path.join(__dirname, '..', folder)
  const programId = cargo.package.metadata.solana['program-id']

  if (isShank) {
    await $`shank idl -r ${programDir} -o ${programDir} -p ${programId} --out-filename idl.json`
  }
})
