import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import type { FetchLike } from '@/lib/scale/authenticatedHarness/httpExecute';
import { resolveRequestUrl } from '@/lib/scale/authenticatedHarness/httpExecute';
import type { HarnessMetricsCollector } from '@/lib/scale/authenticatedHarness/metrics';
import { parseSimuladoSessionSetupResponse } from '@/lib/scale/authenticatedHarness/parseSimuladoSession';
import type { HarnessExecutionPlan, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { toMaterializeUser, type VuRuntimeState } from '@/lib/scale/authenticatedHarness/vuRuntime';

export async function runSimuladoSetupStep(
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  state: VuRuntimeState,
  metrics: HarnessMetricsCollector,
  fetchImpl: FetchLike,
): Promise<void> {
  const step = plan.setup_steps.find((s) => s.operation_id === 'api_simulado_sessions_create');
  if (!step) return;

  const materialized = materializeOperation(step, pool, toMaterializeUser(state));
  const url = resolveRequestUrl(pool, materialized);
  const started = Date.now();
  const response = await fetchImpl(url, {
    method: materialized.method,
    headers: {
      Authorization: `Bearer ${state.access_token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(materialized.body ?? {}),
  });
  const latency_ms = Date.now() - started;
  const ok = response.status >= 200 && response.status < 300;
  metrics.recordRequest('setup', step.operation_id, 'write', response.status, latency_ms, ok);
  if (!ok) {
    metrics.recordSetupFailure();
    throw new Error(`Setup simulado HTTP ${response.status}`);
  }
  const json = (await response.json()) as Record<string, unknown>;
  const parsed = parseSimuladoSessionSetupResponse(
    json as Parameters<typeof parseSimuladoSessionSetupResponse>[0],
  );
  state.simulado_session_id = parsed.session_id;
  state.simulado_modulo_slug = parsed.modulo_slug;
}
