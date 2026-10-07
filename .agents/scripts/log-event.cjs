#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Structured Event Logger & Invariant Validator
 * Appends deterministic events to .agents/telemetry/event-ledger.jsonl with auto-pruning.
 */

const fs = require('fs');
const path = require('path');

const validStates = [
  "DISCOVERY", "GOAL_LOCKED", "PLANNED", "WAITING_FOR_HUMAN", "WAITING_FOR_DEPENDENCY", "APPROVED",
  "CONTRACT_LOCKED", "IMPLEMENTING", "VERIFICATION", "RCA_REQUIRED",
  "REFACTORING", "RETRYING", "QUARANTINED", "RELEASED", "FAILED",
  "CANCELLED", "ROLLED_BACK",
  "discovery", "goal_locked", "planned", "contract_locked", "implementing", "verification",
  "blocked", "approved", "released", "rolled_back"
];

const validAgents = ["POAI", "AAI", "UXAI", "Fai", "BAI", "EVAI", "SAI", "QAI", "GAI"];
const MAX_ACTIVE_EVENTS = 500;

function logEvent(eventObj) {
  if (!eventObj.taskId || !eventObj.agent || !eventObj.event || !eventObj.state || !eventObj.status) {
    throw new Error("Missing required event envelope fields: taskId, agent, event, state, status are mandatory.");
  }

  if (!validStates.includes(eventObj.state)) {
    throw new Error(`Invalid TaskState: '${eventObj.state}'. Allowed states: ${validStates.join(', ')}`);
  }

  if (!validAgents.includes(eventObj.agent)) {
    throw new Error(`Invalid AgentRole: '${eventObj.agent}'. Allowed roles: ${validAgents.join(', ')}`);
  }

  const envelope = {
    taskId: eventObj.taskId,
    parentTaskId: eventObj.parentTaskId || null,
    timestamp: eventObj.timestamp || new Date().toISOString(),
    agent: eventObj.agent,
    event: eventObj.event,
    state: eventObj.state,
    artifacts: Array.isArray(eventObj.artifacts) ? eventObj.artifacts : [],
    status: eventObj.status,
    dependencies: Array.isArray(eventObj.dependencies) ? eventObj.dependencies : [],
    payload: eventObj.payload || {}
  };

  const telemetryDir = path.resolve(__dirname, '..', 'telemetry');
  if (!fs.existsSync(telemetryDir)) {
    fs.mkdirSync(telemetryDir, { recursive: true });
  }

  const ledgerPath = path.join(telemetryDir, 'event-ledger.jsonl');
  const archivePath = path.join(telemetryDir, 'event-ledger.archive.jsonl');

  // Check if rotation is needed
  if (fs.existsSync(ledgerPath)) {
    const content = fs.readFileSync(ledgerPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    if (lines.length >= MAX_ACTIVE_EVENTS) {
      const archiveLines = lines.slice(0, lines.length - 250);
      const retainLines = lines.slice(lines.length - 250);
      fs.appendFileSync(archivePath, archiveLines.join('\n') + '\n', 'utf8');
      fs.writeFileSync(ledgerPath, retainLines.join('\n') + '\n', 'utf8');
    }
  }

  fs.appendFileSync(ledgerPath, JSON.stringify(envelope) + '\n', 'utf8');
  console.log(`[EVENT_LOGGED] ${envelope.agent} emitted ${envelope.event} -> State: ${envelope.state} (${envelope.status})`);
  return envelope;
}

if (require.main === module) {
  const rawInput = process.argv[2];
  if (!rawInput) {
    console.error("Usage: node log-event.js '<json_event_string>'");
    process.exit(1);
  }
  try {
    const parsed = JSON.parse(rawInput);
    logEvent(parsed);
  } catch (err) {
    console.error(`[EVENT_ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = { logEvent };
