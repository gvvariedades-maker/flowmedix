#!/usr/bin/env tsx
/**
 * FSRS MVP R5 — métricas ops (read-only).
 * Gera artifacts/fsrs-mvp-ops-<YYYYMMDD>.md
 *
 * Uso:
 *   npx tsx scripts/fsrs-mvp-ops-report.ts
 *   npx tsx scripts/fsrs-mvp-ops-report.ts --dry-run
 *   npm run fsrs:ops-report -- --dry-run
 *   npm run fsrs:ops-report -- --smoke-pass --production-off
 *
 * Live: SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL.
 * Dry-run: sem credenciais; contadores zerados; exit 0.
 * Sintéticos (smoke) são excluídos das métricas de negócio.
 * Não altera rating policy nem liga default-on.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  evaluateFsrsGoNoGo,
  evaluateFsrsRolloutVerdict,
  findFsrsOpsReportPiiLeaks,
  opsReportArtifactFileName,
  renderFsrsOpsReportMarkdown,
  zeroFsrsOpsMetrics,
  type FsrsOpsMetrics,
  type FsrsOpsReportMode,
} from '@/lib/fsrs/opsReport';

loadEnvConfig(process.cwd());

const SMOKE_EMAIL_DEFAULT = 'fsrs-mvp-smoke@avant.test';
const SMOKE_CREDENTIALS_PATH = join(
  process.cwd(),
  'artifacts',
  'fsrs-mvp-staging-smoke-credentials.json',
);
const SMOKE_REPORT_PATH = join(
  process.cwd(),
  'artifacts',
  'fsrs-mvp-staging-smoke-report.md',
);

type Args = {
  dryRun: boolean;
  outDir: string | null;
  smokePass: boolean | null;
  productionOff: boolean;
  includeSynthetic: boolean;
};

function parseArgs(argv: string[]): Args {
  let dryRun = false;
  let outDir: string | null = null;
  let smokePass: boolean | null = null;
  let productionOff = true;
  let includeSynthetic = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--smoke-pass') {
      smokePass = true;
      continue;
    }
    if (arg === '--smoke-fail') {
      smokePass = false;
      continue;
    }
    if (arg === '--production-on') {
      productionOff = false;
      continue;
    }
    if (arg === '--production-off') {
      productionOff = true;
      continue;
    }
    if (arg === '--include-synthetic') {
      includeSynthetic = true;
      continue;
    }
    if (arg === '--out-dir' && argv[i + 1]) {
      outDir = argv[++i] ?? null;
      continue;
    }
    if (arg?.startsWith('--out-dir=')) {
      outDir = arg.slice('--out-dir='.length) || null;
    }
  }
  return { dryRun, outDir, smokePass, productionOff, includeSynthetic };
}

function readSmokeOverallPass(): boolean | null {
  if (!existsSync(SMOKE_REPORT_PATH)) return null;
  try {
    const md = readFileSync(SMOKE_REPORT_PATH, 'utf8');
    if (/\*\*overall:\*\*\s*PASS/i.test(md)) return true;
    if (/\*\*overall:\*\*\s*FAIL/i.test(md)) return false;
  } catch {
    /* ignore */
  }
  return null;
}

