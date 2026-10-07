#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Failure Classification & Flake Quarantine Engine
 * Prevents "Defect-Hiding" (Test fails -> Modify test -> Test passes anti-pattern).
 *
 * Categorizes failures into:
 *   1. PRODUCT_BUG: Application logic defect. Tests are LOCKED; implementation MUST be refactored.
 *   2. TEST_BUG: Test assertion violates locked contract. Requires QAI + EVAI dual sign-off to edit.
 *   3. ENVIRONMENT_ISSUE: Infrastructure/timeout error.
 *   4. FLAKY: Non-deterministic failure. Quarantined to tests/quarantine/ with timing distribution.
 *
 * Usage:
 *   node .agents/scripts/classify-failure.cjs --test <testPath> --error "<errorMessage>" [--timing "<100,520,120>"]
 */

const fs = require('fs');
const path = require('path');
const { logEvent } = require('./log-event.cjs');

const QUARANTINE_DIR = path.resolve(process.cwd(), 'tests', 'quarantine');
const TELEMETRY_DIR = path.resolve(__dirname, '..', 'telemetry');

function classifyFailure({
  testPath,
  errorMessage = '',
  stackTrace = '',
  timingDistribution = [],
  contractVersion = '1.0.0'
}) {
  console.log(`\n===============================================================`);
  console.log(`  🔬 EVAI / QAI ROOT CAUSE FAILURE CLASSIFICATION`);
  console.log(`  Target Test: ${testPath || 'N/A'}`);
  console.log(`===============================================================\n`);

  let category = 'PRODUCT_BUG';
  let allowedTarget = 'implementation';
  let requiresDualApproval = false;
  let quarantineRequired = false;
  let rationale = '';

  const errLower = errorMessage.toLowerCase() + stackTrace.toLowerCase();

  // 1. Check for Environment Issues
  if (
    errLower.includes('econnrefused') ||
    errLower.includes('etimedout') ||
    errLower.includes('enotfound') ||
    errLower.includes('spawn enoent') ||
    errLower.includes('port 5432')
  ) {
    category = 'ENVIRONMENT_ISSUE';
    allowedTarget = 'infrastructure';
    rationale = 'Network socket / database daemon unreachable or environment variable missing.';
  }
  // 2. Check for Flaky Timing / Race Conditions
  else if (
    errLower.includes('timeout of') ||
    errLower.includes('element is not attached') ||
    errLower.includes('page closed') ||
    (timingDistribution.length > 1 && Math.max(...timingDistribution) > 3 * Math.min(...timingDistribution))
  ) {
    category = 'FLAKY';
    allowedTarget = 'infrastructure';
    quarantineRequired = true;
    requiresDualApproval = true;
    rationale = 'Non-deterministic race condition or asynchronous DOM detachment detected.';
  }
  // 3. Check for Test Bug vs Product Bug
  else if (
    errLower.includes('is not a function') && errLower.includes('expect(') ||
    errLower.includes('contract invariant mismatch')
  ) {
    category = 'TEST_BUG';
    allowedTarget = 'test';
    requiresDualApproval = true;
    rationale = 'Test assertion was proven to violate the locked Zod contract specification. Dual sign-off required to update test.';
  }
  // 4. Default: Product Bug (Strict Invariant: Tests cannot be modified!)
  else {
    category = 'PRODUCT_BUG';
    allowedTarget = 'implementation';
    requiresDualApproval = false;
    rationale = 'Application code failed deterministic assertion. TEST IS LOCKED. Refactor source implementation only.';
  }

  const report = {
    timestamp: new Date().toISOString(),
    testPath,
    category,
    allowedTarget,
    requiresDualApproval,
    quarantineRequired,
    rationale,
    evidence: {
      errorMessage,
      contractVersion,
      timingDistribution
    }
  };

  // If Flaky, isolate to quarantine
  if (quarantineRequired && testPath && fs.existsSync(testPath)) {
    if (!fs.existsSync(QUARANTINE_DIR)) {
      fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
    }
    const quarantineFile = path.join(QUARANTINE_DIR, path.basename(testPath));
    fs.copyFileSync(testPath, quarantineFile);
    console.log(`[QUARANTINED] Moved non-deterministic test to: ${quarantineFile}`);
    console.log(`[QUARANTINE_POLICY] Flaky tests do NOT contribute to green builds until healed under dual sign-off.`);

    logEvent({
      taskId: `rca-${Date.now()}`,
      agent: "QAI",
      event: "TEST_QUARANTINED",
      state: "QUARANTINED",
      status: "failed",
      artifacts: [quarantineFile],
      dependencies: [],
      payload: { details: report }
    });
  } else {
    logEvent({
      taskId: `rca-${Date.now()}`,
      agent: "EVAI",
      event: "RCA_CLASSIFIED",
      state: "RCA_REQUIRED",
      status: "failed",
      artifacts: [testPath || 'unknown'],
      dependencies: [],
      payload: { details: report }
    });
  }

  console.log(`  Classification:   [${category}]`);
  console.log(`  Allowed Mutation: [${allowedTarget.toUpperCase()}]`);
  console.log(`  Dual Sign-Off:    ${requiresDualApproval ? 'REQUIRED (QAI + EVAI)' : 'NOT REQUIRED'}`);
  console.log(`  Rationale:        ${rationale}\n`);
  console.log(`===============================================================\n`);

  return report;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const testPath = getArg('--test');
  const errorMessage = getArg('--error') || 'AssertionError: expected false to be true';
  const timingRaw = getArg('--timing');
  const timingDistribution = timingRaw ? timingRaw.split(',').map(Number) : [];

  classifyFailure({ testPath, errorMessage, timingDistribution });
}

module.exports = { classifyFailure };
