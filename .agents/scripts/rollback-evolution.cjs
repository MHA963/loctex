#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Evolution Rollback Engine
 * Safely reverts a promoted evolution candidate to restore baseline stability.
 *
 * Usage:
 *   node .agents/scripts/rollback-evolution.cjs <candidateId>
 */

const fs = require('fs');
const path = require('path');
const { logEvent } = require('./log-event.cjs');

const EVOLUTION_DIR = path.resolve(__dirname, '..', 'evolution');
const PROMOTED_DIR = path.join(EVOLUTION_DIR, 'promoted');
const REJECTED_DIR = path.join(EVOLUTION_DIR, 'rejected');
const BACKUPS_DIR = path.join(EVOLUTION_DIR, 'backups');
const LEDGER_PATH = path.join(PROMOTED_DIR, 'evolution-ledger.json');

function rollbackCandidate(candidateId) {
  const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
  const targetEntry = ledger.history.find(h => h.candidateId === candidateId || h.proposalId === candidateId);

  if (!targetEntry) {
    throw new Error(`Candidate '${candidateId}' not found in active promotion ledger.`);
  }

  console.log(`\n===============================================================`);
  console.log(`  🚨 EMERGENCY ROLLBACK TRIGGERED FOR CANDIDATE: ${candidateId}`);
  console.log(`  Target File: ${targetEntry.targetFile}`);
  console.log(`===============================================================\n`);

  // Restore backup
  const backupFile = path.join(BACKUPS_DIR, targetEntry.candidateId, path.basename(targetEntry.targetFile));
  const targetFullPath = path.resolve(__dirname, '..', targetEntry.targetFile);

  if (fs.existsSync(backupFile)) {
    fs.copyFileSync(backupFile, targetFullPath);
    console.log(`[RESTORED] Restored backup file from: ${backupFile}`);
  } else {
    console.warn(`[WARNING] No explicit backup file found at ${backupFile}. Ensure manual check.`);
  }

  // Update ledger
  targetEntry.status = 'rolled_back';
  targetEntry.rolledBackAt = new Date().toISOString();
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf8');

  // Log rollback event
  logEvent({
    taskId: targetEntry.proposalId,
    agent: "GAI",
    event: "TASK_ROLLED_BACK",
    state: "rolled_back",
    status: "failed",
    artifacts: [targetEntry.targetFile],
    dependencies: [],
    payload: {
      details: {
        candidateId,
        reason: "Canary regression or post-promotion test failure detected"
      }
    }
  });

  console.log(`\n✅ [ROLLBACK_COMPLETE] Candidate '${candidateId}' safely rolled back.`);
  return true;
}

if (require.main === module) {
  const candidateId = process.argv[2];
  if (!candidateId) {
    console.error("Usage: node rollback-evolution.cjs <candidateId>");
    process.exit(1);
  }
  try {
    rollbackCandidate(candidateId);
  } catch (err) {
    console.error(`[ROLLBACK_ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = { rollbackCandidate };