function readSyntheticUserIdsFromSidecar(): string[] {
  if (!existsSync(SMOKE_CREDENTIALS_PATH)) return [];
  try {
    // PowerShell Set-Content pode gravar UTF-16 LE com BOM.
    const buf = readFileSync(SMOKE_CREDENTIALS_PATH);
    let text: string;
    if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
      text = buf.toString('utf16le');
    } else if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      text = buf.toString('utf8').replace(/^\uFEFF/, '');
    } else {
      text = buf.toString('utf8').replace(/^\uFEFF/, '');
    }
    const raw = JSON.parse(text) as {
      user_id?: string;
      synthetic?: boolean;
    };
    if (raw.synthetic === false) return [];
    if (typeof raw.user_id === 'string' && raw.user_id.length > 0) {
      return [raw.user_id];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function readSyntheticUserIdsFromEnv(): string[] {
  const raw = process.env.FSRS_OPS_SYNTHETIC_USER_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function resolveSyntheticUserIds(
  admin: SupabaseClient,
): Promise<string[]> {
  const ids = new Set<string>([
    ...readSyntheticUserIdsFromEnv(),
    ...readSyntheticUserIdsFromSidecar(),
  ]);

  // Auth admin: usuários marcados no metadata do smoke ou e-mail canônico.
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = data.users ?? [];
    for (const u of users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const email = (u.email ?? '').toLowerCase();
      if (
        meta.fsrs_mvp_synthetic_smoke === true ||
        email === SMOKE_EMAIL_DEFAULT ||
        email.startsWith('fsrs-mvp-smoke@')
      ) {
        ids.add(u.id);
      }
    }
    if (users.length < perPage) break;
    page += 1;
    if (page > 20) break;
  }

  return [...ids];
}

function applyUserScope<T>(
  q: T & {
    eq: (column: string, value: string) => T;
    neq: (column: string, value: string) => T;
    in: (column: string, values: string[]) => T;
    not: (column: string, operator: string, value: string) => T;
  },
  opts: { only?: string[]; exclude?: string[] },
): T {
  if (opts.only && opts.only.length > 0) {
    return opts.only.length === 1
      ? q.eq('user_id', opts.only[0]!)
      : q.in('user_id', opts.only);
  }
  if (opts.exclude && opts.exclude.length > 0) {
    return opts.exclude.length === 1
      ? q.neq('user_id', opts.exclude[0]!)
      : q.not(
          'user_id',
          'in',
          `(${opts.exclude.map((id) => `"${id}"`).join(',')})`,
        );
  }
  return q;
}

async function fetchLiveMetrics(
  url: string,
  key: string,
  opts: { includeSynthetic: boolean },
): Promise<FsrsOpsMetrics> {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const nowIso = new Date().toISOString();
  const syntheticIds = await resolveSyntheticUserIds(supabase);
  const exclude =
    opts.includeSynthetic || syntheticIds.length === 0 ? [] : syntheticIds;

  const head = { count: 'exact' as const, head: true };

  const grossCardsQ = await supabase
    .from('spaced_review_cards')
    .select('id', head);
  const grossLogsQ = await supabase.from('spaced_review_logs').select('id', head);

  const syntheticCardsQ = await applyUserScope(
    supabase.from('spaced_review_cards').select('id', head),
    { only: syntheticIds },
  );
  const syntheticLogsQ = await applyUserScope(
    supabase.from('spaced_review_logs').select('id', head),
    { only: syntheticIds },
  );

  const cardsQ = await applyUserScope(
    supabase.from('spaced_review_cards').select('id', head),
    { exclude },
  );
  const logsQ = await applyUserScope(
    supabase.from('spaced_review_logs').select('id', head),
    { exclude },
  );
  const goodQ = await applyUserScope(
    supabase.from('spaced_review_logs').select('id', head).eq('rating', 'good'),
    { exclude },
  );
  const againQ = await applyUserScope(
    supabase.from('spaced_review_logs').select('id', head).eq('rating', 'again'),
    { exclude },
  );
  const sameStemQ = await applyUserScope(
    supabase
      .from('spaced_review_logs')
      .select('id', head)
      .eq('same_stem_fallback', true),
    { exclude },
  );
  const intervalQ = await applyUserScope(
    supabase
      .from('spaced_review_logs')
      .select('id', head)
      .gte('scheduled_days', 7),
    { exclude },
  );
  const intervalGoodQ = await applyUserScope(
    supabase
      .from('spaced_review_logs')
      .select('id', head)
      .gte('scheduled_days', 7)
      .eq('rating', 'good'),
    { exclude },
  );
  const dueQ = await applyUserScope(
    supabase
      .from('spaced_review_cards')
      .select('id', head)
      .lte('due_at', nowIso),
    { exclude },
  );

  const grossCards = grossCardsQ.count ?? 0;
  const grossLogs = grossLogsQ.count ?? 0;
  const syntheticCards =
    syntheticIds.length === 0 ? 0 : (syntheticCardsQ.count ?? 0);
  const syntheticLogs =
    syntheticIds.length === 0 ? 0 : (syntheticLogsQ.count ?? 0);
  const cards = cardsQ.count ?? 0;
  const totalLogs = logsQ.count ?? 0;
  const goods = goodQ.count ?? 0;
  const agains = againQ.count ?? 0;
  const sameStem = sameStemQ.count ?? 0;
  const intervalSample = intervalQ.count ?? 0;
  const intervalGoods = intervalGoodQ.count ?? 0;
  const due = dueQ.count ?? 0;

  return {
    cards,
    logs: totalLogs,
    good: goods,
    again: agains,
    sameStemFallback: sameStem,
    inventoryMissing: null,
    goodRateIntervalGe7d:
      intervalSample > 0 ? intervalGoods / intervalSample : null,
    intervalGe7dSample: intervalSample,
    accuracyD7: null,
    accuracyD7Sample: 0,
    accuracyD14: null,
    accuracyD14Sample: 0,
    lapsesPerUserDay: null,
    dueLoadRatio: null,
    dueNow: due,
    sameStemRate: totalLogs > 0 ? sameStem / totalLogs : null,
    inventoryMissingRate: null,
    grossCards,
    grossLogs,
    syntheticCards,
    syntheticLogs,
    syntheticExcluded: exclude.length > 0,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode: FsrsOpsReportMode = args.dryRun ? 'dry-run' : 'live';
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');

  let metrics: FsrsOpsMetrics;

  if (args.dryRun) {
    metrics = zeroFsrsOpsMetrics();
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      console.error(
        'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY obrigatórias (ou use --dry-run).',
      );
      process.exit(1);
    }
    metrics = await fetchLiveMetrics(url, key, {
      includeSynthetic: args.includeSynthetic,
    });
  }

  const criteria = evaluateFsrsGoNoGo(metrics);
  const smokeFromArtifact = readSmokeOverallPass();
  const smokeOverallPass =
    args.smokePass ?? smokeFromArtifact ?? (args.dryRun ? false : false);

  const verdict = evaluateFsrsRolloutVerdict({
    criteria,
    smokeOverallPass,
    productionFlagsOff: args.productionOff,
  });

  const md = renderFsrsOpsReportMarkdown({
    generatedAt: now,
    metrics,
    mode,
    criteria,
    verdict,
  });

  const leaks = findFsrsOpsReportPiiLeaks(md);
  if (leaks.length > 0) {
    console.error(`Ops report PII leak detected: ${leaks.join(', ')}`);
    process.exit(1);
  }

  const outDir = args.outDir ?? join(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, opsReportArtifactFileName(day, mode));
  writeFileSync(outPath, md, 'utf8');
  console.log(`Wrote ${outPath}`);
  console.log(
    `Verdict staging_beta=${verdict.stagingBeta} default_on=${verdict.defaultOn} synthetic_excluded=${metrics.syntheticExcluded} gross_logs=${metrics.grossLogs} biz_logs=${metrics.logs}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
