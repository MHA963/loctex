#!/usr/bin/env node
/**
 * ASP (Aegis Swarm Protocol) - Agent Security Layer & Capability Broker
 * SDK-Aligned 9-Tier Policy Precedence & OS Sandbox Security Engine.
 *
 * Evaluates tool permissions across 9 precedence tiers:
 *   1. Specific Deny
 *   2. Specific Ask User
 *   3. Specific Allow
 *   4. Prefix Wildcard Deny
 *   5. Prefix Wildcard Ask User
 *   6. Prefix Wildcard Allow
 *   7. Global Wildcard Deny
 *   8. Global Wildcard Ask User
 *   9. Global Wildcard Allow
 *
 * Usage:
 *   node .agents/scripts/capability-broker.cjs --check-command "<command>"
 *   node .agents/scripts/capability-broker.cjs --sanitize-input "<raw text>"
 */

const fs = require('fs');
const path = require('path');
const { logEvent } = require('./log-event.cjs');

const POLICY_PATH = path.resolve(__dirname, '..', 'policies', 'security-capability-policy.json');

function loadPolicy() {
  if (!fs.existsSync(POLICY_PATH)) {
    throw new Error(`Security policy not found at: ${POLICY_PATH}`);
  }
  return JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8'));
}

function evaluateToolCapability(toolName, args = {}, agent = 'Specialist') {
  const policy = loadPolicy();
  const tiers = policy.policy_resolution_tiers || {};

  // Tier 1: Specific Deny
  if (tiers.tier_1_specific_deny) {
    for (const rule of tiers.tier_1_specific_deny) {
      if (rule.tool === toolName) {
        if (rule.pattern && args.CommandLine) {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(args.CommandLine)) {
            return { allowed: false, tier: 1, decision: 'deny', reason: rule.reason || 'Blocked by Specific Deny' };
          }
        } else if (!rule.pattern) {
          return { allowed: false, tier: 1, decision: 'deny', reason: rule.reason || 'Blocked by Specific Deny' };
        }
      }
    }
  }

  // Tier 2: Specific Ask User
  if (tiers.tier_2_specific_ask) {
    for (const rule of tiers.tier_2_specific_ask) {
      if (rule.tool === toolName) {
        if (rule.pattern && args.CommandLine) {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(args.CommandLine)) {
            return { allowed: false, tier: 2, decision: 'ask_user', requiresHumanApproval: true, reason: rule.reason || 'Requires Human Sign-off' };
          }
        }
      }
    }
  }

  // Tier 3: Specific Allow
  if (tiers.tier_3_specific_allow) {
    for (const rule of tiers.tier_3_specific_allow) {
      if (rule.tool === toolName) {
        return { allowed: true, tier: 3, decision: 'allow' };
      }
    }
  }

  // Tier 4: Prefix Wildcard Deny
  if (tiers.tier_4_prefix_wildcard_deny) {
    for (const rule of tiers.tier_4_prefix_wildcard_deny) {
      const prefix = rule.prefix.replace('/*', '');
      if (toolName.startsWith(prefix)) {
        return { allowed: false, tier: 4, decision: 'deny', reason: 'Blocked by Prefix Wildcard Deny' };
      }
    }
  }

  // Tier 5: Prefix Wildcard Ask
  if (tiers.tier_5_prefix_wildcard_ask) {
    for (const rule of tiers.tier_5_prefix_wildcard_ask) {
      const prefix = rule.prefix.replace('/*', '');
      if (toolName.startsWith(prefix)) {
        return { allowed: false, tier: 5, decision: 'ask_user', requiresHumanApproval: true, reason: 'Prefix Wildcard requires human sign-off' };
      }
    }
  }

  // Tier 6: Prefix Wildcard Allow
  if (tiers.tier_6_prefix_wildcard_allow) {
    for (const rule of tiers.tier_6_prefix_wildcard_allow) {
      const prefix = rule.prefix.replace('/*', '');
      if (toolName.startsWith(prefix)) {
        return { allowed: true, tier: 6, decision: 'allow' };
      }
    }
  }

  // Tier 7: Global Wildcard Deny
  if (tiers.tier_7_global_wildcard_deny && tiers.tier_7_global_wildcard_deny.length > 0) {
    return { allowed: false, tier: 7, decision: 'deny', reason: 'Global Wildcard Deny active' };
  }

  // Tier 8: Global Wildcard Ask
  if (toolName === 'run_command' && args.CommandLine) {
    const cmd = args.CommandLine.trim();
    const allowlist = policy.command_allowlist?.permitted_prefixes || [];
    const isPermitted = allowlist.some(prefix => cmd.startsWith(prefix));
    if (!isPermitted) {
      return { allowed: false, tier: 8, decision: 'ask_user', requiresHumanApproval: true, reason: `Unrecognized command "${cmd.substring(0, 40)}..." requires human confirmation` };
    }
  }

  // Tier 9: Global Wildcard Allow
  return { allowed: true, tier: 9, decision: 'allow' };
}

