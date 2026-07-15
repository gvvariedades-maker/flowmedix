#!/usr/bin/env tsx
/**
 * Comando unificado — qualidade vendável por subtópico (L1–L6).
 *
 * Uso:
 *   npm run audit:subtopico-quality -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
 *   npm run audit:subtopico-quality -- --subtopico="Processamento de Artigos e Produtos de Saúde" --promote
 *   npm run audit:subtopico-quality -- --subtopico="..." --promote --skip-l3  # emergência
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const TSX_CLI = require.resolve('tsx/cli');

loadEnvConfig(process.cwd());

import { hasFlag, requireArg } from '@/lib/catalogMigration/cliArgs';
import { loadLoteMeta } from '@/lib/catalogMigration/anchorReview';
import {
  evaluateContentHealth,
  fetchOpenReportsBySubtopico,
  fetchSessions30dBySubtopico,
} from '@/lib/catalogMigration/contentHealth';
import {
  applyShipPromote,
  applyTechnicalReadyOnly,
  findPacoteBySubtopico,
  loadHandcraftRegistry,
  saveHandcraftRegistry,
} from '@/lib/catalogMigration/handcraftRegistry';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { lintSlugAlignment, slugAlignmentHasErrors } from '@/lib/catalogMigration/slugAlignment';
import {
  lintNumericFactcheck,
  numericFactcheckHasErrors,
} from '@/lib/catalogMigration/numericFactcheck';
import {
  buildShipBlockers,
  canPromoteToSell,
  canSell,
  checkL3VisualMold,
  isTechnicalReady,
  normalizeProductionStatus,
  type LayerResult,
  type VisualMoldSummary,
} from '@/lib/catalogMigration/shipGate';
import { createServerSupabase } from '@/lib/supabase/server';

function runHandcraftDod(subtopico: string): LayerResult {
  const result = spawnSync(
    process.execPath,
    [TSX_CLI, 'scripts/audit-handcraft-dod.ts', `--subtopico=${subtopico}`],
    { encoding: 'utf8', cwd: process.cwd() },
  );
  return {
    pass: result.status === 0,
    detail: result.status === 0 ? 'handcraft-dod PASS' : 'handcraft-dod FAIL',
  };
}

function auditLoteSlugs(lote: string): { scanned: number; alignment_fail: number; numeric_fail: number } {
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) return { scanned: 0, alignment_fail: 0, numeric_fail: 0 };

  let alignment_fail = 0;
  let numeric_fail = 0;
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const payload = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
    if (slugAlignmentHasErrors(lintSlugAlignment(payload, { strict: true }))) alignment_fail += 1;
    if (numericFactcheckHasErrors(lintNumericFactcheck(payload))) numeric_fail += 1;
  }

  return { scanned: files.length, alignment_fail, numeric_fail };
}

function listPacoteLotes(pacotePrefix: string): string[] {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  return readdirSync(root)
    .filter((n) => {
      if (!n.startsWith(`${pacotePrefix}-g`)) return false;
      const dir = join(root, n);
      return statSync(dir).isDirectory() && existsSync(join(dir, 'manifest.json'));
    })
    .sort();
}

function checkAnchorReviews(pacotePrefix: string): LayerResult {
  const lotes = listPacoteLotes(pacotePrefix);

  if (lotes.length === 0) {
    return { pass: true, detail: 'sem lotes g* — anchor review N/A' };
  }

  const pending: string[] = [];
  const failed: string[] = [];

  for (const lote of lotes) {
    const meta = loadLoteMeta(lote);
    const status = meta?.anchor_second_review?.status ?? 'pending';
    if (status === 'pass') continue;
    if (status === 'fail') failed.push(lote);
    else pending.push(lote);
  }

  if (failed.length > 0) {
    return { pass: false, detail: `anchor fail: ${failed.join(', ')}` };
  }
  if (pending.length > 0) {
    return { pass: false, detail: `anchor pending: ${pending.join(', ')}` };
  }
  return { pass: true, detail: `all ${lotes.length} lotes anchor pass` };
}

function loadVisualMoldSummary(): VisualMoldSummary | null {
  const path = resolve(process.cwd(), 'artifacts/visual-mold-regression/summary.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as VisualMoldSummary;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const subtopico = requireArg('subtopico');
  const promote = hasFlag('promote');
  const skipDod = hasFlag('skip-dod');
  const skipL3 = hasFlag('skip-l3');

  const registry = loadHandcraftRegistry();
  const found = findPacoteBySubtopico(registry, subtopico);
  if (!found) {
    throw new Error(`Subtópico não encontrado no registry: ${subtopico}`);
  }

  const { key, pacote } = found;
  const prefix = pacote.pacote_prefix;
  const currentStatus = normalizeProductionStatus(pacote.production_status);

  if (promote && currentStatus === 'production_ready') {
    console.warn(
      '[audit:subtopico-quality] WARN: pacote já production_ready — use audit:subtopico-health para pós-venda',
    );
  }

  const L1 = skipDod ? { pass: true, detail: 'skipped' } : runHandcraftDod(subtopico);

  const loteStats = listPacoteLotes(prefix).map((lote) => ({ lote, ...auditLoteSlugs(lote) }));

  const alignmentTotal = loteStats.reduce((s, x) => s + x.alignment_fail, 0);
  const numericTotal = loteStats.reduce((s, x) => s + x.numeric_fail, 0);
  const L2: LayerResult = {
    pass: alignmentTotal === 0,
    detail:
      alignmentTotal === 0
        ? `alignment OK (${loteStats.reduce((s, x) => s + x.scanned, 0)} slugs)`
        : `${alignmentTotal} slug(s) com alignment fail`,
  };
  const L2b: LayerResult = {
    pass: numericTotal === 0,
    detail:
      numericTotal === 0
        ? 'numeric factcheck OK'
        : `${numericTotal} slug(s) com numeric fail`,
  };

  const L6 = checkAnchorReviews(prefix);
  const L3 = checkL3VisualMold(prefix, loadVisualMoldSummary(), { skipL3 });
  const L4: LayerResult = {
    pass: true,
    detail: 'capture cirúrgico — warn only (não bloqueia ship)',
  };

  const supabase = await createServerSupabase();
  const [sessions30d, open] = await Promise.all([
    fetchSessions30dBySubtopico(supabase, subtopico),
    fetchOpenReportsBySubtopico(supabase, subtopico),
  ]);
  const health = evaluateContentHealth(subtopico, sessions30d, open, pacote.quality?.slo);
  const L5: LayerResult = {
    pass: health.pass,
    detail: health.pass ? 'content health OK' : health.blockers.join('; '),
  };

  const layers = { L1, L2, L2b, L3, L4, L5, L6 };
  const technical_ready = isTechnicalReady(layers);
  const blockers = buildShipBlockers(layers, health.pass, health.blockers);

  const shipReport = {
    technical_ready,
    layers,
    content_health: { pass: health.pass, blockers: health.blockers },
    blockers,
  };

  const shipGate = canPromoteToSell(shipReport);
  const production_ready = shipGate.ok;
  const can_sell_now = canSell(pacote);
  const would_be_vendavel = production_ready;

  const report = {
    generated_at: new Date().toISOString(),
    subtopico,
    pacote_prefix: prefix,
    production_status_before: currentStatus,
    technical_ready,
    production_ready,
    can_sell: would_be_vendavel || can_sell_now,
    continuous_eligible: would_be_vendavel || can_sell_now,
    ship_gate: shipGate,
    monitoring: {
      deprecated: true,
      note: 'monitoring_until não é mais gate de venda — ver docs/DECISAO_QUALITY_HIBRIDA.md',
      sessions_30d: sessions30d,
    },
    layers,
    lote_stats: loteStats,
    content_health: health,
    blockers: shipGate.blockers,
  };

  const outDir = resolve(process.cwd(), 'artifacts/subtopico-quality');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `${prefix}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  if (promote) {
    if (shipGate.ok) {
      applyShipPromote(registry, key, shipReport);
      saveHandcraftRegistry(registry);
      console.log('[audit:subtopico-quality] VENDÁVEL — production_status=production_ready');
    } else if (technical_ready) {
      applyTechnicalReadyOnly(registry, key, shipReport);
      saveHandcraftRegistry(registry);
      console.log('[audit:subtopico-quality] technical_ready gravado — ship gate FAIL');
    } else {
      console.log('[audit:subtopico-quality] promote ignorado — technical_ready FAIL');
    }
  }

  console.log(`[audit:subtopico-quality] subtopico="${subtopico}"`);
  console.log(`[audit:subtopico-quality] technical_ready=${technical_ready} production_ready=${production_ready}`);
  for (const layer of ['L1', 'L2', 'L2b', 'L3', 'L5', 'L6'] as const) {
    const res = layers[layer];
    console.log(`  ${layer}: ${res.pass ? 'PASS' : 'FAIL'} — ${res.detail}`);
  }
  if (shipGate.blockers.length > 0) {
    console.log('[audit:subtopico-quality] blockers:');
    for (const b of shipGate.blockers) console.log(`  · ${b}`);
  }
  console.log(`[audit:subtopico-quality] report=${outPath}`);

  process.exitCode = production_ready ? 0 : 1;
}

main().catch((err) => {
  console.error('[audit:subtopico-quality]', err);
  process.exitCode = 1;
});
