#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Human Correction & /learn Distillation Engine
 * Transforms human corrections & debugging resolutions into validated Evolution Proposals.
 *
 * Usage:
 *   node .agents/scripts/extract-human-correction.cjs --context "<correction text>" [--scope <skills|rules|custom-agents|policies>]
 */

const fs = require('fs');
const path = require('path');
const { logEvent } = require('./log-event.cjs');

const EVOLUTION_DIR = path.resolve(__dirname, '..', 'evolution');
const PROPOSALS_DIR = path.join(EVOLUTION_DIR, 'proposals');

function extractCorrectionProposal(correctionText, targetScope = 'rules', targetFile = 'rules/01-core-principles.md') {
  if (!correctionText) {
    throw new Error("Missing correction text context.");
  }

  const timestamp = new Date().toISOString();
  const proposalId = `prop-learn-${Date.now()}`;
  const candidateId = `cand-${proposalId}`;

  const proposal = {
    proposalId,
    candidateId,
    timestamp,
    trigger: "human_correction",
    diagnosis: `Human user correction captured: "${correctionText.substring(0, 120)}..."`,
    targetScope,
    targetFile,
    proposedMutation: {
      diffType: "patch_content",
      content: `\n### 🛡️ Human-Learned Invariant (${timestamp.split('T')[0]}):\n- ${correctionText}\n`
    },
    rationale: "Distilled from direct human pairing correction via Antigravity /learn protocol.",
    governanceStatus: "proposed"
  };

  if (!fs.existsSync(PROPOSALS_DIR)) {
    fs.mkdirSync(PROPOSALS_DIR, { recursive: true });
  }

  const proposalPath = path.join(PROPOSALS_DIR, `${proposalId}.json`);
  fs.writeFileSync(proposalPath, JSON.stringify(proposal, null, 2), 'utf8');

  logEvent({
    taskId: proposalId,
    agent: "EVAI",
    event: "TASK_PLANNED",
    state: "planned",
    status: "in_progress",
    artifacts: [`evolution/proposals/${proposalId}.json`],
    dependencies: [],
    payload: {
      details: {
        trigger: "human_correction",
        proposalId,
        candidateId
      }
    }
  });

  console.log(`\n===============================================================`);
  console.log(`  🧠 EVAI HUMAN CORRECTION DISTILLATION COMPLETE`);
  console.log(`  Proposal ID: ${proposalId}`);
  console.log(`  Target File: .agents/${targetFile}`);
  console.log(`  Proposal saved to: ${proposalPath}`);
  console.log(`===============================================================\n`);

  return proposal;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const contextIdx = args.indexOf('--context');
  const scopeIdx = args.indexOf('--scope');
  const fileIdx = args.indexOf('--file');

  const context = contextIdx !== -1 ? args[contextIdx + 1] : args[0];
  const scope = scopeIdx !== -1 ? args[scopeIdx + 1] : 'rules';
  const file = fileIdx !== -1 ? args[fileIdx + 1] : 'rules/01-core-principles.md';

  if (!context) {
    console.error("Usage: node extract-human-correction.cjs --context '<correction>' [--scope <rules|skills|custom-agents|policies>] [--file <relPath>]");
    process.exit(1);
  }

  try {
    extractCorrectionProposal(context, scope, file);
  } catch (err) {
    console.error(`[EXTRACTION_ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = { extractCorrectionProposal };
