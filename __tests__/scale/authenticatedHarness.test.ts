import { assertPoolBoundToApprovedStaging } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import {
  assertHarnessExecutionAllowed,
  HarnessExecutionForbiddenError,
} from '@/lib/scale/authenticatedHarness/execute';
import { HarnessMetricsCollector } from '@/lib/scale/authenticatedHarness/metrics';
import { runSimuladoSetupStep } from '@/lib/scale/authenticatedHarness/simuladoSetup';
import { executeMaterializedRequest } from '@/lib/scale/authenticatedHarness/httpExecute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { parseSimuladoSessionSetupResponse, SimuladoSetupParseError } from '@/lib/scale/authenticatedHarness/parseSimuladoSession';
import { computeVuStaggerMs } from '@/lib/scale/authenticatedHarness/pacing';
import { assertPlanHasNoRawSecrets, redactSecretsDeep } from '@/lib/scale/authenticatedHarness/redact';
import { validateStagingTargetBinding } from '@/lib/scale/authenticatedHarness/targetBinding';
import {
  PoolValidationError,
  validatePoolCardinality,
  validatePoolIdentityUniqueness,
  validateUserCredentialsForOperations,
} from '@/lib/scale/authenticatedHarness/validatePool';
import { validateEnvelopeIntegrity } from '@/lib/scale/authenticatedHarness/validateEnvelope';
import { createVuRuntimeState, toMaterializeUser } from '@/lib/scale/authenticatedHarness/vuRuntime';
import type { HarnessOperationStep, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

const approved = {
  schema_version: 1,
  app_hosts: ['127.0.0.1'],
  supabase_hosts: ['example.supabase.co'],
};

function makePool(userCount: number, overrides?: Partial<SyntheticUserPoolFile>): SyntheticUserPoolFile {
  const users = Array.from({ length: userCount }, (_, i) => ({
    pool_id: `u${i + 1}`,
    access_token: `token-${i}`,
    cookie_header: `cookie=${i}`,
    default_questao_slug: 'slug-demo',
    default_opcao_id: 'A',
    supabase_refresh_token: `refresh-${i}`,
  }));
  return {
    schema_version: 1,
    target_environment: 'staging',
    base_url: 'http://127.0.0.1:3000',
    supabase_url: 'https://example.supabase.co',
    supabase_anon_key: 'anon-placeholder',
    users,
    ...overrides,
  };
}

describe('scale authenticated harness', () => {
  it('valida envelope aprovado v1.0.3', () => {
    const report = validateEnvelopeIntegrity();
    expect(report.ok).toBe(true);
    expect(report.checks.envelope_status).toBe('approved');
  });

  it('rejeita pool_size < CCU', () => {
    expect(() => validatePoolCardinality(makePool(1), 50)).toThrow(PoolValidationError);
  });

  it('binding independente: host production não passa na allowlist versionada', () => {
    const pool = makePool(1, {
      base_url: 'https://avant.enf.br',
      allowed_hosts: ['avant.enf.br'],
    });
    expect(() => assertPoolBoundToApprovedStaging(pool, approved)).toThrow(/allowlist aprovada/);
    expect(validateStagingTargetBinding(pool).ok).toBe(false);
  });

  it('rejeita supabase fora da allowlist', () => {
    const pool = makePool(1, { supabase_url: 'https://evil.supabase.co' });
    expect(() => assertPoolBoundToApprovedStaging(pool, approved)).toThrow(/supabase_url host/);
  });

  it('parse setup simulado exige session.id e questoes[0].modulo_slug', () => {
    const ok = parseSimuladoSessionSetupResponse({
      success: true,
      session: { id: 'sess-1' },
      questoes: [{ modulo_slug: 'q-slug', ordem: 1 }],
    });
    expect(ok).toEqual({ session_id: 'sess-1', modulo_slug: 'q-slug' });
    expect(() =>
      parseSimuladoSessionSetupResponse({ success: true, session: { id: 'x' }, questoes: [] }),
    ).toThrow(SimuladoSetupParseError);
  });

  it('setup simulado 2xx persiste session_id e modulo_slug no VU', async () => {
    const pool = makePool(1);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool: makePool(50) });
    const state = createVuRuntimeState(pool.users[0]);
    const metrics = new HarnessMetricsCollector();
    const setupJson = {
      success: true,
      session: { id: 'uuid-sess' },
      questoes: [{ modulo_slug: 'mod-slug', ordem: 1 }],
    };
    await runSimuladoSetupStep(
      plan,
      pool,
      state,
      metrics,
      async () =>
        ({
          status: 200,
          json: async () => setupJson,
        }) as Response,
    );
    expect(state.simulado_session_id).toBe('uuid-sess');
    expect(state.simulado_modulo_slug).toBe('mod-slug');
  });

  it('setup simulado non-2xx falha', async () => {
    const pool = makePool(1);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool: makePool(50) });
    const state = createVuRuntimeState(pool.users[0]);
    const metrics = new HarnessMetricsCollector();
    await expect(
      runSimuladoSetupStep(plan, pool, state, metrics, async () => ({ status: 500, json: async () => ({}) }) as Response),
    ).rejects.toThrow(/Setup simulado HTTP 500/);
  });

  it('RSC redirect manual não conta como sucesso', async () => {
    const pool = makePool(1);
    const state = createVuRuntimeState(pool.users[0]);
    const outcome = await executeMaterializedRequest(
      pool,
      state,
      {
        operation_id: 'rsc_desempenho',
        phase: 'measured',
        method: 'GET',
        url_path: '/desempenho',
        auth_mode: 'cookie_session_rsc',
      },
      async () =>
        ({
          status: 302,
          headers: { get: () => '/login' },
          url: 'http://127.0.0.1:3000/login',
        }) as unknown as Response,
    );
    expect(outcome.ok).toBe(false);
    expect(outcome.error_kind).toBe('redirect');
  });

  it('métricas calculam p95 por operação', () => {
    const m = new HarnessMetricsCollector();
    for (let i = 1; i <= 100; i++) {
      m.recordRequest('measured', 'api_vitrine_page', 'read', 200, i, true);
    }
    const report = m.buildReport({
      phase: 'measured',
      elapsedMs: 10_000,
      targetMeanRps: 5,
      httpRequestsSent: 100,
    });
    const vitrine = report.operations.find((o) => o.operation_id === 'api_vitrine_page');
    expect(vitrine?.p95_ms).toBeGreaterThanOrEqual(95);
    expect(vitrine?.requests).toBe(100);
  });

  it('stagger distribui VUs no intervalo', () => {
    expect(computeVuStaggerMs(0, 50, 10_000)).toBe(0);
    expect(computeVuStaggerMs(25, 50, 10_000)).toBe(5000);
  });

  it('bloqueia execução sem flags', () => {
    expect(() =>
      assertHarnessExecutionAllowed({
        cliExecuteFlag: true,
        harnessExecuteEnv: '1',
        loadTestAuthorizedEnv: undefined,
      }),
    ).toThrow(HarnessExecutionForbiddenError);
  });

  it('redige credenciais no plano serializado', () => {
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const serialized = JSON.stringify(redactSecretsDeep({ pool, plan }));
    assertPlanHasNoRawSecrets(serialized);
    expect(serialized).not.toContain('token-0');
  });

  it('exige cookie e slug para RSC', () => {
    const pool = makePool(1);
    const user = { ...pool.users[0], cookie_header: '' };
    const measured: HarnessOperationStep[] = [
      {
        operation_id: 'rsc_estudar_slug',
        phase: 'measured',
        auth: 'cookie_session_rsc',
        method: 'GET',
        path: '/estudar/x',
        request_weight: 1,
        kind: 'read',
      },
    ];
    expect(() =>
      validateUserCredentialsForOperations(user, pool, measured, {
        requireRefreshToken: false,
        simuladoSetupInHarness: true,
      }),
    ).toThrow(/cookie_header/);
  });
});
