#!/usr/bin/env node
/**
 * AOS Structured Event Query CLI
 * 
 * Allows POAI and specialist agents to query recent telemetry events
 * without loading the entire event ledger into the prompt context.
 * 
 * Usage:
 *   node query-events.js --last 10
 *   node query-events.js --taskId task-auth-001
 *   node query-events.js --parentTaskId epic-identity-v2
 *   node query-events.js --state blocked
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const ledgerPath = path.resolve(__dirname, '..', 'telemetry', 'event-ledger.jsonl');

if (!fs.existsSync(ledgerPath)) {
  console.log(JSON.stringify({ events: [], count: 0 }));
  process.exit(0);
}

const lines = fs.readFileSync(ledgerPath, 'utf8').trim().split('\n').filter(Boolean);
let events = lines.map(line => {
  try { return JSON.parse(line); } catch { return null; }
}).filter(Boolean);

let limit = 20;
let filterTaskId = null;
let filterParentId = null;
let filterState = null;
let filterAgent = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--last' && args[i + 1]) limit = parseInt(args[++i], 10);
  if (args[i] === '--taskId' && args[i + 1]) filterTaskId = args[++i];
  if (args[i] === '--parentTaskId' && args[i + 1]) filterParentId = args[++i];
  if (args[i] === '--state' && args[i + 1]) filterState = args[++i];
  if (args[i] === '--agent' && args[i + 1]) filterAgent = args[++i];
}

if (filterTaskId) events = events.filter(e => e.taskId === filterTaskId);
if (filterParentId) events = events.filter(e => e.parentTaskId === filterParentId);
if (filterState) events = events.filter(e => e.state === filterState);
if (filterAgent) events = events.filter(e => e.agent === filterAgent);

const result = events.slice(-limit);
console.log(JSON.stringify({ events: result, count: result.length }, null, 2));
