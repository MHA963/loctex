#!/usr/bin/env node
/**
 * AOS Resilient Hook Runner
 * 
 * Safely executes lifecycle hook commands (tsc, eslint, vitest, playwright, prisma, etc.)
 * with automatic environment detection. If a project does not have node_modules, package.json,
 * or a specific test runner installed, it gracefully warns and skips rather than blocking
 * execution on missing external binaries in bare repos.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const command = process.argv.slice(2).join(' ');

if (!command) {
  process.exit(0);
}

// 1. Detect if project root has a package.json
const cwd = process.cwd();
const packageJsonPath = path.join(cwd, 'package.json');
const nodeModulesPath = path.join(cwd, 'node_modules');

const hasPackageJson = fs.existsSync(packageJsonPath);
const hasNodeModules = fs.existsSync(nodeModulesPath);

// Fast check: if running an npm/npx command in a repo without package.json or node_modules
if ((command.startsWith('npx ') || command.startsWith('npm ')) && (!hasPackageJson || !hasNodeModules)) {
  console.log(`[AOS_HOOK_SKIPPED] '${command}' skipped: package.json or node_modules not initialized in current workspace.`);
  process.exit(0);
}

// 2. Check if the specific CLI runner exists in node_modules/.bin (for npx commands)
const npxMatch = command.match(/^npx\s+([^\s]+)/);
if (npxMatch && hasNodeModules) {
  const binaryName = npxMatch[1];
  const isWindows = process.platform === 'win32';
  const binaryPath = path.join(nodeModulesPath, '.bin', isWindows ? `${binaryName}.cmd` : binaryName);
  const binaryPathFallback = path.join(nodeModulesPath, '.bin', binaryName);

  if (!fs.existsSync(binaryPath) && !fs.existsSync(binaryPathFallback)) {
    console.log(`[AOS_HOOK_SKIPPED] '${binaryName}' is not installed in local node_modules/.bin. Skipping check.`);
    process.exit(0);
  }
}

// 3. Execute command with safety timeout
try {
  execSync(command, {
    stdio: 'inherit',
    cwd: cwd,
    timeout: 120000 // 2 minute safety ceiling
  });
  process.exit(0);
} catch (error) {
  console.error(`[AOS_HOOK_FAILED] Gate validation failed for command: '${command}'`);
  // If exit code exists, forward it to enforce block_and_abort
  process.exit(error.status || 1);
}
