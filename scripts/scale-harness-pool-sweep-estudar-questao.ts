#!/usr/bin/env tsx
/**
 * Sweep sequencial read-only: GET /api/estudar/questao por VU (sem --execute).
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { loadApprovedStagingTarget } from '@/lib/scale/authenticatedHarness/approvedStagingTarget';
import { evaluateHarnessSlugCommercialEligibility } from '@/lib/scale/authenticatedHarness/poolCommercialEligibility';
import { executeMaterializedRequest } from '@/lib/scale/authenticatedHarness/httpExecute';
import { materializeOperation } from '@/lib/scale/authenticatedHarness/materializeRequest';
import {
  assertHarnessProvisionTargetsAllowed,
  DEFAULT_STAGING_SUPABASE_URL,
  formatHarnessProvisionError,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';
import type { HarnessOperationStep, SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import {
  buildHarnessHttpTransport,
  createHarnessFetch,
} from '@/lib/scale/authenticatedHarness/vercelProtectionHarness';
import { createVuRuntimeState, toMaterializeUser } from '@/lib/scale/authenticatedHarness/vuRuntime';
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[t.slice(0, eq).trim()] = v;
  }
}

function hydrateServiceRole(projectRef: string): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;
  const stdout = execSync(`npx supabase projects api-keys --project-ref ${projectRef}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const key = (JSON.parse(stdout) as { keys?: Array<{ id?: string; api_key?: string }> }).keys?.find(
    (k) => k.id === 'service_role',
  )?.api_key;
  if (!key) throw new Error('service_role ausente');
  process.env.SUPABASE_SERVICE_ROLE_KEY = key;
}

async function main() {
  const poolPath =
    parseArg('--pool') ?? 'scale-harness-private/staging-conservative-50.scale-harness-pool.local.json';
  const outPath =
    parseArg('--out') ?? 'artifacts/scale-harness-pool-sweep-estudar-questao.json';
  const throttleMs = Number.parseInt(parseArg('--throttle-ms') ?? '250', 10);
  const envFile = parseArg('--env-file') ?? 'scale-harness-private/.env.harness-pool.local';
  const projectRef = parseArg('--supabase-project-ref') ?? 'higsjzfigprqvldpxfwj';

  loadDotenvFile(envFile);
  try {
    loadPerfEnv('staging');
  } catch {
    loadPerfEnv('local');
  }
  loadDotenvFile(envFile);

  const pool = JSON.parse(readFileSync(resolve(process.cwd(), poolPath), 'utf8')) as SyntheticUserPoolFile;
  const approved = loadApprovedStagingTarget();
  assertHarnessProvisionTargetsAllowed({ supabaseUrl: pool.supabase_url ?? DEFAULT_STAGING_SUPABASE_URL, baseUrl: pool.base_url });

  const transport = buildHarnessHttpTransport(pool, approved, process.env);
  const harnessFetch = createHarnessFetch(fetch, transport);
  const step: HarnessOperationStep = {
    operation_id: 'api_estudar_questao',
    phase: 'measured',
    auth: 'bearer',
    method: 'GET',
    path: '/api/estudar/questao',
    request_weight: 1,
    kind: 'read',
  };

  hydrateServiceRole(projectRef);
  const admin = createClient(
    pool.supabase_url ?? DEFAULT_STAGING_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const slugMeta = new Map<string, { titulo_aula: string | null; conteudo_json: unknown }>();
  const uniqueSlugs = [...new Set(pool.users.map((u) => u.default_questao_slug?.trim()).filter(Boolean))];
  if (uniqueSlugs.length > 0) {
    const { data } = await admin
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, conteudo_json')
      .in('modulo_slug', uniqueSlugs);
    for (const row of data ?? []) {
      const slug = (row as { modulo_slug?: string }).modulo_slug?.trim();
      if (slug) {
        slugMeta.set(slug, {
          titulo_aula: (row as { titulo_aula?: string | null }).titulo_aula ?? null,
          conteudo_json: (row as { conteudo_json?: unknown }).conteudo_json,
        });
      }
    }
  }

  const results: Array<{
    pool_id: string;
    default_questao_slug: string;
    http_status: number;
    ok: boolean;
    commercial_eligible: boolean | null;
    commercial_reason: string | null;
  }> = [];

  for (const user of pool.users) {
    const slug = user.default_questao_slug?.trim() ?? '';
    const state = createVuRuntimeState(user);
    const materialized = materializeOperation(step, pool, toMaterializeUser(state));
    const outcome = await executeMaterializedRequest(pool, state, materialized, harnessFetch, transport);
    const meta = slugMeta.get(slug);
    const commercial = meta
      ? evaluateHarnessSlugCommercialEligibility({
          modulo_slug: slug,
          titulo_aula: meta.titulo_aula,
          conteudo_json: meta.conteudo_json,
        })
      : null;

    results.push({
      pool_id: user.pool_id,
      default_questao_slug: slug,
      http_status: outcome.status,
      ok: outcome.ok,
      commercial_eligible: commercial?.commercial_eligible ?? null,
      commercial_reason: commercial?.commercial_reason ?? null,
    });
    if (throttleMs > 0) await new Promise((r) => setTimeout(r, throttleMs));
  }

  const status403 = results.filter((r) => r.http_status === 403);
  const report = {
    mode: 'scale-harness-pool-sweep-estudar-questao',
    total: results.length,
    http_200: results.filter((r) => r.http_status === 200).length,
    http_403: status403.length,
    other_status: results.filter((r) => r.http_status !== 200 && r.http_status !== 403).length,
    results,
    slug_403_summary: Object.entries(
      status403.reduce<Record<string, number>>((acc, r) => {
        acc[r.default_questao_slug] = (acc[r.default_questao_slug] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([default_questao_slug, count]) => ({ default_questao_slug, vu_count: count })),
  };

  const abs = resolve(process.cwd(), outPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ written: outPath, http_403: report.http_403, http_200: report.http_200 }, null, 2));
  if (status403.length > 0) process.exit(2);
}

main().catch((err) => {
  console.error(formatHarnessProvisionError(err));
  process.exit(1);
});
