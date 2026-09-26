import type { MaterializedHttpRequest } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { pickWeightedOperation } from '@/lib/scale/authenticatedHarness/scheduler';
import type {
  HarnessExecutionGate,
  HarnessExecutionPlan,
  SyntheticUserCredentials,
  SyntheticUserPoolFile,
} from '@/lib/scale/authenticatedHarness/types';

export class HarnessExecutionForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HarnessExecutionForbiddenError';
  }
}

export function assertHarnessExecutionAllowed(gate: HarnessExecutionGate): void {
  if (!gate.cliExecuteFlag) {
    throw new HarnessExecutionForbiddenError(
      'Execução de carga não solicitada. Use --validate ou --plan. Para executar: --execute com SCALE_HARNESS_EXECUTE=1 e SCALE_HARNESS_LOAD_TEST_AUTHORIZED=1.',
    );
  }
  if (gate.harnessExecuteEnv !== '1') {
    throw new HarnessExecutionForbiddenError(
      'SCALE_HARNESS_EXECUTE=1 obrigatório no ambiente para execução HTTP do harness.',
    );
  }
  if (gate.loadTestAuthorizedEnv !== '1') {
    throw new HarnessExecutionForbiddenError(
      'LOAD_TEST_AUTHORIZATION não concedida (SCALE_HARNESS_LOAD_TEST_AUTHORIZED≠1).',
    );
  }
}

export type HttpExecutorResult = {
  executed: boolean;
  http_requests_sent: number;
  duration_ms: number;
  notes: string;
};

function buildFetchInit(
  req: MaterializedHttpRequest,
  pool: SyntheticUserPoolFile,
  user: SyntheticUserCredentials,
): RequestInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (req.auth_mode === 'bearer') {
    headers.Authorization = `Bearer ${user.access_token}`;
  } else if (req.auth_mode === 'cookie_session_rsc') {
    headers.Cookie = user.cookie_header ?? '';
  } else if (req.auth_mode === 'supabase_auth_refresh') {
    headers.apikey = pool.supabase_anon_key ?? '';
    headers['Content-Type'] = 'application/json';
  }

  const init: RequestInit = { method: req.method, headers };
  if (req.body && req.method !== 'GET') {
    if (req.auth_mode === 'supabase_auth_refresh') {
      init.body = JSON.stringify({
        ...req.body,
        refresh_token: user.supabase_refresh_token,
      });
    } else {
      init.body = JSON.stringify(req.body);
      headers['Content-Type'] = 'application/json';
    }
  }
  return init;
}

function resolveUrl(pool: SyntheticUserPoolFile, req: MaterializedHttpRequest): string {
  if (req.auth_mode === 'supabase_auth_refresh') {
    const base = pool.supabase_url?.replace(/\/$/, '') ?? '';
    return `${base}/auth/v1/token?grant_type=refresh_token`;
  }
  const base = pool.base_url.replace(/\/$/, '');
  const path = req.url_path.startsWith('/') ? req.url_path : `/${req.url_path}`;
  return `${base}${path}`;
}

async function runSetupForUser(
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  user: SyntheticUserCredentials,
): Promise<void> {
  for (const step of plan.setup_steps) {
    const materialized = materializeOperation(step, pool, user);
    await fetch(resolveUrl(pool, materialized), buildFetchInit(materialized, pool, user));
  }
}

/**
 * Executor HTTP com pacing ~6 req/min/VU e seleção ponderada.
 * Só deve ser chamado após assertHarnessExecutionAllowed e autorização explícita de load test.
 */
export async function runHarnessMeasuredWindow(
  plan: HarnessExecutionPlan,
  pool: SyntheticUserPoolFile,
  options: { durationMs: number },
): Promise<HttpExecutorResult> {
  const started = Date.now();
  const intervalMs = plan.scheduler.interval_ms_per_request;
  const users = pool.users.slice(0, plan.peak_concurrent_users);
  let httpRequestsSent = 0;

  for (const user of users) {
    await runSetupForUser(plan, pool, user);
  }

  const endAt = started + options.durationMs;
  const vuLoops = users.map(async (user) => {
    while (Date.now() < endAt) {
      const op = pickWeightedOperation(plan.measured_operations);
      const step = plan.measured_operations.find((m) => m.operation_id === op.operation_id) ?? op;
      const materialized = materializeOperation(step, pool, user);
      await fetch(resolveUrl(pool, materialized), buildFetchInit(materialized, pool, user));
      httpRequestsSent += 1;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  });

  await Promise.all(vuLoops);

  return {
    executed: true,
    http_requests_sent: httpRequestsSent,
    duration_ms: Date.now() - started,
    notes: 'Janela measured; setup executado uma vez por VU antes do loop.',
  };
}
