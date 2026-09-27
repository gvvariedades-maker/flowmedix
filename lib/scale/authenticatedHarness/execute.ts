import {
  assertPoolBoundToApprovedStaging,
  type ApprovedStagingTarget,
} from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import type { CanonicalArtifactBinding } from '@/lib/scale/authenticatedHarness/canonicalArtifacts';
import {
  buildAuthorizedExecutionContext,
  type HarnessAuthorizedExecutionContext,
  type HarnessExecutionGate,
  HarnessExecutionForbiddenError,
} from '@/lib/scale/authenticatedHarness/executionAuthorization';
import type { FetchLike, HarnessHttpTransportOptions } from '@/lib/scale/authenticatedHarness/httpExecute';
import { executeMaterializedRequest } from '@/lib/scale/authenticatedHarness/httpExecute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { HarnessMetricsCollector } from '@/lib/scale/authenticatedHarness/metrics';
import { computeVuStaggerMs, sleepUntilNextStartToStart } from '@/lib/scale/authenticatedHarness/pacing';
import { pickWeightedOperation } from '@/lib/scale/authenticatedHarness/scheduler';
import { runSimuladoSetupStep } from '@/lib/scale/authenticatedHarness/simuladoSetup';
import type { ConcurrencyTierId } from '@/lib/scale/workloadEnvelope';
import type { HarnessExecutionPlan, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { createVuRuntimeState, toMaterializeUser, type VuRuntimeState } from '@/lib/scale/authenticatedHarness/vuRuntime';

export {
  HarnessExecutionForbiddenError,
  type HarnessExecutionGate,
  type HarnessLoadTestScope,
  parseLoadTestScopeFromEnv,
  assertScopeMatchesRun,
  assertHarnessExecutionGate,
  assertScopeMatchesCanonicalArtifacts,
} from '@/lib/scale/authenticatedHarness/executionAuthorization';

export type HttpExecutorResult = {
  executed: boolean;
  setup_elapsed_ms: number;
  measured_elapsed_ms: number;
  http_requests_sent: number;
  metrics: ReturnType<HarnessMetricsCollector['buildReport']>;
  notes: string;
};

async function runAllSetup(
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  states: VuRuntimeState[],
  metrics: HarnessMetricsCollector,
  fetchImpl: FetchLike,
  transport: HarnessHttpTransportOptions,
): Promise<void> {
  for (const state of states) {
    if (plan.setup_steps.some((s) => s.operation_id === 'api_simulado_sessions_create')) {
      await runSimuladoSetupStep(plan, pool, state, metrics, fetchImpl, transport);
    }
    for (const step of plan.setup_steps.filter((s) => s.operation_id !== 'api_simulado_sessions_create')) {
      const materialized = materializeOperation(step, pool, toMaterializeUser(state));
      const outcome = await executeMaterializedRequest(pool, state, materialized, fetchImpl, transport);
      metrics.recordRequest(
        'setup',
        step.operation_id,
        'write',
        outcome.status,
        outcome.latency_ms,
        outcome.ok,
      );
      if (!outcome.ok) {
        metrics.recordSetupFailure();
        throw new Error(`Setup falhou: ${step.operation_id}`);
      }
    }
  }
}

async function runMeasuredWindowHttp(
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  options: { durationMs: number; fetchImpl?: FetchLike; httpTransport: HarnessHttpTransportOptions },
): Promise<HttpExecutorResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const metrics = new HarnessMetricsCollector();
  const setupStarted = Date.now();
  const users = pool.users.slice(0, plan.peak_concurrent_users);
  const states = users.map((u) => createVuRuntimeState(u));

  await runAllSetup(plan, pool, states, metrics, fetchImpl, options.httpTransport);
  const setupElapsed = Date.now() - setupStarted;

  const measuredStartedAt = Date.now();
  const measuredEndAt = measuredStartedAt + options.durationMs;
  const intervalMs = plan.scheduler.interval_ms_per_request;
  let httpRequestsSent = 0;

  const vuLoops = states.map(async (state, vuIndex) => {
    const stagger = computeVuStaggerMs(vuIndex, states.length, intervalMs);
    if (stagger > 0) {
      await new Promise((r) => setTimeout(r, stagger));
    }
    let nextStartAt = Date.now();
    while (nextStartAt < measuredEndAt) {
      await sleepUntilNextStartToStart(nextStartAt);
      const started = Date.now();
      if (started >= measuredEndAt) break;

      const op = pickWeightedOperation(plan.measured_operations);
      const step = plan.measured_operations.find((m) => m.operation_id === op.operation_id) ?? op;
      const materialized = materializeOperation(step, pool, toMaterializeUser(state));
      const outcome = await executeMaterializedRequest(
        pool,
        state,
        materialized,
        fetchImpl,
        options.httpTransport,
      );
      metrics.recordRequest(
        'measured',
        step.operation_id,
        step.kind,
        outcome.status,
        outcome.latency_ms,
        outcome.ok,
      );
      httpRequestsSent += 1;
      nextStartAt = started + intervalMs;
    }
  });

  await Promise.all(vuLoops);
  const measuredElapsed = Date.now() - measuredStartedAt;

  const report = metrics.buildReport({
    phase: 'measured',
    elapsedMs: measuredElapsed,
    targetMeanRps: plan.target_mean_rps,
    httpRequestsSent,
  });

  return {
    executed: true,
    setup_elapsed_ms: setupElapsed,
    measured_elapsed_ms: measuredElapsed,
    http_requests_sent: httpRequestsSent,
    metrics: report,
    notes:
      'Setup fora da janela measured; RSC=cookie estático pré-provisionado (refresh não reescreve cookie SSR).',
  };
}

/**
 * Único entrypoint público para HTTP de carga — exige contexto autorizado (gate + escopo + artefatos canônicos).
 */
export async function runHarnessMeasuredWindowAuthorized(
  auth: HarnessAuthorizedExecutionContext,
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  options: { durationMs: number; fetchImpl?: FetchLike },
): Promise<HttpExecutorResult> {
  assertPoolBoundToApprovedStaging(pool, auth.approved);
  if (options.durationMs !== auth.scope.duration_ms) {
    throw new HarnessExecutionForbiddenError(
      `duration_ms (${options.durationMs}) ≠ escopo autorizado (${auth.scope.duration_ms})`,
    );
  }
  if (plan.tier !== auth.scope.tier) {
    throw new HarnessExecutionForbiddenError(`plan.tier (${plan.tier}) ≠ escopo (${auth.scope.tier})`);
  }
  return runMeasuredWindowHttp(plan, pool, {
    durationMs: options.durationMs,
    fetchImpl: options.fetchImpl,
    httpTransport: auth.httpTransport,
  });
}

export function createAuthorizedExecutionContext(options: {
  gate: HarnessExecutionGate;
  env: NodeJS.ProcessEnv;
  runtimeGitSha: string;
  cliTier: ConcurrencyTierId;
  durationMs: number;
  plan: HarnessExecutionPlan;
  pool: SyntheticUserPoolFile;
  approved: ApprovedStagingTarget;
  canonical: CanonicalArtifactBinding;
  gitWorktreePorcelain?: string;
}): HarnessAuthorizedExecutionContext {
  return buildAuthorizedExecutionContext(options);
}

/** @deprecated Não exportar para novos callers — dispara erro se usado. */
export async function runHarnessMeasuredWindow(): Promise<HttpExecutorResult> {
  throw new HarnessExecutionForbiddenError(
    'runHarnessMeasuredWindow foi removido; use runHarnessMeasuredWindowAuthorized com escopo validado.',
  );
}