function evaluateCommandCapability(commandStr, agent = 'Specialist') {
  const trimmed = commandStr.trim();
  console.log(`[CAPABILITY_BROKER] Evaluating 9-tier policy for: "${trimmed.substring(0, 60)}..." (Agent: ${agent})`);

  const result = evaluateToolCapability('run_command', { CommandLine: trimmed }, agent);

  if (!result.allowed) {
    if (result.decision === 'deny') {
      console.error(`🚨 [SECURITY_VIOLATION] ${result.reason}. BLOCKED.`);
      logEvent({
        taskId: `sec-${Date.now()}`,
        agent: "SAI",
        event: "CAPABILITY_VIOLATION_BLOCKED",
        state: "WAITING_FOR_HUMAN",
        status: "failed",
        artifacts: [],
        dependencies: [],
        payload: { violation: { command: trimmed, reason: result.reason } }
      });
      return { allowed: false, reason: result.reason, requiresHumanApproval: false };
    } else if (result.decision === 'ask_user') {
      console.warn(`⚠️ [APPROVAL_REQUIRED] ${result.reason}`);
      return { allowed: false, reason: result.reason, requiresHumanApproval: true };
    }
  }

  return { allowed: true, requiresHumanApproval: false };
}

function sanitizeUntrustedInput(rawInput) {
  if (typeof rawInput !== 'string') return rawInput;

  let sanitized = rawInput;
  const injectionPatterns = [
    /ignore all previous instructions/gi,
    /disregard system prompt/gi,
    /override your rules/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /\[SYSTEM_PROMPT_OVERRIDE\]/gi
  ];

  let detectedInjections = 0;
  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      detectedInjections++;
      sanitized = sanitized.replace(pattern, '[REDACTED_INJECTION_ATTEMPT]');
    }
  }

  if (detectedInjections > 0) {
    console.warn(`🛡️ [UNTRUSTED_INPUT_GUARD] Redacted ${detectedInjections} potential prompt injection payloads.`);
  }

  return { sanitized, injectionDetected: detectedInjections > 0 };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const cmdIdx = args.indexOf('--check-command');
  const inputIdx = args.indexOf('--sanitize-input');

  if (cmdIdx !== -1) {
    const cmd = args[cmdIdx + 1] || args.slice(cmdIdx + 1).join(' ');
    const res = evaluateCommandCapability(cmd);
    if (!res.allowed) process.exit(1);
    process.exit(0);
  }

  if (inputIdx !== -1) {
    const raw = args[inputIdx + 1] || '';
    const res = sanitizeUntrustedInput(raw);
    console.log(res.sanitized);
    process.exit(0);
  }

  console.log("Usage: node capability-broker.cjs --check-command '<cmd>' | --sanitize-input '<text>'");
}

module.exports = { evaluateToolCapability, evaluateCommandCapability, sanitizeUntrustedInput };
