#!/usr/bin/env node
/**
 * Playwright Multi-Role Matrix Runner (QAI Testing Plugin)
 * Executes authenticated role matrix tests against specified routes.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetProject = process.cwd();
const playwrightConfig = path.join(targetProject, 'playwright.config.ts');
const playwrightConfigJs = path.join(targetProject, 'playwright.config.js');

if (!fs.existsSync(playwrightConfig) && !fs.existsSync(playwrightConfigJs)) {
  console.log('[QAI_PLUGIN_SKIPPED] No playwright.config file detected in current workspace. Skipping matrix run.');
  process.exit(0);
}

try {
  console.log('[QAI_PLUGIN_RUNNING] Executing multi-role Playwright test suite...');
  execSync('npx playwright test --workers=2', { stdio: 'inherit', cwd: targetProject });
  console.log('[QAI_PLUGIN_PASSED] All E2E test scenarios passed successfully.');
  process.exit(0);
} catch (error) {
  console.error('[QAI_PLUGIN_FAILED] E2E test failures detected.');
  process.exit(error.status || 1);
}
