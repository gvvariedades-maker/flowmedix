#!/usr/bin/env tsx
/**
 * Provisiona pool gitignored para scale harness (Auth JWT + cookie SSR).
 * Não executa carga; não chama scale:harness --execute.
 *
 * Uso:
 *   npm run scale:harness:provision-pool -- --dry-run --count=50
 *   npm run scale:harness:provision-pool:staging -- --count=50 --out=scale-harness-private/staging-conservative.json
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
 * Staging: .env.staging.local (PERF_BASE_URL / base_url) via --target=staging.
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { buildHarnessExecutionPlan } from '@/lib/scale/authenticatedHarness/buildPlan';
import {
  assertHarnessProvisionTargetsAllowed,
  DEFAULT_STAGING_APP_URL,
  DEFAULT_HARNESS_EMAIL_DOMAIN,
  DEFAULT_STAGING_SUPABASE_URL,
  formatHarnessPoolUserId,
  formatHarnessSyntheticEmail,
} from '@/lib/scale/authenticatedHarness/poolProvisioning';
import { pickHarnessOpcaoIdFromConteudo } from '@/lib/scale/authenticatedHarness/poolQuestionFixture';
import {
  buildSupabaseSsrCookieHeader,
  createHarnessSessionForEmail,
} from '@/lib/scale/authenticatedHarness/provisionSession';
import type { SyntheticUserPoolFile } from '@/lib/scale/authenticatedHarness/types';
import { loadPerfEnv, parsePerfTarget, resolvePerfBaseUrl } from '@/lib/perf/loadPerfEnv';

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function parseArg(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function parseArgs() {
  const count = Number(parseArg('--count') ?? '50');
  const tier = (parseArg('--tier') ?? 'conservative') as 'conservative' | 'nominal' | 'stress';
  const dryRun = process.argv.includes('--dry-run');
  const out =
    parseArg('--out') ??
    `scale-harness-private/staging-${tier}-${count}.scale-harness-pool.local.json`;
  const batch = parseArg('--batch') ?? new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const emailDomain =
    parseArg('--email-domain') ??
    process.env.SCALE_HARNESS_POOL_EMAIL_DOMAIN ??
    DEFAULT_HARNESS_EMAIL_DOMAIN;
  const envFile = parseArg('--env-file');
  const supabaseProjectRef = parseArg('--supabase-project-ref');
  const throttleMs = Number(parseArg('--throttle-ms') ?? '450');
  const target = parsePerfTarget(process.argv);
  return { count, tier, dryRun, out, batch, emailDomain, target, envFile, supabaseProjectRef, throttleMs };
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

function hydrateServiceRoleFromSupabaseCli(projectRef: string): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;
  const stdout = execSync(`npx supabase projects api-keys --project-ref ${projectRef}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(stdout) as {
    keys?: Array<{ id?: string; api_key?: string }>;
  };
  const service = parsed.keys?.find((k) => k.id === 'service_role')?.api_key?.trim();
  if (!service) {
    throw new Error(`service_role não retornada pelo Supabase CLI para ref ${projectRef}`);
  }
  process.env.SUPABASE_SERVICE_ROLE_KEY = service;
}

async function withAuthRateLimitRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message)
            : String(err);
      if (!/rate limit/i.test(message) || attempt >= 9) {
        throw new Error(`${label}: ${formatProvisionError(err)}`);
      }
      const waitMs = Math.min(15_000, 1500 * (attempt + 1));
      process.stdout.write(`rate-limit, aguardando ${waitMs}ms… `);
      await sleep(waitMs);
    }
  }
  throw new Error(`${label}: esgotou retries`);
}

function isExistingHarnessUserError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  return /already|registered|exists/.test(msg) || error.code === 'email_exists';
}

async function ensureHarnessAuthUser(
  admin: ReturnType<typeof createClient>,
  email: string,
  password: string,
): Promise<void> {
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { avant_scale_harness: true },
  });
  if (!createError || isExistingHarnessUserError(createError)) return;
  const createMsg = createError.message?.trim();
  throw new Error(createMsg || `createUser falhou (status ${createError.status ?? '?'})`);
}

type HarnessQuestionFixture = {
  modulo_slug: string;
  default_opcao_id: string;
};

async function fetchQuestionFixtures(
  admin: ReturnType<typeof createClient>,
  limit: number,
): Promise<HarnessQuestionFixture[]> {
  const { data, error } = await admin
    .from('modulos_estudo')
    .select('modulo_slug, conteudo_json')
    .not('modulo_slug', 'is', null)
    .limit(Math.max(limit * 4, 50));
  if (error) throw error;

  const fixtures: HarnessQuestionFixture[] = [];
  for (const row of data ?? []) {
    const slug = (row as { modulo_slug?: string }).modulo_slug?.trim();
    const opcaoId = pickHarnessOpcaoIdFromConteudo((row as { conteudo_json?: unknown }).conteudo_json);
    if (!slug || !opcaoId) continue;
    fixtures.push({ modulo_slug: slug, default_opcao_id: opcaoId });
    if (fixtures.length >= limit) break;
  }
  if (fixtures.length === 0) {
    throw new Error('Nenhum módulo com modulo_slug + opção válida — importe catálogo no CAS');
  }
  return fixtures;
}

async function main() {
  const args = parseArgs();
  if (!Number.isFinite(args.count) || args.count < 1 || args.count > 200) {
    console.error('--count deve ser entre 1 e 200');
    process.exit(1);
  }

  if (args.envFile) {
    loadDotenvFile(args.envFile);
  }

  try {
    loadPerfEnv(args.target);
  } catch (err) {
    if (!args.dryRun || args.target !== 'staging') throw err;
    loadPerfEnv('local');
  }

  if (args.envFile) {
    loadDotenvFile(args.envFile);
  }

  const projectRef =
    args.supabaseProjectRef?.trim() ||
    process.env.SCALE_HARNESS_SUPABASE_PROJECT_REF?.trim() ||
    (args.target === 'staging' ? 'higsjzfigprqvldpxfwj' : '');
  if (!args.dryRun && projectRef) {
    hydrateServiceRoleFromSupabaseCli(projectRef);
  }
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  if (!supabaseUrl && (args.dryRun || args.target === 'staging')) {
    supabaseUrl = DEFAULT_STAGING_SUPABASE_URL;
  }
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

  let baseUrl =
    args.target === 'staging'
      ? resolvePerfBaseUrl().baseUrl
      : process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://127.0.0.1:3000';
  if (args.target === 'staging' && baseUrl === 'http://127.0.0.1:3000') {
    baseUrl = DEFAULT_STAGING_APP_URL;
  }

  assertHarnessProvisionTargetsAllowed({ supabaseUrl, baseUrl });

  if (!args.dryRun && (!supabaseUrl || !anonKey || !serviceKey)) {
    console.error(
      'Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY',
    );
    process.exit(1);
  }

  const fixtures = args.dryRun
    ? [{ modulo_slug: 'dry-run-slug', default_opcao_id: 'A' }]
    : await fetchQuestionFixtures(
        createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        }),
        Math.min(args.count, 50),
      );

  const planPreview = {
    count: args.count,
    tier: args.tier,
    batch: args.batch,
    email_domain: args.emailDomain,
    base_url: baseUrl,
    supabase_url: supabaseUrl,
    out: args.out,
    dry_run: args.dryRun,
  };
  console.log(JSON.stringify({ mode: 'scale-harness-provision-pool', ...planPreview }, null, 2));

  if (args.dryRun) {
    console.log('dry-run: nenhum usuário Auth criado; nenhum arquivo escrito.');
    return;
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const users: SyntheticUserPoolFile['users'] = [];
  for (let i = 0; i < args.count; i += 1) {
    const pool_id = formatHarnessPoolUserId(i);
    const email = formatHarnessSyntheticEmail(args.batch, i, args.emailDomain);
    const password = randomBytes(24).toString('base64url');
    process.stdout.write(`Provisionando ${pool_id} (${email})… `);

    await withAuthRateLimitRetry(`auth ${pool_id}`, () => ensureHarnessAuthUser(admin, email, password));
    const session = await withAuthRateLimitRetry(`session ${pool_id}`, () =>
      createHarnessSessionForEmail({
        supabaseUrl,
        serviceRoleKey: serviceKey,
        anonKey,
        email,
      }),
    );
    const cookie_header = await withAuthRateLimitRetry(`cookie ${pool_id}`, () =>
      buildSupabaseSsrCookieHeader(supabaseUrl, anonKey, session),
    );
    const fixture = fixtures[i % fixtures.length]!;

    users.push({
      pool_id,
      access_token: session.access_token,
      cookie_header,
      default_questao_slug: fixture.modulo_slug,
      default_opcao_id: fixture.default_opcao_id,
      supabase_refresh_token: session.refresh_token,
    });
    console.log('ok');
    if (args.throttleMs > 0 && i < args.count - 1) {
      await sleep(args.throttleMs);
    }
  }

  const pool: SyntheticUserPoolFile = {
    schema_version: 1,
    target_environment: 'staging',
    base_url: baseUrl.replace(/\/$/, ''),
    supabase_url: supabaseUrl,
    supabase_anon_key: anonKey,
    users,
  };

  const plan = buildHarnessExecutionPlan({ tier: args.tier, pool });
  const absoluteOut = resolve(process.cwd(), args.out);
  mkdirSync(dirname(absoluteOut), { recursive: true });
  writeFileSync(absoluteOut, `${JSON.stringify(pool, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        written: args.out,
        users: pool.users.length,
        peak_concurrent_users: plan.peak_concurrent_users,
        plan_validation: 'ok',
        note: 'Arquivo gitignored; não commitar. Validar com npm run scale:harness -- --plan --tier=... --pool=...',
      },
      null,
      2,
    ),
  );
}

function formatProvisionError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err) {
    const record = err as Record<string, unknown>;
    const status = record.status;
    const parts = [record.message, record.code, status !== undefined ? `status ${status}` : null, record.details, record.hint]
      .filter((v) => typeof v === 'string' && v.trim())
      .map((v) => String(v));
    if (parts.length > 0) return parts.join(' | ');
  }
  return err instanceof Error ? err.name : JSON.stringify(err);
}

main().catch((err) => {
  console.error(formatProvisionError(err));
  process.exit(1);
});
