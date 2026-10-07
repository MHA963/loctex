#!/usr/bin/env node
/**
 * Commitlint Regex Gatekeeper Script (GAI Release Plugin)
 * Validates commit message against strict Conventional Commits specification.
 */

const rawMsg = process.argv[2] || process.env.COMMIT_MESSAGE;

if (!rawMsg) {
  console.error('[GAI_COMMIT_ERROR] No commit message provided to validate.');
  process.exit(1);
}

const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-_\/]+\))?:\s[a-z0-9#].+$/;

if (!conventionalRegex.test(rawMsg.trim())) {
  console.error(`[GAI_GATE_BLOCKED] Invalid Conventional Commit message format:
  Input: "${rawMsg}"
  Expected format: <type>(<scope>): <lowercase description>
  Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  Example: feat(auth): add multi-tenant rls session validator`);
  process.exit(1);
}

console.log(`[GAI_GATE_PASSED] Commit message satisfies Conventional Commits specification.`);
process.exit(0);
