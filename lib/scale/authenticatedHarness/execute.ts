import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import type { FetchLike } from '@/lib/scale/authenticatedHarness/httpExecute';
import { executeMaterializedRequest } from '@/lib/scale/authenticatedHarness/httpExecute';
import { HarnessMetricsCollector } from '@/lib/scale/authenticatedHarness/metrics';
import { runSimuladoSetupStep } from '@/lib/scale/authenticatedHarness/simuladoSetup';
import { computeVuStaggerMs, sleepUntilNextStartToStart } from '@/lib/scale/authenticatedHarness/pacing';
import { pickWeightedOperation } from '@/lib/scale/authenticatedHarness/scheduler';
import type {
  HarnessExecutionGate,
  HarnessExecutionPlan,
  SyntheticUserPoolFile,
} from '@/lib/scale/authenticatedHarness/types';
import { createVuRuntimeState, toMaterializeUser, type VuRuntimeState } from '@/lib/scale/authenticatedHarness/vuRuntime';

export class HarnessExecutionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HarnessExecutionForbiddenError';
  }
}

export function assertHarnessExecutionAllowed(gate: HarnessExecutionGate): void {
  if (!gate.cliExecuteFlag) {
    throw new HarnessExecutionForbiddenError(
      'Execução de carga não solicitada. Use --validate ou --plan.',
    );
  }
  if (gate.harnessExecuteEnv !== '1') {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_EXECUTE=1 obrigatório.');
  }
  if (gate.loadTestAuthorizedEnv !== '1') {
    throw new HarnessExecutionForbiddenError('SCALE_HARNESS_LOAD_TEST_AUTHORIZED≠1.');
  }
}

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
): Promise<void> {
  for (const state of states) {
    if (plan.setup_steps.some((s) => s.operation_id === 'api_simulado_sessions_create')) {
      await runSimuladoSetupStep(plan, pool, state, metrics, fetchImpl);
    }
    for (const step of plan.setup_steps.filter((s) => s.operation_id !== 'api_simulado_sessions_create')) {
      const materialized = materializeOperation(step, pool, toMaterializeUser(state));
      const outcome = await executeMaterializedRequest(pool, state, materialized, fetchImpl);
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

export async function runHarnessMeasuredWindow(
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  options: { durationMs: number; fetchImpl?: FetchLike },
): Promise<HttpExecutorResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const metrics = new HarnessMetricsCollector();
  const setupStarted = Date.now();
  const users = pool.users.slice(0, plan.peak_concurrent_users);
  const states = users.map((u) => createVuRuntimeState(u));

  await runAllSetup(plan, pool, states, metrics, fetchImpl);
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
      const step =
        plan.measured_operations.find((m) => m.operation_id === op.operation_id) ?? op;
      const materialized = materializeOperation(step, pool, toMaterializeUser(state));
      const outcome = await executeMaterializedRequest(pool, state, materialized, fetchImpl);
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
      'Setup fora da janela measured; pacing start-to-start com stagger; RSC redirect: manual.',
  };
}
