#!/usr/bin/env node
// Fail when the @types/node major differs from the Node.js major bundled with
// Electron. The main and preload code run on Electron's Node, so typing them
// against a newer Node lets APIs that do not exist at runtime type-check.
// Dependabot ignores @types/node majors; bump it together with Electron when
// this check fails. Usage: node scripts/check-types-node.js

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const major = (version) => version.split('.')[0];

export function compareMajors(electronNodeVersion, typesNodeVersion) {
  if (major(electronNodeVersion) === major(typesNodeVersion)) {
    return null;
  }
  return (
    `@types/node ${typesNodeVersion} does not match Node ${electronNodeVersion} ` +
    `bundled with Electron; use @types/node@^${major(electronNodeVersion)}`
  );
}

export function getElectronNodeVersion() {
  // Go through electron's CLI so the binary is downloaded on demand when the
  // package no longer installs it in postinstall (Electron 42+)
  const result = spawnSync(
    process.execPath,
    [require.resolve('electron/cli.js'), '-p', 'process.versions.node'],
    { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, encoding: 'utf8' }
  );
  if (result.status !== 0) {
    throw new Error(`Failed to run Electron: ${result.stderr || result.error}`);
  }
  return result.stdout.trim();
}

export function getTypesNodeVersion() {
  const packageJsonPath = require.resolve('@types/node/package.json');
  return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const electronNodeVersion = getElectronNodeVersion();
  const typesNodeVersion = getTypesNodeVersion();
  const mismatch = compareMajors(electronNodeVersion, typesNodeVersion);
  if (mismatch) {
    console.error(mismatch);
    process.exit(1);
  }
  console.log(`@types/node ${typesNodeVersion} matches Electron's Node ${electronNodeVersion}`);
}
