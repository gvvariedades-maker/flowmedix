#!/usr/bin/env tsx
/**
 * Smoke autenticado: 1 VU do pool (vitrine, questão, registrar-tentativa, simulado).
 * Não é load test / não usa --execute do harness.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import { executeMaterializedRequest } from '@/lib/scale/authenticatedHarness/httpExecute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import {
  formatHarnessProvisionError,
  formatHarnessSyntheticEmail,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';
import {
  buildSupabaseSsrCookieHeader,
  createHarnessSessionForEmail,
} from '@/lib/scale/authenticatedHarness/provisionSession';
import { runSimuladoSetupStep } from '@/lib/scale/authenticatedHarness/simuladoSetup';
import { loadSyntheticUserPool } from '@/lib/scale/authenticatedHarness/syntheticUserPool';
import {
  buildHarnessHttpTransport,
  createHarnessFetch,
} from '@/lib/scale/authenticatedHarness/vercelProtectionHarness';
import { createVuRuntimeState, toMaterializeUser } from '@/lib/scale/authenticatedHarness/vuRuntime';
import { HarnessMetricsCollector } from '@/lib/scale/authenticatedHarness/metrics';
import { loadPerfEnv, parsePerfTarget } from '@/lib/perf/loadPerfEnv';

function parseArg(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function hydrateServiceRoleFromSupabaseCli(projectRef: string): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;
  const stdout = execSync(`npx supabase projects api-keys --project-ref ${projectRef}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(stdout) as { keys?: Array<{ id?: string; api_key?: string }> };
  const service = parsed.keys?.find((k) => k.id === 'service_role')?.api_key?.trim();
  if (!service) throw new Error(`service_role ausente para ref ${projectRef}`);
  process.env.SUPABASE_SERVICE_ROLE_KEY = service;
}

function loadDotenvFile(rel: string): void {
  const absolute = resolve(process.cwd(), rel);
  if (!existsSync(absolute)) return;
  const content = readFileSync(absolute, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value) process.env[key] = value;
  }
}

type SmokeStepResult = {
  operation_id: string;
  status: number;
  ok: boolean;
  latency_ms: number;
  error_kind?: string;
};

async function main() {
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const poolIndex = Number.parseInt(parseArg('--pool-index') ?? '0', 10);
  const poolId = parseArg('--pool-id');
  const batch = parseArg('--batch') ?? '20260927';
  const emailDomain = parseArg('--email-domain') ?? 'example.com';
  const refreshSession = !process.argv.includes('--no-refresh-session');
  const projectRef = parseArg('--supabase-project-ref') ?? 'higsjzfigprqvldpxfwj';
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const outFile =
    parseArg('--out') ?? 'scale-harness-private/staging-conservative-50.smoke-one-report.json';
  const target = parsePerfTarget(process.argv);

  if (envFile) loadDotenvFile(envFile);
  try {
    loadPerfEnv(target);
  } catch {
    loadPerfEnv('local');
  }
  loadDotenvFile(envFile);

  const approved = loadApprovedStagingTarget();
  const pool = loadSyntheticUserPool(poolPath, approved);
  const user =
    poolId != null
      ? pool.users.find((u) => u.pool_id === poolId)
      : pool.users[poolIndex];
  if (!user) {
    throw new Error(`VU não encontrado (index=${poolIndex}, pool-id=${poolId ?? 'n/a'})`);
  }

  const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
  const transport = buildHarnessHttpTransport(pool, approved, process.env);
  if (!transport.vercelProtectionBypass) {
    throw new Error(
      'VERCEL_AUTOMATION_BYPASS_SECRET ou VERCEL_PROTECTION_BYPASS obrigatório (ex.: .env.staging.local)',
    );
  }
  const harnessFetch = createHarnessFetch(fetch, transport);
  const state = createVuRuntimeState(user);
  const metrics = new HarnessMetricsCollector();
  const steps: SmokeStepResult[] = [];

  if (refreshSession) {
    hydrateServiceRoleFromSupabaseCli(projectRef);
    const vuIndex =
      poolId != null ? pool.users.findIndex((u) => u.pool_id === poolId) : poolIndex;
    if (vuIndex < 0) throw new Error(`pool-id não encontrado: ${poolId}`);
    const email = formatHarnessSyntheticEmail(batch, vuIndex, emailDomain);
    const tokens = await createHarnessSessionForEmail({
      supabaseUrl: pool.supabase_url ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      anonKey: pool.supabase_anon_key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      email,
    });
    state.access_token = tokens.access_token;
    state.supabase_refresh_token = tokens.refresh_token;
    state.cookie_header = await buildSupabaseSsrCookieHeader(
      pool.supabase_url ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      pool.supabase_anon_key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      tokens,
    );
    steps.push({ operation_id: 'session_refresh_magiclink', status: 200, ok: true, latency_ms: 0 });
  }

  const sequence = [
    'api_vitrine_page',
    'api_estudar_questao',
    'api_registrar_tentativa',
  ] as const;

  for (const opId of sequence) {
    const step = plan.measured_operations.find((s) => s.operation_id === opId);
    if (!step) throw new Error(`operação ausente no plano: ${opId}`);
    const materialized = materializeOperation(step, pool, toMaterializeUser(state));
    const outcome = await executeMaterializedRequest(pool, state, materialized, harnessFetch, transport);
    steps.push({
      operation_id: opId,
      status: outcome.status,
      ok: outcome.ok,
      latency_ms: outcome.latency_ms,
      error_kind: outcome.error_kind,
    });
    if (!outcome.ok) break;
  }

  const lastCore = steps[steps.length - 1];
  if (lastCore?.ok) {
    await runSimuladoSetupStep(plan, pool, state, metrics, harnessFetch, transport);
    steps.push({
      operation_id: 'api_simulado_sessions_create',
      status: 200,
      ok: true,
      latency_ms: 0,
    });

    for (const opId of ['api_simulado_questao', 'api_simulado_responder'] as const) {
      const step = plan.measured_operations.find((s) => s.operation_id === opId);
      if (!step) throw new Error(`operação ausente: ${opId}`);
      const materialized = materializeOperation(step, pool, toMaterializeUser(state));
      const outcome = await executeMaterializedRequest(pool, state, materialized, harnessFetch, transport);
      steps.push({
        operation_id: opId,
        status: outcome.status,
        ok: outcome.ok,
        latency_ms: outcome.latency_ms,
        error_kind: outcome.error_kind,
      });
      if (!outcome.ok) break;
    }
  }

  const allOk = steps.every((s) => s.ok);
  const report = {
    mode: 'scale-harness-pool-smoke-one',
    pool_id: user.pool_id,
    base_url_host: new URL(pool.base_url).hostname,
    steps,
    ok: allOk,
  };

  const abs = resolve(process.cwd(), outFile);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
  if (!allOk) process.exit(1);
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
