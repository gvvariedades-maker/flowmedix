#!/usr/bin/env tsx
/**
 * FSRS MVP R5 — métricas ops (read-only).
 * Gera artifacts/fsrs-mvp-ops-<YYYYMMDD>.md
 *
 * Uso:
 *   npx tsx scripts/fsrs-mvp-ops-report.ts
 *   npx tsx scripts/fsrs-mvp-ops-report.ts --dry-run
 *   npm run fsrs:ops-report -- --dry-run
 *
 * Live: SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL.
 * Dry-run: sem credenciais; contadores zerados; exit 0.
 * Não altera rating policy nem liga default-on.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

import {
  evaluateFsrsGoNoGo,
  findFsrsOpsReportPiiLeaks,
  opsReportArtifactFileName,
  renderFsrsOpsReportMarkdown,
  zeroFsrsOpsMetrics,
  type FsrsOpsMetrics,
  type FsrsOpsReportMode,
} from '@/lib/fsrs/opsReport';

loadEnvConfig(process.cwd());

function parseArgs(argv: string[]): { dryRun: boolean; outDir: string | null } {
  let dryRun = false;
  let outDir: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
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
  return { dryRun, outDir };
}

async function fetchLiveMetrics(
  url: string,
  key: string,
): Promise<FsrsOpsMetrics> {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const nowIso = new Date().toISOString();

  const { count: logCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true });

  const { count: cardCount } = await supabase
    .from('spaced_review_cards')
    .select('id', { count: 'exact', head: true });

  const { count: againCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('rating', 'again');

  const { count: goodCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('rating', 'good');

  const { count: sameStemCount } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('same_stem_fallback', true);

  const { count: intervalGe7dTotal } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .gte('scheduled_days', 7);

  const { count: intervalGe7dGood } = await supabase
    .from('spaced_review_logs')
    .select('id', { count: 'exact', head: true })
    .gte('scheduled_days', 7)
    .eq('rating', 'good');

  const { count: dueNow } = await supabase
    .from('spaced_review_cards')
    .select('id', { count: 'exact', head: true })
    .lte('due_at', nowIso);

  const totalLogs = logCount ?? 0;
  const goods = goodCount ?? 0;
  const agains = againCount ?? 0;
  const sameStem = sameStemCount ?? 0;
  const intervalSample = intervalGe7dTotal ?? 0;
  const intervalGoods = intervalGe7dGood ?? 0;
  const due = dueNow ?? 0;
  const cards = cardCount ?? 0;

  return {
    cards,
    logs: totalLogs,
    good: goods,
    again: agains,
    sameStemFallback: sameStem,
    // Telemetria de fila (logger) — sem coluna em spaced_review_logs.
    inventoryMissing: null,
    goodRateIntervalGe7d:
      intervalSample > 0 ? intervalGoods / intervalSample : null,
    intervalGe7dSample: intervalSample,
    // D+7/D+14 por unidade e lapses/user/day exigem agregação mais rica.
    accuracyD7: null,
    accuracyD7Sample: 0,
    accuracyD14: null,
    accuracyD14Sample: 0,
    lapsesPerUserDay: null,
    dueLoadRatio: null,
    dueNow: due,
    sameStemRate: totalLogs > 0 ? sameStem / totalLogs : null,
    inventoryMissingRate: null,
  };
}

async function main() {
  const { dryRun, outDir: outDirArg } = parseArgs(process.argv.slice(2));
  const mode: FsrsOpsReportMode = dryRun ? 'dry-run' : 'live';
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');

  let metrics: FsrsOpsMetrics;

  if (dryRun) {
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
    metrics = await fetchLiveMetrics(url, key);
  }

  const criteria = evaluateFsrsGoNoGo(metrics);
  const md = renderFsrsOpsReportMarkdown({
    generatedAt: now,
    metrics,
    mode,
    criteria,
  });

  const leaks = findFsrsOpsReportPiiLeaks(md);
  if (leaks.length > 0) {
    console.error(`Ops report PII leak detected: ${leaks.join(', ')}`);
    process.exit(1);
  }

  const outDir = outDirArg ?? join(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, opsReportArtifactFileName(day, mode));
  writeFileSync(outPath, md, 'utf8');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
