#!/usr/bin/env zx
import 'zx/globals';
import { workingDirectory } from '../utils.mjs';

// Start the local validator if it's not already running.
await $`bun validator:start --restart`;

// Build the client and run the tests.
cd(path.join(workingDirectory, 'clients', 'js'));
await $`bun install`;
await $`bun run build`;
await $`bun run test ${process.argv.slice(3)}`;
