import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import {
  assertHarnessExecutionAllowed,
  HarnessExecutionForbiddenError,
} from '@/lib/scale/authenticatedHarness/execute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { assertPlanHasNoRawSecrets, redactSecretsDeep } from '@/lib/scale/authenticatedHarness/redact';
import { pickWeightedOperation } from '@/lib/scale/authenticatedHarness/scheduler';
import { validateStagingTargetBinding } from '@/lib/scale/authenticatedHarness/targetBinding';
import {
  PoolValidationError,
  validatePoolCardinality,
  validatePoolIdentityUniqueness,
  validateUserCredentialsForOperations,
} from '@/lib/scale/authenticatedHarness/validatePool';
import { validateEnvelopeIntegrity } from '@/lib/scale/authenticatedHarness/validateEnvelope';
import type { HarnessOperationStep, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

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
    allowed_hosts: ['127.0.0.1'],
    base_url: 'http://127.0.0.1:3000',
    supabase_url: 'https://example.supabase.co',
    supabase_anon_key: 'anon-placeholder',
    users,
    ...overrides,
  };
}

const measuredSample: HarnessOperationStep[] = [
  {
    operation_id: 'rsc_estudar_slug',
    phase: 'measured',
    auth: 'cookie_session_rsc',
    method: 'GET',
    path: '/estudar/{slug}',
    request_weight: 0.5,
    kind: 'read',
  },
];

describe('scale authenticated harness', () => {
  it('valida envelope aprovado v1.0.3', () => {
    const report = validateEnvelopeIntegrity();
    expect(report.ok).toBe(true);
    expect(report.checks.envelope_status).toBe('approved');
  });

  it('rejeita pool_size < CCU', () => {
    const pool = makePool(1);
    expect(() => validatePoolCardinality(pool, 50)).toThrow(PoolValidationError);
  });

  it('rejeita pool_id duplicado e token compartilhado', () => {
    const pool = makePool(2);
    pool.users[1].pool_id = pool.users[0].pool_id;
    expect(() => validatePoolIdentityUniqueness(pool)).toThrow(/pool_id duplicado/);
    pool.users[1].pool_id = 'u2';
    pool.users[1].access_token = pool.users[0].access_token;
    expect(() => validatePoolIdentityUniqueness(pool)).toThrow(/access_token compartilhado/);
  });

  it('exige cookie e slug para RSC/player', () => {
    const pool = makePool(1);
    const user = { ...pool.users[0], cookie_header: '', default_questao_slug: '' };
    expect(() =>
      validateUserCredentialsForOperations(user, pool, measuredSample, {
        requireRefreshToken: false,
        simuladoSetupInHarness: true,
      }),
    ).toThrow(/cookie_header/);
    user.cookie_header = 'c=1';
    expect(() =>
      validateUserCredentialsForOperations(user, pool, measuredSample, {
        requireRefreshToken: false,
        simuladoSetupInHarness: true,
      }),
    ).toThrow(/default_questao_slug/);
  });

  it('monta plano nominal com 100 usuários e scheduler 6 req/min', () => {
    const pool = makePool(100);
    const plan = buildHarnessExecutionPlan({ tier: 'nominal', pool });
    expect(plan.peak_concurrent_users).toBe(100);
    expect(plan.scheduler.virtual_users).toBe(100);
    expect(plan.scheduler.interval_ms_per_request).toBe(10_000);
    expect(plan.setup_steps[0]?.operation_id).toBe('api_simulado_sessions_create');
    expect(plan.readiness.HARNESS_HTTP_EXECUTOR).toBe('IMPLEMENTED_BLOCKED_BY_POLICY');
  });

  it('materializa POST registrar-tentativa conforme API', () => {
    const pool = makePool(1);
    const user = pool.users[0];
    const req = materializeOperation(
      {
        operation_id: 'api_registrar_tentativa',
        phase: 'measured',
        auth: 'bearer',
        method: 'POST',
        path: '/api/registrar-tentativa',
        request_weight: 0.21,
        kind: 'write',
      },
      pool,
      user,
    );
    expect(req.body).toEqual({ modulo_slug: 'slug-demo', opcao_id: 'A' });
  });

  it('target binding exige staging allowlist', () => {
    const pool = makePool(1, { allowed_hosts: ['other.example'], base_url: 'https://staging.example.com' });
    const result = validateStagingTargetBinding(pool);
    expect(result.ok).toBe(false);
  });

  it('bloqueia execução sem flags', () => {
    expect(() =>
      assertHarnessExecutionAllowed({
        cliExecuteFlag: false,
        harnessExecuteEnv: undefined,
        loadTestAuthorizedEnv: undefined,
      }),
    ).toThrow(HarnessExecutionForbiddenError);
    expect(() =>
      assertHarnessExecutionAllowed({
        cliExecuteFlag: true,
        harnessExecuteEnv: undefined,
        loadTestAuthorizedEnv: '1',
      }),
    ).toThrow(/SCALE_HARNESS_EXECUTE/);
    expect(() =>
      assertHarnessExecutionAllowed({
        cliExecuteFlag: true,
        harnessExecuteEnv: '1',
        loadTestAuthorizedEnv: undefined,
      }),
    ).toThrow(/LOAD_TEST_AUTHORIZATION/);
  });

  it('redige credenciais no plano serializado', () => {
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const redacted = redactSecretsDeep({ pool, plan });
    const serialized = JSON.stringify(redacted);
    assertPlanHasNoRawSecrets(serialized);
    expect(serialized).not.toContain('token-0');
  });

  it('pickWeightedOperation respeita pesos', () => {
    const ops: HarnessOperationStep[] = [
      { operation_id: 'a', phase: 'measured', auth: 'bearer', method: 'GET', path: '/', request_weight: 1, kind: 'read' },
      { operation_id: 'b', phase: 'measured', auth: 'bearer', method: 'GET', path: '/', request_weight: 0, kind: 'read' },
    ];
    expect(pickWeightedOperation(ops, () => 0).operation_id).toBe('a');
  });
});
