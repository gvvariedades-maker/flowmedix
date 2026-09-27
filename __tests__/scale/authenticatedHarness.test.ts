import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertPoolBoundToApprovedStaging } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import {
  assertExecuteUsesCanonicalArtifactPaths,
  loadCanonicalArtifactBinding,
} from '@/lib/scale/authenticatedHarness/canonicalArtifacts';
import { buildAuthorizedExecutionContext } from '@/lib/scale/authenticatedHarness/executionAuthorization';
import {
  assertHarnessExecutionGate,
  assertScopeMatchesCanonicalArtifacts,
  assertScopeMatchesRun,
  createAuthorizedExecutionContext,
  HarnessExecutionForbiddenError,
  runHarnessMeasuredWindow,
  runHarnessMeasuredWindowAuthorized,
} from '@/lib/scale/authenticatedHarness/execute';
import { assertGitWorktreeClean, resolveRuntimeGitShaStrict } from '@/lib/scale/authenticatedHarness/gitExecutionBinding';
import { HarnessMetricsCollector } from '@/lib/scale/authenticatedHarness/metrics';
import { runSimuladoSetupStep } from '@/lib/scale/authenticatedHarness/simuladoSetup';
import { executeMaterializedRequest, type FetchLike } from '@/lib/scale/authenticatedHarness/httpExecute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import {
  assertVercelProtectionBypassForStagingExecute,
  buildHarnessHttpTransport,
} from '@/lib/scale/authenticatedHarness/vercelProtectionHarness';
import { parseSimuladoSessionSetupResponse, SimuladoSetupParseError } from '@/lib/scale/authenticatedHarness/parseSimuladoSession';
import { computeVuStaggerMs } from '@/lib/scale/authenticatedHarness/pacing';
import { assertPlanHasNoRawSecrets, redactSecretsDeep } from '@/lib/scale/authenticatedHarness/redact';
import { resolveApprovedStagingForCli, validateStagingTargetBinding } from '@/lib/scale/authenticatedHarness/targetBinding';
import {
  PoolValidationError,
  validatePoolCardinality,
  validateUserCredentialsForOperations,
} from '@/lib/scale/authenticatedHarness/validatePool';
import { validateEnvelopeIntegrity } from '@/lib/scale/authenticatedHarness/validateEnvelope';
import { createVuRuntimeState } from '@/lib/scale/authenticatedHarness/vuRuntime';
import type { HarnessOperationStep, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';

const approved = {
  schema_version: 1 as const,
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

function authorizedEnv(
  sha: string,
  tier: 'conservative' | 'nominal' | 'stress',
  durationMs: number,
  canonical: ReturnType<typeof loadCanonicalArtifactBinding>,
): NodeJS.ProcessEnv {
  return {
    ...process.env,
    SCALE_HARNESS_EXECUTE: '1',
    SCALE_HARNESS_LOAD_TEST_AUTHORIZED: '1',
    SCALE_HARNESS_AUTHORIZED_GIT_SHA: sha,
    SCALE_HARNESS_AUTHORIZED_TIER: tier,
    SCALE_HARNESS_AUTHORIZED_APP_HOST: '127.0.0.1',
    SCALE_HARNESS_AUTHORIZED_SUPABASE_HOST: 'example.supabase.co',
    SCALE_HARNESS_AUTHORIZED_DURATION_MS: String(durationMs),
    SCALE_HARNESS_AUTHORIZED_ENVELOPE_VERSION: canonical.envelope_version,
    SCALE_HARNESS_AUTHORIZED_ENVELOPE_SHA256: canonical.envelope_digest_sha256,
    SCALE_HARNESS_AUTHORIZED_ALLOWLIST_SHA256: canonical.allowlist_digest_sha256,
    SCALE_HARNESS_AUTHORIZED_PEAK_CCU: String(canonical.peak_concurrent_users),
    SCALE_HARNESS_AUTHORIZED_TARGET_MEAN_RPS: String(canonical.target_mean_rps),
  };
}

function scopeFromCanonical(
  sha: string,
  tier: 'conservative' | 'nominal' | 'stress',
  durationMs: number,
  canonical: ReturnType<typeof loadCanonicalArtifactBinding>,
) {
  return {
    authorized_git_sha: sha,
    tier,
    app_host: '127.0.0.1',
    supabase_host: 'example.supabase.co',
    duration_ms: durationMs,
    envelope_version: canonical.envelope_version,
    envelope_digest_sha256: canonical.envelope_digest_sha256,
    allowlist_digest_sha256: canonical.allowlist_digest_sha256,
    peak_concurrent_users: canonical.peak_concurrent_users,
    target_mean_rps: canonical.target_mean_rps,
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

  it('env não amplia app_hosts — production continua bloqueado', () => {
    const prev = process.env.SCALE_HARNESS_APPROVED_STAGING_HOSTS;
    process.env.SCALE_HARNESS_APPROVED_STAGING_HOSTS = 'avant.enf.br';
    try {
      const pool = makePool(1, { base_url: 'https://avant.enf.br' });
      const resolved = resolveApprovedStagingForCli({});
      expect(() => assertPoolBoundToApprovedStaging(pool, resolved)).toThrow(/allowlist/);
      expect(resolved.app_hosts).not.toContain('avant.enf.br');
    } finally {
      if (prev === undefined) delete process.env.SCALE_HARNESS_APPROVED_STAGING_HOSTS;
      else process.env.SCALE_HARNESS_APPROVED_STAGING_HOSTS = prev;
    }
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

  it('setup 2xx com JSON inválido conta setup failure', async () => {
    const pool = makePool(1);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool: makePool(50) });
    const state = createVuRuntimeState(pool.users[0]);
    const metrics = new HarnessMetricsCollector();
    await expect(
      runSimuladoSetupStep(
        plan,
        pool,
        state,
        metrics,
        async () =>
          ({
            status: 200,
            json: async () => ({ success: true, session: { id: 'x' }, questoes: [] }),
          }) as Response,
      ),
    ).rejects.toThrow(SimuladoSetupParseError);
    const report = metrics.buildReport({
      phase: 'setup',
      elapsedMs: 1,
      targetMeanRps: 1,
      httpRequestsSent: 1,
    });
    expect(report.setup_failures).toBe(1);
    const setupOp = report.operations.find((o) => o.operation_id === 'api_simulado_sessions_create');
    expect(setupOp?.failures).toBe(1);
    expect(setupOp?.successes).toBe(0);
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
      assertHarnessExecutionGate({
        cliExecuteFlag: true,
        harnessExecuteEnv: '1',
        loadTestAuthorizedEnv: undefined,
      }),
    ).toThrow(HarnessExecutionForbiddenError);
  });

  it('execute proíbe envelope ou allowlist customizados', () => {
    expect(() =>
      assertExecuteUsesCanonicalArtifactPaths({ execute: true, envelopePath: '/tmp/evil.json' }),
    ).toThrow(/envelope customizado/);
    expect(() =>
      assertExecuteUsesCanonicalArtifactPaths({ execute: true, allowlistPath: '/tmp/evil.json' }),
    ).toThrow(/staging-allowlist customizado/);
    expect(() =>
      assertExecuteUsesCanonicalArtifactPaths({ execute: false, envelopePath: 'custom.json' }),
    ).not.toThrow();
  });

  it('escopo conservative rejeita tier stress no CLI', () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50);
    const planConservative = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const scope = scopeFromCanonical('sha-test', 'conservative', 60_000, canonical);
    expect(() =>
      assertScopeMatchesRun(scope, {
        runtimeGitSha: 'sha-test',
        cliTier: 'conservative',
        durationMs: 60_000,
        plan: planConservative,
        pool,
        approved,
        canonical,
      }),
    ).not.toThrow();
    expect(() =>
      assertScopeMatchesRun(scope, {
        runtimeGitSha: 'sha-test',
        cliTier: 'stress',
        durationMs: 60_000,
        plan: planConservative,
        pool,
        approved,
        canonical,
      }),
    ).toThrow(/tier autorizado/);
  });

  it('rejeita SHA ou duração divergentes do escopo', () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const scope = scopeFromCanonical('sha-a', 'conservative', 60_000, canonical);
    expect(() =>
      assertScopeMatchesRun(scope, {
        runtimeGitSha: 'sha-b',
        cliTier: 'conservative',
        durationMs: 60_000,
        plan,
        pool,
        approved,
        canonical,
      }),
    ).toThrow(/SHA autorizado/);
    expect(() =>
      assertScopeMatchesRun(scope, {
        runtimeGitSha: 'sha-a',
        cliTier: 'conservative',
        durationMs: 120_000,
        plan,
        pool,
        approved,
        canonical,
      }),
    ).toThrow(/duration autorizada/);
  });

  it('rejeita app host do pool diferente do autorizado', () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50, { base_url: 'http://127.0.0.1:3000' });
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const scope = {
      ...scopeFromCanonical('sha', 'conservative', 60_000, canonical),
      app_host: 'staging.example.com',
    };
    expect(() =>
      assertScopeMatchesRun(scope, {
        runtimeGitSha: 'sha',
        cliTier: 'conservative',
        durationMs: 60_000,
        plan,
        pool,
        approved,
        canonical,
      }),
    ).toThrow(/app host autorizado/);
  });

  it('rejeita digest de envelope ou allowlist divergente', () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const scope = scopeFromCanonical('sha', 'conservative', 60_000, canonical);
    const badEnvelope = { ...scope, envelope_digest_sha256: '0'.repeat(64) };
    expect(() => assertScopeMatchesCanonicalArtifacts(badEnvelope, canonical, plan)).toThrow(
      /envelope_digest/,
    );
    const badAllowlist = { ...scope, allowlist_digest_sha256: 'f'.repeat(64) };
    expect(() => assertScopeMatchesCanonicalArtifacts(badAllowlist, canonical, plan)).toThrow(
      /allowlist_digest/,
    );
  });

  it('rejeita peak CCU ou RPS divergentes do canônico', () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const scope = { ...scopeFromCanonical('sha', 'conservative', 60_000, canonical), peak_concurrent_users: 999 };
    expect(() => assertScopeMatchesCanonicalArtifacts(scope, canonical, plan)).toThrow(/peak CCU/);
  });

  it('rejeita worktree sujo em execução', () => {
    expect(() => assertGitWorktreeClean(' M lib/foo.ts\n')).toThrow(/worktree não limpo/);
    expect(() => assertGitWorktreeClean('')).not.toThrow();
  });

  it('resolveRuntimeGitShaStrict exige git', () => {
    expect(resolveRuntimeGitShaStrict()).toMatch(/^[0-9a-f]{40}$/);
  });

  it('createAuthorizedExecutionContext exige escopo completo', () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const durationMs = 60_000;
    const sha = 'commit-sha-1';
    const ctx = createAuthorizedExecutionContext({
      gate: { cliExecuteFlag: true, harnessExecuteEnv: '1', loadTestAuthorizedEnv: '1' },
      env: authorizedEnv(sha, 'conservative', durationMs, canonical),
      runtimeGitSha: sha,
      cliTier: 'conservative',
      durationMs,
      plan,
      pool,
      approved,
      canonical,
    });
    expect(ctx.scope.tier).toBe('conservative');
  });

  it('runHarnessMeasuredWindow legado lança forbidden', async () => {
    await expect(runHarnessMeasuredWindow()).rejects.toThrow(/runHarnessMeasuredWindow foi removido/);
  });

  it('boundary único em execute.ts — sem módulo interno separado', () => {
    const legacyExecutor = resolve(
      process.cwd(),
      'lib/scale/authenticatedHarness',
      'executeInternal.ts',
    );
    expect(existsSync(legacyExecutor)).toBe(false);
    expect(typeof runHarnessMeasuredWindowAuthorized).toBe('function');
  });

  it('runHarnessMeasuredWindowAuthorized rejeita duration divergente do escopo', async () => {
    const canonical = loadCanonicalArtifactBinding('conservative');
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const durationMs = 60_000;
    const sha = 'sha-x';
    const auth = createAuthorizedExecutionContext({
      gate: { cliExecuteFlag: true, harnessExecuteEnv: '1', loadTestAuthorizedEnv: '1' },
      env: authorizedEnv(sha, 'conservative', durationMs, canonical),
      runtimeGitSha: sha,
      cliTier: 'conservative',
      durationMs,
      plan,
      pool,
      approved,
      canonical,
    });
    await expect(
      runHarnessMeasuredWindowAuthorized(auth, plan, pool, { durationMs: 30_000 }),
    ).rejects.toThrow(/duration_ms/);
  });

  it('redige credenciais no plano serializado', () => {
    const pool = makePool(50);
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const serialized = JSON.stringify(redactSecretsDeep({ pool, plan }));
    assertPlanHasNoRawSecrets(serialized);
    expect(serialized).not.toContain('token-0');
  });

  const STAGING_VERCEL_HOST = 'flowmedix-git-staging-gvvariedades-makers-projects.vercel.app';
  const stagingApproved = {
    schema_version: 1 as const,
    app_hosts: [STAGING_VERCEL_HOST],
    supabase_hosts: ['higsjzfigprqvldpxfwj.supabase.co'],
  };

  const stagingPoolOverrides = {
    base_url: `https://${STAGING_VERCEL_HOST}`,
    supabase_url: 'https://higsjzfigprqvldpxfwj.supabase.co',
  };

  it('request ao app staging Vercel recebe header de protection bypass', async () => {
    const pool = makePool(1, stagingPoolOverrides);
    const transport = {
      vercelProtectionBypass: 'secret-bypass-test',
      approvedAppHosts: stagingApproved.app_hosts,
    };
    let capturedHeaders: Record<string, string> = {};
    const fetchImpl: FetchLike = async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return { status: 200, json: async () => ({}) } as Response;
    };
    const state = createVuRuntimeState(pool.users[0]);
    const step: HarnessOperationStep = {
      operation_id: 'api_vitrine_page',
      phase: 'measured',
      auth: 'bearer',
      method: 'GET',
      path: '/api/vitrine',
      request_weight: 1,
      kind: 'read',
    };
    const materialized = materializeOperation(step, pool, pool.users[0]);
    await executeMaterializedRequest(pool, state, materialized, fetchImpl, transport);
    expect(capturedHeaders['x-vercel-protection-bypass']).toBe('secret-bypass-test');
    expect(capturedHeaders['x-vercel-set-bypass-cookie']).toBe('true');
  });

  it('setup simulado POST recebe header de protection bypass', async () => {
    const pool = makePool(50, stagingPoolOverrides);
    const transport = {
      vercelProtectionBypass: 'setup-bypass-secret',
      approvedAppHosts: stagingApproved.app_hosts,
    };
    let capturedHeaders: Record<string, string> = {};
    const fetchImpl: FetchLike = async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return {
        status: 200,
        json: async () => ({
          success: true,
          session: { id: 's1' },
          questoes: [{ modulo_slug: 'mod-1' }],
        }),
      } as Response;
    };
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const state = createVuRuntimeState(pool.users[0]);
    const metrics = new HarnessMetricsCollector();
    await runSimuladoSetupStep(plan, pool, state, metrics, fetchImpl, transport);
    expect(capturedHeaders['x-vercel-protection-bypass']).toBe('setup-bypass-secret');
  });

  it('refresh Supabase não recebe header de protection bypass', async () => {
    const pool = makePool(1, {
      base_url: `https://${STAGING_VERCEL_HOST}`,
      supabase_url: 'https://higsjzfigprqvldpxfwj.supabase.co',
    });
    const transport = {
      vercelProtectionBypass: 'must-not-leak',
      approvedAppHosts: stagingApproved.app_hosts,
    };
    let capturedHeaders: Record<string, string> = {};
    const fetchImpl: FetchLike = async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return {
        status: 200,
        json: async () => ({ access_token: 'new-at', refresh_token: 'new-rt' }),
      } as Response;
    };
    const state = createVuRuntimeState(pool.users[0]);
    const step: HarnessOperationStep = {
      operation_id: 'auth_session_refresh',
      phase: 'measured',
      auth: 'supabase_auth_refresh',
      method: 'POST',
      path: '/auth/v1/token',
      request_weight: 1,
      kind: 'write',
    };
    const materialized = materializeOperation(step, pool, pool.users[0]);
    await executeMaterializedRequest(pool, state, materialized, fetchImpl, transport);
    expect(capturedHeaders['x-vercel-protection-bypass']).toBeUndefined();
  });

  it('execute contra staging Vercel sem bypass secret é bloqueado', () => {
    const pool = makePool(50, stagingPoolOverrides);
    const envSansBypass = { ...process.env };
    delete envSansBypass.VERCEL_AUTOMATION_BYPASS_SECRET;
    delete envSansBypass.VERCEL_PROTECTION_BYPASS;
    expect(() => assertVercelProtectionBypassForStagingExecute(pool, stagingApproved, envSansBypass)).toThrow(
      /VERCEL_AUTOMATION_BYPASS_SECRET/,
    );

    const canonical = loadCanonicalArtifactBinding('conservative');
    const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
    const durationMs = 60_000;
    const sha = 'sha-staging-bypass';
    const env: NodeJS.ProcessEnv = {
      ...authorizedEnv(sha, 'conservative', durationMs, canonical),
      SCALE_HARNESS_AUTHORIZED_APP_HOST: STAGING_VERCEL_HOST,
      SCALE_HARNESS_AUTHORIZED_SUPABASE_HOST: 'higsjzfigprqvldpxfwj.supabase.co',
    };
    delete env.VERCEL_AUTOMATION_BYPASS_SECRET;
    delete env.VERCEL_PROTECTION_BYPASS;
    expect(() =>
      buildAuthorizedExecutionContext({
        gate: { cliExecuteFlag: true, harnessExecuteEnv: '1', loadTestAuthorizedEnv: '1' },
        env,
        runtimeGitSha: sha,
        cliTier: 'conservative',
        durationMs,
        plan,
        pool,
        approved: stagingApproved,
        canonical,
      }),
    ).toThrow(/VERCEL_AUTOMATION_BYPASS_SECRET/);
  });

  it('redige bypass Vercel em headers e bloqueia secret em artefato serializado', () => {
    const secret = 'vercel-bypass-redact-me';
    const redacted = redactSecretsDeep({
      headers: { 'x-vercel-protection-bypass': secret, Accept: 'application/json' },
    });
    expect(redacted.headers['x-vercel-protection-bypass']).toBe('<redacted>');
    const serialized = JSON.stringify(redacted);
    expect(serialized).not.toContain(secret);
    expect(() =>
      assertPlanHasNoRawSecrets(JSON.stringify({ 'x-vercel-protection-bypass': secret })),
    ).toThrow(/credencial/);
  });

  it('buildHarnessHttpTransport lê VERCEL_AUTOMATION_BYPASS_SECRET', () => {
    const pool = makePool(1, { base_url: `https://${STAGING_VERCEL_HOST}` });
    const transport = buildHarnessHttpTransport(pool, stagingApproved, {
      ...process.env,
      VERCEL_AUTOMATION_BYPASS_SECRET: 'from-env-secret',
    });
    expect(transport.vercelProtectionBypass).toBe('from-env-secret');
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
