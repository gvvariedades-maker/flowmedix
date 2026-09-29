#!/usr/bin/env tsx
/**
 * DIAG-504: probes sequenciais 1 VU (sem carga).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import { executeMaterializedRequest } from '@/lib/scale/authenticatedHarness/httpExecute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import { formatHarnessProvisionError } from '@/lib/scale/authenticatedHarness/poolProvisioning';
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
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

function loadDotenvFile(rel: string): void {
  const absolute = resolve(process.cwd(), rel);
  if (!existsSync(absolute)) return;
  for (const line of readFileSync(absolute, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[t.slice(0, eq).trim()] = v;
  }
}

async function probeGet(
  pool: ReturnType<typeof loadSyntheticUserPool>,
  transport: ReturnType<typeof buildHarnessHttpTransport>,
  path: string,
  auth: 'none' | 'bearer',
  state?: ReturnType<typeof createVuRuntimeState>,
): Promise<{ path: string; status: number; latency_ms: number }> {
  const harnessFetch = createHarnessFetch(fetch, transport);
  const url = `${pool.base_url.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {};
  if (auth === 'bearer' && state) {
    headers.Authorization = `Bearer ${state.access_token}`;
  }
  const started = Date.now();
  const res = await harnessFetch(url, { method: 'GET', headers, redirect: 'manual' });
  return { path, status: res.status, latency_ms: Date.now() - started };
}

async function main() {
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const outPath = parseArg('--out') ?? 'artifacts/scale-harness-pool-probe-sequential.json';
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const target = parsePerfTarget(process.argv);

  loadDotenvFile(envFile);
  loadDotenvFile('.env.staging.local');
  try {
    loadPerfEnv(target);
  } catch {
    loadPerfEnv('local');
  }

  const approved = loadApprovedStagingTarget();
  const pool = loadSyntheticUserPool(poolPath, approved);
  const transport = buildHarnessHttpTransport(pool, approved, process.env);
  const harnessFetch = createHarnessFetch(fetch, transport);
  const user = pool.users[0];
  const state = createVuRuntimeState(user);
  const plan = buildHarnessExecutionPlan({ tier: 'conservative', pool });
  const metrics = new HarnessMetricsCollector();

  const results: Array<{ operation_id: string; status: number; latency_ms: number; ok: boolean }> =
    [];

  const health = await probeGet(pool, transport, '/api/health', 'none');
  results.push({ operation_id: 'api_health', ...health, ok: health.status === 200 });

  const vitrineStep = plan.measured_operations.find((o) => o.operation_id === 'api_vitrine_page')!;
  const vitrineMat = materializeOperation(vitrineStep, pool, toMaterializeUser(state));
  const vitrineOut = await executeMaterializedRequest(pool, state, vitrineMat, harnessFetch, transport);
  results.push({
    operation_id: 'api_vitrine_page',
    status: vitrineOut.status,
    latency_ms: vitrineOut.latency_ms,
    ok: vitrineOut.ok,
  });

  const questaoStep = plan.measured_operations.find((o) => o.operation_id === 'api_estudar_questao')!;
  const questaoMat = materializeOperation(questaoStep, pool, toMaterializeUser(state));
  const questaoOut = await executeMaterializedRequest(pool, state, questaoMat, harnessFetch, transport);
  results.push({
    operation_id: 'api_estudar_questao',
    status: questaoOut.status,
    latency_ms: questaoOut.latency_ms,
    ok: questaoOut.ok,
  });

  const regStep = plan.measured_operations.find((o) => o.operation_id === 'api_registrar_tentativa')!;
  const regMat = materializeOperation(regStep, pool, toMaterializeUser(state));
  const regOut = await executeMaterializedRequest(pool, state, regMat, harnessFetch, transport);
  results.push({
    operation_id: 'api_registrar_tentativa',
    status: regOut.status,
    latency_ms: regOut.latency_ms,
    ok: regOut.ok,
  });

  try {
    const simStarted = Date.now();
    await runSimuladoSetupStep(plan, pool, state, metrics, harnessFetch, transport);
    results.push({
      operation_id: 'api_simulado_sessions_create',
      status: 200,
      latency_ms: Date.now() - simStarted,
      ok: true,
    });
  } catch (err) {
    results.push({
      operation_id: 'api_simulado_sessions_create',
      status: 401,
      latency_ms: 0,
      ok: false,
    });
  }

  const report = {
    mode: 'scale-harness-pool-probe-sequential',
    pool_id: user.pool_id,
    probed_at: new Date().toISOString(),
    results,
  };
  const abs = resolve(process.cwd(), outPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ written: outPath, results }, null, 2));
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
