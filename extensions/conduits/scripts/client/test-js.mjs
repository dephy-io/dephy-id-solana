#!/usr/bin/env zx
import 'zx/globals';
import { cliArguments, workingDirectory } from '../utils.mjs';

// Start the local validator, or restart it if it is already running.
await $`bun validator:restart`;

// Build the client and run the tests.
cd(path.join(workingDirectory, 'clients', 'js'));
await $`bun install`;
await $`bun run build`;
await $`bun run test ${cliArguments()}`;

await $`bun validator:stop`;
