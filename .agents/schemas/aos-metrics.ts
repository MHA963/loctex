/**
 * ASP (Aegis Swarm Protocol) - Quantitative Evaluation & Evolution Metrics
 * 
 * Objective mathematical metrics measured deterministically across benchmark replay suites.
 * Eliminates subjective self-reporting in favor of verifiable empirical data.
 */

export interface AOSExecutionMetrics {
  /** Percentage of tasks reaching state: 'released' (0.0 - 1.0) */
  task_success_rate: number;

  /** Percentage of unit, integration, and E2E assertions passed (0.0 - 1.0) */
  test_pass_rate: number;

  /** Percentage of runs introducing regressions on historical benchmark fixtures (0.0 - 1.0) */
  regression_rate: number;

  /** Frequency of manual human interventions, clarifications, or corrections per 10 tasks */
  human_correction_rate: number;

  /** Total retry/refactoring loops required before all hooks exit with code 0 */
  retry_count: number;

  /** Rate of tool execution failures or invalid tool arguments (0.0 - 1.0) */
  tool_error_rate: number;

  /** Total input + output tokens consumed during task execution */
  token_usage: number;

  /** Wall-clock execution time in milliseconds */
  execution_time_ms: number;

  /** Estimated inference + tool runtime cost in USD */
  cost_estimate_usd: number;
}

export interface BenchmarkComparison {
  benchmarkId: string;
  benchmarkName: string;
  domain: "frontend" | "backend" | "architecture" | "security" | "regression";
  baselineMetrics: AOSExecutionMetrics;
  candidateMetrics: AOSExecutionMetrics;
  delta: {
    testPassRateDelta: number;
    regressionRateDelta: number;
    tokenEfficiencyGainPct: number;
    speedupPct: number;
    retryReductionPct: number;
    compositeScoreDelta: number;
  };
  passed: boolean;
  notes: string[];
}

export interface EvolutionDecision {
  candidateId: string;
  proposalId: string;
  targetScope: "skills" | "rules" | "custom-agents" | "policies";
  baselineCompositeScore: number;
  candidateCompositeScore: number;
  compositeDelta: number;
  status: "APPROVED_FOR_QAI_GATE" | "REJECTED_REGRESSION" | "INSUFFICIENT_DELTA";
  summary: string;
  benchmarksRun: number;
  benchmarksPassed: number;
  timestamp: string;
}
