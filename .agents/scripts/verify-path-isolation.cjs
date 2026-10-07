#!/usr/bin/env node
/**
 * Fast Path Boundary & Isolation Guard
 * Executed pre-edit in hooks.json to ensure agents never mutate out-of-bounds files
 * or sensitive directories (e.g. .git, production credentials, root system paths).
 */

const path = require('path');
const targetFile = process.argv[2];

if (!targetFile) {
  process.exit(0);
}

const normalized = path.normalize(targetFile).toLowerCase();

const forbiddenPatterns = [
  /\.env(\.production|\.local)?$/,
  /\.git[\/\\]/,
  /node_modules[\/\\]/,
  /\.pem$/,
  /id_rsa/
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(normalized)) {
    console.error(`[BLOCKED] Path isolation violation: Direct modification of '${targetFile}' is forbidden by security policy.`);
    process.exit(1);
  }
}

process.exit(0);
