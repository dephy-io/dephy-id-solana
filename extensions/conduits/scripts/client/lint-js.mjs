#!/usr/bin/env zx
import 'zx/globals';
import { cliArguments, workingDirectory } from '../utils.mjs';

// Check the client using ESLint.
cd(path.join(workingDirectory, 'clients', 'js'));
await $`bun install`;
await $`bun lint ${cliArguments()}`;
