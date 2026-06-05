#!/usr/bin/env tsx
/**
 * Captura baseline de performance (passo 0.3) — servidor + HTTP opcional + telemetria browser.
 *
 * Uso:
 *   npm run perf:baseline              # local (NEXT_PUBLIC_APP_URL / localhost)
 *   npm run perf:baseline:staging      # .env.staging.local → preview Vercel
 *   npm run perf:baseline -- --skip-browser
 *   npm run perf:baseline:staging -- --output docs/perf-baseline-staging-2026-06-02.json
 *
 * Requer: .env.local com Supabase (service role). Staging: copiar .env.staging.example → .env.staging.local
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { gzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

import {
  assertPerfTargetConfigured,
  defaultPerfBaselineOutputPath,
  loadPerfEnv,
  parsePerfTarget,
  resolvePerfBaseUrl,
  resolvePerfEnvironmentLabel,
} from '@/lib/perf/loadPerfEnv';
import {
  getVercelProtectionBypassSecret,
  getVercelProtectionHeaders,
  mergeWithVercelProtectionHeaders,
} from '@/lib/perf/vercelProtection';
import { createServerSupabase } from '@/lib/supabase/server';
import { getVitrinePage } from '@/lib/vitrine/service';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
import { isAdminSessionEmail } from '@/lib/constants';
import { resetMetrics, getVitrineStrategyStats } from '@/lib/metrics';
import { runScaleHealthCheck } from '@/lib/scale/healthCheck';

const SAMPLE_COUNT = 20;
const PAYLOAD_SLUG_SAMPLES = 12;

type PercentileResult = {
  p50Ms: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  samples: number;
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

function summarizeMs(samples: number[]): PercentileResult {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    samples: sorted.length,
    minMs: sorted[0] ?? 0,
    maxMs: sorted[sorted.length - 1] ?? 0,
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

async function resolveBaselineUser(admin: SupabaseClient) {
  const forcedEmail = process.env.PERF_BASELINE_EMAIL?.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (forcedEmail) {
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = listData.users.find((u) => u.email?.toLowerCase() === forcedEmail);
    if (!match) {
      throw new Error(`PERF_BASELINE_EMAIL não encontrado no Auth: ${forcedEmail}`);
    }
    return {
      userId: match.id,
      email: match.email ?? forcedEmail,
      isAdmin: isAdminSessionEmail(match.email),
      source: 'perf_baseline_email' as const,
    };
  }

  const { data: matriculaRow, error: matriculaError } = await admin
    .from('concurso_matriculas')
    .select('user_id')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (matriculaError) {
    console.warn('[perf:baseline] Falha ao buscar matrícula:', matriculaError.message);
  }

  let userId = (matriculaRow as { user_id?: string } | null)?.user_id;
  let email: string | null = null;

  if (userId) {
    const { data: userData } = await admin.auth.admin.getUserById(userId);
    email = userData.user?.email ?? null;
  }

  if (!userId && adminEmail) {
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = listData.users.find((u) => u.email?.toLowerCase() === adminEmail);
    if (match) {
      userId = match.id;
      email = match.email ?? null;
    }
  }

  if (!userId) {
    throw new Error(
      'Nenhum usuário com matrícula ativa nem ADMIN_EMAIL encontrado para o baseline.',
    );
  }

  return {
    userId,
    email,
    isAdmin: isAdminSessionEmail(email),
    source: userId && matriculaRow ? 'matricula' : 'admin_email',
  };
}

async function createSessionForEmail(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkError) throw linkError;
  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error('generateLink sem hashed_token');

  const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  });

  if (verifyError) throw verifyError;
  if (!verifyData.session?.access_token) throw new Error('verifyOtp sem session');
  return verifyData.session;
}

function supabaseStorageKey(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const ref = new URL(url).hostname.split('.')[0] ?? 'project';
  return `sb-${ref}-auth-token`;
}

async function measureServerVitrine(userId: string, isAdmin: boolean) {
  resetMetrics();
  const samples: number[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const started = Date.now();
    await getVitrinePage({ userId, page: 1, isAdmin });
    samples.push(Date.now() - started);
  }
  return { timing: summarizeMs(samples), strategy: getVitrineStrategyStats() };
}

async function measureServerQuestao(
  userId: string,
  isAdmin: boolean,
  slugs: string[],
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
): Promise<{ timing: PercentileResult; payloadGzipBytes: number[] }> {
  const samples: number[] = [];
  const gzipBytes: number[] = [];

  for (const slug of slugs.slice(0, SAMPLE_COUNT)) {
    const started = Date.now();
    const result = await buildEstudarQuestaoPlayerPayload({
      slug,
      userId,
      isAdmin,
      supabase,
    });
    samples.push(Date.now() - started);

    if (result.status === 'ok') {
      const json = JSON.stringify(result.payload);
      gzipBytes.push(gzipSync(Buffer.from(json, 'utf8')).length);
    }
  }

  return { timing: summarizeMs(samples), payloadGzipBytes: gzipBytes };
}

async function measureHttp(
  baseUrl: string,
  accessToken: string,
  slugs: string[],
): Promise<{
  vitrine: PercentileResult;
  questao: PercentileResult;
  questao_core: PercentileResult;
  questaoPayloadGzip: number[];
  questaoCorePayloadGzip: number[];
}> {
  const vitrineSamples: number[] = [];
  const questaoSamples: number[] = [];
  const questaoPayloadGzip: number[] = [];

  const headers = mergeWithVercelProtectionHeaders({
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  });

  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const vitrineStarted = Date.now();
    const vitrineRes = await fetch(`${baseUrl}/api/vitrine?page=1`, {
      headers,
      cache: 'no-store',
    });
    vitrineSamples.push(Date.now() - vitrineStarted);
    if (!vitrineRes.ok) {
      throw new Error(`GET /api/vitrine falhou: ${vitrineRes.status}`);
    }
    await vitrineRes.arrayBuffer();
  }

  const slugList =
    slugs.length > 0 ? slugs : ['placeholder-slug-will-404'];

  const questaoCoreSamples: number[] = [];
  const questaoCorePayloadGzip: number[] = [];

  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const slug = slugList[i % slugList.length]!;
    const questaoStarted = Date.now();
    const questaoRes = await fetch(
      `${baseUrl}/api/estudar/questao?slug=${encodeURIComponent(slug)}`,
      { headers, cache: 'no-store' },
    );
    questaoSamples.push(Date.now() - questaoStarted);
    const body = await questaoRes.arrayBuffer();
    if (questaoRes.ok) {
      questaoPayloadGzip.push(gzipSync(Buffer.from(body)).length);
    }

    const coreStarted = Date.now();
    const coreRes = await fetch(
      `${baseUrl}/api/estudar/questao?slug=${encodeURIComponent(slug)}&layers=core`,
      { headers, cache: 'no-store' },
    );
    questaoCoreSamples.push(Date.now() - coreStarted);
    const coreBody = await coreRes.arrayBuffer();
    if (coreRes.ok) {
      questaoCorePayloadGzip.push(gzipSync(Buffer.from(coreBody)).length);
    }
  }

  return {
    vitrine: summarizeMs(vitrineSamples),
    questao: summarizeMs(questaoSamples),
    questao_core: summarizeMs(questaoCoreSamples),
    questaoPayloadGzip,
    questaoCorePayloadGzip,
  };
}

async function isServerReachable(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      cache: 'no-store',
      headers: getVercelProtectionHeaders(),
    });
    return res.status === 200 || res.status === 503;
  } catch {
    return false;
  }
}

async function collectSlugsFromVitrine(
  userId: string,
  isAdmin: boolean,
): Promise<string[]> {
  const page = await getVitrinePage({ userId, page: 1, isAdmin });
  const slugs: string[] = [];
  for (const group of page.groups) {
    for (const q of group.questoes) {
      if (q.slug) slugs.push(q.slug);
      if (slugs.length >= PAYLOAD_SLUG_SAMPLES) return slugs;
    }
  }
  return slugs;
}

async function runBrowserNavTelemetry(
  baseUrl: string,
  session: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
    user: unknown;
  },
): Promise<Record<string, unknown>> {
  const storageKey = supabaseStorageKey();
  const expiresAt = Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600);

  const browser = await chromium.launch({ headless: true });
  const protectionHeaders = getVercelProtectionHeaders();
  const context = await browser.newContext(
    Object.keys(protectionHeaders).length > 0
      ? { extraHTTPHeaders: protectionHeaders }
      : undefined,
  );
  const page = await context.newPage();

  await page.addInitScript(
    ({ key, authPayload, telemetryOn }) => {
      window.localStorage.setItem(key, JSON.stringify(authPayload));
      window.localStorage.setItem('avant:estudar-nav-telemetry', telemetryOn);
    },
    {
      key: storageKey,
      telemetryOn: '1',
      authPayload: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: expiresAt,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user,
      },
    },
  );

  await page.goto(`${baseUrl}/estudar`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(1500);

  await page.evaluate(() =>
    (
      window as unknown as { __avantEstudarNavTelemetry?: { reset: () => void } }
    ).__avantEstudarNavTelemetry?.reset(),
  );

  const links = page.locator('main a[href^="/estudar/"]');
  const count = await links.count();
  const target = Math.min(20, count);

  if (target === 0) {
    await browser.close();
    return {
      skipped: true,
      reason: 'Nenhum link /estudar/ na vitrine',
      linksFound: 0,
    };
  }

  const hoverCount = Math.min(10, target);
  for (let i = 0; i < target; i += 1) {
    await page.goto(`${baseUrl}/estudar`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForTimeout(400);
    const link = page.locator('main a[href^="/estudar/"]').nth(i);
    if (i < hoverCount) {
      await link.hover();
      await page.waitForTimeout(550);
    }
    await link.click();
    await page.waitForURL(/\/estudar\/[^/]+/, { timeout: 60_000 }).catch(() => undefined);
    await page.waitForTimeout(350);
  }

  await page.goto(`${baseUrl}/estudar`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  const snapshot = await page.evaluate(() => {
    const api = (
      window as unknown as {
        __avantEstudarNavTelemetry?: { snapshot: () => unknown };
      }
    ).__avantEstudarNavTelemetry;
    return api?.snapshot() ?? null;
  });
  await browser.close();

  return {
    skipped: false,
    linksFound: count,
    clicksAttempted: target,
    snapshot,
    note:
      'Protocolo 20 cliques (10 com hover ≥550ms). VitrineQuestaoLink + QuestaoNavigationProvider; meta SLO navigateHitRatePct ≥ 80%.',
  };
}

const NAV_HIT_SLO_PCT = 80;
const P95_SLO_MS = 800;

function buildSloChecklist(input: {
  http: Awaited<ReturnType<typeof measureHttp>> | null;
  browserNav: Record<string, unknown> | null;
  vitrineServer: Awaited<ReturnType<typeof measureServerVitrine>>;
  questaoServer: Awaited<ReturnType<typeof measureServerQuestao>> | null;
}) {
  const snap = input.browserNav?.snapshot as
    | { navigateHitRatePct?: number | null; navigateHit?: number; navigateMiss?: number }
    | undefined;
  const hitRate = snap?.navigateHitRatePct ?? null;
  const vitrineHttpP95 = input.http?.vitrine.p95Ms ?? null;
  const questaoHttpP95 = input.http?.questao.p95Ms ?? null;
  const questaoCoreHttpP95 = input.http?.questao_core.p95Ms ?? null;
  const vitrineServerP95 = input.vitrineServer.timing.p95Ms;
  const questaoServerP95 = input.questaoServer?.timing.p95Ms ?? null;

  return {
    navigate_hit_rate_pct: hitRate,
    navigate_hit_slo_met:
      hitRate === null ? null : hitRate >= NAV_HIT_SLO_PCT,
    p95_vitrine_http_ms: vitrineHttpP95,
    p95_vitrine_http_slo_met:
      vitrineHttpP95 === null ? null : vitrineHttpP95 < P95_SLO_MS,
    p95_questao_http_ms: questaoHttpP95,
    p95_questao_http_slo_met:
      questaoHttpP95 === null ? null : questaoHttpP95 < P95_SLO_MS,
    p95_questao_core_http_ms: questaoCoreHttpP95,
    p95_questao_core_http_slo_met:
      questaoCoreHttpP95 === null ? null : questaoCoreHttpP95 < P95_SLO_MS,
    p95_vitrine_server_ms: vitrineServerP95,
    p95_vitrine_server_slo_met: vitrineServerP95 < P95_SLO_MS,
    p95_questao_build_server_ms: questaoServerP95,
    p95_questao_build_server_slo_met:
      questaoServerP95 === null ? null : questaoServerP95 < P95_SLO_MS,
    targets: { navigate_hit_rate_pct: NAV_HIT_SLO_PCT, p95_ms: P95_SLO_MS },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const perfTarget = parsePerfTarget(args);
  const envMeta = loadPerfEnv(perfTarget);
  const { baseUrl, source: baseUrlSource } = resolvePerfBaseUrl();
  assertPerfTargetConfigured(perfTarget, baseUrl);

  const skipBrowser = args.includes('--skip-browser');
  const outputArg = args.find((a) => a.startsWith('--output='))?.split('=')[1];
  const outputPath = resolve(process.cwd(), outputArg ?? defaultPerfBaselineOutputPath(perfTarget));

  console.log(
    `[perf:baseline] target=${perfTarget} baseUrl=${baseUrl} (via ${baseUrlSource}) env=${envMeta.loadedFiles.join(', ')}`,
  );

  const supabaseAdmin = await createServerSupabase();
  const user = await resolveBaselineUser(supabaseAdmin);
  const slugs = await collectSlugsFromVitrine(user.userId, user.isAdmin);

  console.log(`[perf:baseline] Usuário ${user.userId} (${user.source}, admin=${user.isAdmin})`);
  console.log(`[perf:baseline] Slugs amostra: ${slugs.length}`);

  const scaleHealth = await runScaleHealthCheck(supabaseAdmin, {
    probeBaseUrl: (await isServerReachable(baseUrl)) ? baseUrl : undefined,
  });

  const vitrineServer = await measureServerVitrine(user.userId, user.isAdmin);

  let questaoServer: Awaited<ReturnType<typeof measureServerQuestao>> | null = null;
  try {
    questaoServer = await measureServerQuestao(
      user.userId,
      user.isAdmin,
      slugs,
      supabaseAdmin,
    );
  } catch (err) {
    console.warn(
      '[perf:baseline] buildEstudarQuestaoPlayerPayload fora do request Next (unstable_cache) — usar HTTP:',
      err instanceof Error ? err.message : err,
    );
  }

  let http: Awaited<ReturnType<typeof measureHttp>> | null = null;
  let browserNav: Record<string, unknown> | null = null;
  const serverUp = await isServerReachable(baseUrl);

  if (serverUp && user.email) {
    const session = await createSessionForEmail(user.email);
    try {
      http = await measureHttp(baseUrl, session.access_token, slugs);
    } catch (err) {
      console.warn('[perf:baseline] HTTP autenticado falhou:', err instanceof Error ? err.message : err);
    }

    if (!skipBrowser) {
      try {
        browserNav = await runBrowserNavTelemetry(baseUrl, {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          token_type: session.token_type,
          user: session.user,
        });
      } catch (err) {
        browserNav = {
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }
  } else {
    console.warn(
      `[perf:baseline] Servidor indisponível em ${baseUrl} — apenas métricas servidor (getVitrinePage/buildPayload).`,
    );
  }

  const slo_checklist = buildSloChecklist({
    http,
    browserNav,
    vitrineServer,
    questaoServer,
  });

  const report = {
    captured_at: new Date().toISOString(),
    git_commit: (() => {
      try {
        return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      } catch {
        return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
      }
    })(),
    environment: resolvePerfEnvironmentLabel(perfTarget, baseUrl),
    perf_target: perfTarget,
    base_url: baseUrl,
    base_url_source: baseUrlSource,
    env_files: envMeta.loadedFiles,
    vercel_protection_bypass: Boolean(getVercelProtectionBypassSecret()),
    server_reachable: serverUp,
    user: {
      id: user.userId,
      email_domain: user.email?.split('@')[1] ?? null,
      is_admin: user.isAdmin,
      source: user.source,
    },
    scale_health: scaleHealth,
    server_side: {
      vitrine_page_1: vitrineServer.timing,
      vitrine_strategy: vitrineServer.strategy,
      estudar_questao_build: questaoServer?.timing ?? null,
      estudar_questao_payload_gzip_bytes: questaoServer
        ? {
            median: median(questaoServer.payloadGzipBytes),
            samples: questaoServer.payloadGzipBytes.length,
            values: questaoServer.payloadGzipBytes,
          }
        : null,
    },
    http_authenticated: http
      ? {
          vitrine_api_page_1: http.vitrine,
          estudar_questao_api: http.questao,
          estudar_questao_api_core: http.questao_core,
          estudar_questao_payload_gzip_bytes: {
            median: median(http.questaoPayloadGzip),
            samples: http.questaoPayloadGzip.length,
          },
          estudar_questao_core_payload_gzip_bytes: {
            median: median(http.questaoCorePayloadGzip),
            samples: http.questaoCorePayloadGzip.length,
          },
        }
      : null,
    browser_navigation_telemetry: browserNav,
    slo_checklist,
    notes: [
      perfTarget === 'staging'
        ? 'P95 HTTP inclui rede até a preview Vercel (não comparar 1:1 com getVitrinePage local).'
        : 'P95 HTTP = latência total fetch (rede local + servidor). Preferir mesma máquina que o dev server.',
      'Telemetria: NEXT_PUBLIC_ESTUDAR_NAV_TELEMETRY=1 ou localStorage avant:estudar-nav-telemetry; meta navigateHitRatePct ≥ 80% após hover.',
      'P95 > 800 ms: aquecer cache (visitar /estudar), pooler Supabase 6543, região Vercel ≈ DB — ver docs/PLANO_PERFORMANCE_INSTANTANEO.md § Operação.',
    ],
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n[perf:baseline] Relatório: ${outputPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
