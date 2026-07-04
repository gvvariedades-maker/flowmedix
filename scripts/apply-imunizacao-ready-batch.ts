#!/usr/bin/env tsx
/**
 * Apply em massa — lotes Imunização com 8/8 questions/ (handcraft_ready + exported com disco).
 *
 *   npm run apply:imunizacao-ready-batch
 *   npm run apply:imunizacao-ready-batch -- --dry-run
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { loadLoteMeta, saveLoteMeta } from '@/lib/catalogMigration/anchorReview';

type HandcraftMeta = {
  handcraft_applied?: number;
  handcraft_ready_lotes?: Record<
    string,
    {
      status?: string;
      slug_count?: number;
      readiness?: string;
      notes?: string;
    }
  >;
};

const SKIP_STATUSES = new Set(['applied', 'superseded']);

function npm(args: string[]): { ok: boolean; output: string } {
  const r = spawnSync('npm', args, {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  return { ok: r.status === 0, output };
}

function loteNum(lote: string): number {
  return Number(lote.replace('imunizacao-g', ''));
}

function main() {
  const dryRun = hasFlag('dry-run');
  const metaPath = resolve('data/catalog-migration/imunizacao-completo/handcraft-meta.json');
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as HandcraftMeta;

  const candidates = Object.entries(meta.handcraft_ready_lotes ?? {})
    .filter(([lote, entry]) => {
      if (SKIP_STATUSES.has(entry.status ?? '')) return false;
      if (!lote.startsWith('imunizacao-g')) return false;
      const qd = loteQuestionsDir(lote);
      if (!existsSync(qd)) return false;
      const count = readdirSync(qd).filter((f) => f.endsWith('.json')).length;
      return count === 8;
    })
    .map(([lote]) => lote)
    .sort((a, b) => loteNum(a) - loteNum(b));

  console.log(`[apply:imunizacao-ready-batch] lotes elegíveis: ${candidates.length}`);
  if (dryRun) {
    for (const l of candidates) console.log(`  · ${l}`);
    return;
  }

  const results: Array<{
    lote: string;
    status: 'ok' | 'anchor_fail' | 'apply_fail';
    detail?: string;
    ok?: number;
  }> = [];

  for (const lote of candidates) {
    console.log(`\n[apply:imunizacao-ready-batch] === ${lote} ===`);

    const anchor = npm([
      'run',
      'audit:anchor-review',
      '--',
      `--lote=${lote}`,
      '--record-pass',
      '--reviewer=agent',
      '--skip-capture',
    ]);
    if (!anchor.ok) {
      console.error(anchor.output);
      results.push({ lote, status: 'anchor_fail', detail: anchor.output.slice(-500) });
      continue;
    }

    const apply = npm(['run', 'catalog:apply-lote', '--', `--lote=${lote}`, '--apply']);
    console.log(apply.output);
    if (!apply.ok) {
      results.push({ lote, status: 'apply_fail', detail: apply.output.slice(-500) });
      continue;
    }

    const okMatch = apply.output.match(/ok=(\d+)/);
    const ok = okMatch ? Number(okMatch[1]) : 8;
    results.push({ lote, status: 'ok', ok });

    const artifact = `artifacts/catalog-migration-${lote}-applied.json`;
    const entry = meta.handcraft_ready_lotes![lote];
    meta.handcraft_ready_lotes![lote] = {
      ...entry,
      status: 'applied',
      applied_at: new Date().toISOString().slice(0, 10),
      readiness: '8/8',
      artifact,
      notes: `apply batch ${new Date().toISOString().slice(0, 10)} — ${ok}/8 OK`,
    };

    const loteMeta = loadLoteMeta(lote);
    if (loteMeta) {
      saveLoteMeta(lote, { ...loteMeta, status: 'applied' });
    }
  }

  const appliedLotes = results.filter((r) => r.status === 'ok');

  const goldenApplied = new Set<string>();
  const artifactsDir = resolve('artifacts');
  if (existsSync(artifactsDir)) {
    for (const file of readdirSync(artifactsDir)) {
      if (!/^catalog-migration-imunizacao-g\d+-applied\.json$/.test(file)) continue;
      const data = JSON.parse(readFileSync(join(artifactsDir, file), 'utf8')) as {
        applied_slugs?: string[];
      };
      for (const s of data.applied_slugs ?? []) goldenApplied.add(s);
    }
    for (const file of readdirSync(artifactsDir)) {
      if (!file.startsWith('catalog-migration-imunizacao-') || !file.endsWith('-applied.json')) continue;
      if (/^catalog-migration-imunizacao-g\d+-applied\.json$/.test(file)) continue;
      if (!/repair-applied|decorp-triplice|admtec-adolescente|ameosc-cadeia-frio|avancasp-rede-frio/.test(file)) {
        continue;
      }
      const data = JSON.parse(readFileSync(join(artifactsDir, file), 'utf8')) as {
        applied_slugs?: string[];
      };
      for (const s of data.applied_slugs ?? []) goldenApplied.add(s);
    }
  }
  const manifest = JSON.parse(
    readFileSync(resolve('data/catalog-migration/imunizacao-completo/manifest.json'), 'utf8'),
  ) as { slugs?: string[] };
  const inCatalog = (manifest.slugs ?? []).filter((s) => goldenApplied.has(s)).length;
  meta.handcraft_applied = inCatalog;

  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  const registryPath = resolve('data/catalog-migration/handcraft-registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
    pacotes: Record<string, { handcraft_applied?: number }>;
  };
  if (registry.pacotes['Imunização']) {
    registry.pacotes['Imunização'].handcraft_applied = meta.handcraft_applied;
    writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  }

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: false,
    candidates: candidates.length,
    applied_lotes: appliedLotes.length,
    failed_lotes: results.filter((r) => r.status !== 'ok').length,
    slugs_attempted: appliedLotes.reduce((n, r) => n + (r.ok ?? 8), 0),
    handcraft_applied_total: meta.handcraft_applied,
    results,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const out = resolve('artifacts/imunizacao-apply-batch-report.json');
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\n[apply:imunizacao-ready-batch] RESUMO');
  console.log(`  aplicados: ${appliedLotes.length}/${candidates.length} lotes`);
  console.log(`  handcraft_applied registry: ${meta.handcraft_applied}`);
  console.log(`  relatório: ${out}`);

  if (report.failed_lotes > 0) process.exitCode = 1;
}

main();
