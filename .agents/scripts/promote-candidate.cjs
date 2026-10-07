#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Candidate Promotion Gatekeeper (GAI Engine)
 * Merges validated evolution candidates into production AOS, updates ledger, and versions the OS.
 *
 * Usage:
 *   node .agents/scripts/promote-candidate.cjs <proposalId>
 */

const fs = require('fs');
const path = require('path');
const { logEvent } = require('./log-event.cjs');

const EVOLUTION_DIR = path.resolve(__dirname, '..', 'evolution');
const PROPOSALS_DIR = path.join(EVOLUTION_DIR, 'proposals');
const EVALUATIONS_DIR = path.join(EVOLUTION_DIR, 'evaluations');
const PROMOTED_DIR = path.join(EVOLUTION_DIR, 'promoted');
const REJECTED_DIR = path.join(EVOLUTION_DIR, 'rejected');
const LEDGER_PATH = path.join(PROMOTED_DIR, 'evolution-ledger.json');

function promoteCandidate(proposalId) {
  const proposalPath = path.join(PROPOSALS_DIR, `${proposalId}.json`);
  if (!fs.existsSync(proposalPath)) {
    throw new Error(`Proposal not found: ${proposalPath}`);
  }

  const proposal = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
  const evalPath = path.join(EVALUATIONS_DIR, `${proposal.candidateId}.json`);

  if (!fs.existsSync(evalPath)) {
    throw new Error(`Evaluation report not found for candidate ${proposal.candidateId}. Run replay-engine first!`);
  }

  const evalReport = JSON.parse(fs.readFileSync(evalPath, 'utf8'));
  if (evalReport.status !== 'APPROVED_FOR_QAI_GATE') {
    // Move to rejected
    proposal.governanceStatus = 'rejected';
    fs.writeFileSync(path.join(REJECTED_DIR, `${proposalId}.json`), JSON.stringify(proposal, null, 2), 'utf8');
    fs.unlinkSync(proposalPath);
    throw new Error(`Candidate rejected: Evaluation status is '${evalReport.status}', not 'APPROVED_FOR_QAI_GATE'.`);
  }

  console.log(`\n===============================================================`);
  console.log(`  🔀 GAI PROMOTION GATEKEEPER — MERGING CANDIDATE: ${proposal.candidateId}`);
  console.log(`  Target Scope: .agents/${proposal.targetScope}/`);
  console.log(`  Target File:  ${proposal.targetFile}`);
  console.log(`===============================================================\n`);

  // Apply candidate mutation safely
  const targetFullPath = path.resolve(__dirname, '..', proposal.targetFile);
  const backupDir = path.join(EVOLUTION_DIR, 'backups', proposal.candidateId);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (fs.existsSync(targetFullPath)) {
    fs.copyFileSync(targetFullPath, path.join(backupDir, path.basename(targetFullPath)));
  }

  if (proposal.proposedMutation.diffType === 'add_file' || proposal.proposedMutation.diffType === 'replace_file') {
    const parentDir = path.dirname(targetFullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(targetFullPath, proposal.proposedMutation.content, 'utf8');
  } else if (proposal.proposedMutation.diffType === 'delete_file') {
    if (fs.existsSync(targetFullPath)) {
      fs.unlinkSync(targetFullPath);
    }
  }

  // Update promotion ledger
  const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
  const versionParts = ledger.currentAosVersion.split('.').map(Number);
  versionParts[2] += 1; // Increment patch version
  const newVersion = versionParts.join('.');
  ledger.currentAosVersion = newVersion;

  const promotionEntry = {
    version: newVersion,
    promotedAt: new Date().toISOString(),
    proposalId: proposal.proposalId,
    candidateId: proposal.candidateId,
    targetScope: proposal.targetScope,
    targetFile: proposal.targetFile,
    description: proposal.diagnosis,
    compositeScore: evalReport.avgCandidateScore,
    status: 'active'
  };

  ledger.history.unshift(promotionEntry);
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf8');

  // Move proposal to promoted archive
  proposal.governanceStatus = 'promoted';
  proposal.promotedVersion = newVersion;
  fs.writeFileSync(path.join(PROMOTED_DIR, `${proposalId}.json`), JSON.stringify(proposal, null, 2), 'utf8');
  fs.unlinkSync(proposalPath);

  // Log structured event
  logEvent({
    taskId: proposal.proposalId,
    agent: "GAI",
    event: "RELEASE_COMPLETED",
    state: "released",
    status: "passed",
    artifacts: [proposal.targetFile],
    dependencies: [],
    payload: {
      metrics: {
        score: evalReport.avgCandidateScore,
        delta: evalReport.compositeDelta
      },
      details: {
        newAosVersion: newVersion,
        candidateId: proposal.candidateId
      }
    }
  });

  console.log(`\n🎉 [PROMOTION_SUCCESS] AOS successfully upgraded to v${newVersion}!`);
  return { newVersion, promotionEntry };
}

if (require.main === module) {
  const proposalId = process.argv[2];
  if (!proposalId) {
    console.error("Usage: node promote-candidate.cjs <proposalId>");
    process.exit(1);
  }
  try {
    promoteCandidate(proposalId);
  } catch (err) {
    console.error(`[PROMOTION_ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = { promoteCandidate };
