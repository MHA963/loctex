/**
 * ASP (Aegis Swarm Protocol) - Operational Finite State Machine Protocol (SDK-Aligned Edition)
 * 
 * Machine-enforced execution semantics across 17 discrete operational states with
 * preconditions, postconditions, owners, timeouts, retry policies, budget constraints,
 * and 9-tier safety precedence policies.
 */

export type OperationalState =
  | "DISCOVERY"               // POAI actively probing user intent, domain requirements, and constraints
  | "GOAL_LOCKED"             // User confirmed goal, stack, non-functional budgets, and Definition of Done
  | "PLANNED"                 // Decomposed into atomic tasks, owners, and dependency graph
  | "WAITING_FOR_HUMAN"       // Blocked on mandatory human-in-the-loop sign-off (mockup/architectural/destructive approval)
  | "WAITING_FOR_DEPENDENCY"  // Suspended awaiting upstream prerequisite task completion
  | "APPROVED"                // Human or automated gate sign-off recorded
  | "CONTRACT_LOCKED"         // Versioned contracts (Zod, Pydantic, Protobuf, OpenAPI, CLI args) frozen and validated
  | "IMPLEMENTING"            // Specialist agents executing in isolated worktree branches
  | "VERIFICATION"            // Running progressive quality gates (unit, integration, security, E2E, benchmarks)
  | "RCA_REQUIRED"            // Verification failed: mandatory Root Cause Analysis triggered
  | "REFACTORING"             // Targeted remediations applied based on RCA classification
  | "RETRYING"                // Automatic retry attempt under exponential backoff policy
  | "QUARANTINED"             // Non-deterministic test or defective fixture quarantined with evidence
  | "RELEASED"                // All quality gates passed, worktree merged, SemVer tagged
  | "FAILED"                  // Unrecoverable failure or maximum retry budget exceeded
  | "CANCELLED"               // Explicitly aborted by user or orchestrator
  | "ROLLED_BACK";            // Safely reverted due to migration conflict or canary regression

export type AgentRole =
  | "POAI"  // Product Owner & Orchestrator (Interactive / Probing)
  | "AAI"   // Architecture, Schema & Contracts (Autonomous)
  | "UXAI"  // UI/UX & HCI Design Specialist (Interactive Mockups)
  | "Fai"   // Frontend, TUI & GUI Interaction Engineer (Autonomous)
  | "BAI"   // Systems, Backend & Core Algorithms Engineer (Autonomous)
  | "EVAI"  // Evolution, Evaluation, ML & AI Capability (Autonomous)
  | "SAI"   // Security, AST Auditing & Sandboxing (Autonomous)
  | "QAI"   // QA, Benchmarks & Test Verification (Autonomous)
  | "GAI";  // Release, Packaging & Git Quality (Autonomous)

export type AgentBehaviorMode = "interactive" | "autonomous";

export interface SubagentScoping {
  max_subagent_depth: number;
  allowed_subagents: AgentRole[];
  enable_subagents: boolean;
}

export interface BudgetConfig {
  max_model_calls?: number;
  max_tool_calls?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  max_total_tokens?: number;
}

export type PolicyPriorityTier =
  | 1 // Specific Deny
  | 2 // Specific Ask
  | 3 // Specific Allow
  | 4 // Prefix Wildcard Deny
  | 5 // Prefix Wildcard Ask
  | 6 // Prefix Wildcard Allow
  | 7 // Global Wildcard Deny
  | 8 // Global Wildcard Ask
  | 9; // Global Wildcard Allow

export interface SafetyPolicyRule {
  tier: PolicyPriorityTier;
  pattern: string;
  action: "allow" | "deny" | "ask_user";
  target_tool?: string;
  target_server?: string;
  when?: (args: Record<string, unknown>) => boolean;
  fail_closed?: boolean;
}

export type OperationalEvent =
  | "GOAL_DISCOVERY_STARTED"
  | "GOAL_PROBING_INTERVIEW_COMPLETED"
  | "GOAL_LOCKED"
  | "TASK_PLANNED"
  | "MOCKUP_GENERATED"
  | "HUMAN_APPROVAL_REQUESTED"
  | "HUMAN_APPROVED"
  | "HUMAN_REJECTED"
  | "DEPENDENCY_RESOLVED"
  | "DEPENDENCY_BLOCKED"
  | "CONTRACT_LOCKED"
  | "CONTRACT_VERSION_BUMPED"
  | "IMPLEMENTATION_STARTED"
  | "IMPLEMENTATION_COMPLETED"
  | "VERIFICATION_STARTED"
  | "VERIFICATION_PASSED"
  | "VERIFICATION_FAILED"
  | "RCA_CLASSIFIED"
  | "REFACTOR_STARTED"
  | "RETRY_TRIGGERED"
  | "TEST_QUARANTINED"
  | "SECURITY_SCAN_PASSED"
  | "SECURITY_SCAN_FAILED"
  | "CAPABILITY_VIOLATION_BLOCKED"
  | "RELEASE_READY"
  | "RELEASE_COMPLETED"
  | "TASK_CANCELLED"
  | "TASK_FAILED"
  | "TASK_ROLLED_BACK";

export interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: "immediate" | "linear" | "exponential";
  initial_delay_ms: number;
  max_delay_ms: number;
}

export interface StateTransitionRule {
  fromState: OperationalState;
  toState: OperationalState;
  transitionEvent: OperationalEvent;
  owner: AgentRole;
  preconditions: string[];
  postconditions: string[];
  timeout_ms: number;
  retryPolicy?: RetryPolicy;
  compensationAction?: string;
}

export interface FailureClassification {
  category: "PRODUCT_BUG" | "TEST_BUG" | "ENVIRONMENT_ISSUE" | "FLAKY";
  evidence: {
    stackTrace?: string;
    failingAssertion?: string;
    contractVersion?: string;
    timingDistributionMs?: number[];
    isDeterministic: boolean;
  };
  remediation: {
    allowedTarget: "implementation" | "test" | "infrastructure";
    requiresDualApproval: boolean;
    quarantineRequired: boolean;
    stopHookDecision: "CONTINUE" | "ALLOW_STOP";
  };
}
