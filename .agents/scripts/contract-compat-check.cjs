#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Versioned Contract Compatibility & Change Impact Analyzer
 * Evaluates proposed schema mutations, checks SemVer backward-compatibility, and identifies impacted agents.
 *
 * Usage:
 *   node .agents/scripts/contract-compat-check.cjs --contract <contractJsonPath> --newVersion <v1.1.0>
 */

const fs = require('fs');
const path = require('path');
const { logEvent } = require('./log-event.cjs');

function analyzeContractCompatibility({
  contractId = 'contract-main',
  currentVersion = '1.0.0',
  proposedVersion = '1.1.0',
  removedFields = [],
  addedRequiredFields = [],
  addedOptionalFields = [],
  typeChanges = [],
  activeConsumers = [
    { agent: 'Fai', worktree: 'feat/frontend-ui', subtask: 'UI components' },
    { agent: 'BAI', worktree: 'feat/backend-api', subtask: 'Database queries' }
  ]
}) {
  console.log(`\n===============================================================`);
  console.log(`  📐 AAI CONTRACT VERSION COMPATIBILITY & IMPACT ANALYSIS`);
  console.log(`  Contract: ${contractId} (${currentVersion} ➔ ${proposedVersion})`);
  console.log(`===============================================================\n`);

  const breakingChanges = [];

  if (removedFields.length > 0) {
    breakingChanges.push(`Removed fields from contract: [${removedFields.join(', ')}]`);
  }
  if (addedRequiredFields.length > 0) {
    breakingChanges.push(`Added new required fields without default: [${addedRequiredFields.join(', ')}]`);
  }
  if (typeChanges.length > 0) {
    breakingChanges.push(`Mutated existing property types: [${typeChanges.join(', ')}]`);
  }

  const isBackwardCompatible = breakingChanges.length === 0;
  const impactedAgents = isBackwardCompatible ? [] : activeConsumers;

  const result = {
    contractId,
    currentVersion,
    proposedVersion,
    isBackwardCompatible,
    breakingChanges,
    additiveChanges: addedOptionalFields,
    impactedConsumers: impactedAgents,
    recommendedAction: isBackwardCompatible ? 'PROCEED_MINOR_BUMP' : 'REPLAN_AFFECTED_SUBAGENTS'
  };

  if (!isBackwardCompatible) {
    console.error(`🚨 [BREAKING_CHANGE_DETECTED] Contract mutation breaks backward compatibility:`);
    breakingChanges.forEach(b => console.error(`  ❌ ${b}`));
    console.warn(`\n⚠️  [IMPACTED_SUBAGENTS] The following running subagents are invalidated and require re-planning:`);
    impactedAgents.forEach(c => console.warn(`  - ${c.agent} (${c.worktree}): ${c.subtask}`));

    logEvent({
      taskId: `contract-bump-${Date.now()}`,
      agent: "AAI",
      event: "DEPENDENCY_BLOCKED",
      state: "WAITING_FOR_DEPENDENCY",
      status: "blocked",
      artifacts: [`contracts/${contractId}.v${proposedVersion}.ts`],
      dependencies: [],
      payload: { details: result }
    });
  } else {
    console.log(`✅ [COMPATIBLE_MUTATION] Contract change is 100% backward-compatible.`);
    console.log(`  Added optional fields: [${addedOptionalFields.join(', ') || 'none'}]`);
    console.log(`  Active worktree branches remain valid.\n`);

    logEvent({
      taskId: `contract-bump-${Date.now()}`,
      agent: "AAI",
      event: "CONTRACT_VERSION_BUMPED",
      state: "CONTRACT_LOCKED",
      status: "passed",
      artifacts: [`contracts/${contractId}.v${proposedVersion}.ts`],
      dependencies: [],
      payload: { details: result }
    });
  }

  console.log(`===============================================================\n`);
  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const contractId = getArg('--contract') || 'contract-checkout';
  const currentVersion = getArg('--currentVersion') || '1.0.0';
  const proposedVersion = getArg('--proposedVersion') || '1.1.0';
  const removedFieldsRaw = getArg('--removed');
  const removedFields = removedFieldsRaw ? removedFieldsRaw.split(',') : [];

  analyzeContractCompatibility({
    contractId,
    currentVersion,
    proposedVersion,
    removedFields
  });
}

module.exports = { analyzeContractCompatibility };
