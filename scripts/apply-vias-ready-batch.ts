#!/usr/bin/env tsx
/**
 * Apply em massa — lotes Vias de Administração com questions/ completo (handcraft ready).
 *
 *   npm run apply:vias-ready-batch
 *   npm run apply:vias-ready-batch -- --dry-run
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { loadLoteMeta, saveLoteMeta } from '@/lib/catalogMigration/anchorReview';

const SKIP_STATUSES = new Set(['applied', 'superseded']);
const LOTES_EXTRA = ['vias-de-administracao-consulpam-repair'];

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
  const m = lote.match(/vias-de-administracao-g(\d+)/);
  return m ? Number(m[1]) : 999;
}

function discoverLotes(): string[] {
  const root = resolve('data/catalog-migration');
  const found = new Set<string>();

  for (const name of readdirSync(root)) {
    if (!name.startsWith('vias-de-administracao-g')) continue;
    if (!existsSync(join(root, name, 'manifest.json'))) continue;
    found.add(name);
  }
  for (const l of LOTES_EXTRA) {
    if (existsSync(join(root, l, 'manifest.json'))) found.add(l);
  }

  return [...found].sort((a, b) => {
    const na = loteNum(a);
    const nb = loteNum(b);
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
}

function isEligible(lote: string): { ok: boolean; reason?: string; expected?: number } {
  const meta = loadLoteMeta(lote);
  if (meta && SKIP_STATUSES.has(meta.status ?? '')) {
    return { ok: false, reason: `status=${meta.status}` };
  }

  const manifestPath = resolve(`data/catalog-migration/${lote}/manifest.json`);
  if (!existsSync(manifestPath)) return { ok: false, reason: 'sem manifest' };

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
  const expected = manifest.slugs?.length ?? 0;
  if (expected === 0) return { ok: false, reason: 'manifest vazio' };

  const qd = loteQuestionsDir(lote);
  if (!existsSync(qd)) return { ok: false, reason: 'sem questions/' };

  const count = readdirSync(qd).filter((f) => f.endsWith('.json')).length;
  if (count !== expected) {
    return { ok: false, reason: `questions ${count}/${expected}` };
  }

  return { ok: true, expected };
}

function countAppliedSlugs(): number {
  const goldenApplied = new Set<string>();
  const artifactsDir = resolve('artifacts');
  if (existsSync(artifactsDir)) {
    for (const file of readdirSync(artifactsDir)) {
      if (!file.startsWith('catalog-migration-vias-de-administracao-') || !file.endsWith('-applied.json')) {
        continue;
      }
      const data = JSON.parse(readFileSync(join(artifactsDir, file), 'utf8')) as {
        applied_slugs?: string[];
      };
      for (const s of data.applied_slugs ?? []) goldenApplied.add(s);
    }
  }

  const manifest = JSON.parse(
    readFileSync(resolve('data/catalog-migration/vias-de-administracao-completo/manifest.json'), 'utf8'),
  ) as { slugs?: string[] };
  const viasOnly = (manifest.slugs ?? []).filter((s) => s.includes('vias-de-administracao'));
  return viasOnly.filter((s) => goldenApplied.has(s)).length;
}

function main() {
  const dryRun = hasFlag('dry-run');
  const allLotes = discoverLotes();
  const candidates: Array<{ lote: string; expected: number }> = [];

  for (const lote of allLotes) {
    const check = isEligible(lote);
    if (check.ok) {
      candidates.push({ lote, expected: check.expected! });
    } else {
      console.log(`[apply:vias-ready-batch] skip ${lote}: ${check.reason}`);
    }
  }

  console.log(`[apply:vias-ready-batch] lotes elegíveis: ${candidates.length}`);
  if (dryRun) {
    for (const { lote, expected } of candidates) console.log(`  · ${lote} (${expected} slugs)`);
    return;
  }

  const results: Array<{
    lote: string;
    status: 'ok' | 'anchor_fail' | 'apply_fail';
    detail?: string;
    ok?: number;
  }> = [];

  for (const { lote, expected } of candidates) {
    console.log(`\n[apply:vias-ready-batch] === ${lote} (${expected} slugs) ===`);

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
    const ok = okMatch ? Number(okMatch[1]) : expected;
    results.push({ lote, status: 'ok', ok });

    const loteMeta = loadLoteMeta(lote);
    if (loteMeta) {
      saveLoteMeta(lote, {
        ...loteMeta,
        status: 'applied',
        applied_at: new Date().toISOString().slice(0, 10),
      });
    }
  }

  const appliedLotes = results.filter((r) => r.status === 'ok');
  const handcraftApplied = countAppliedSlugs();

  const metaPath = resolve('data/catalog-migration/vias-de-administracao-completo/handcraft-meta.json');
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as Record<string, unknown>;
  meta.handcraft_applied = handcraftApplied;
  meta.total_slugs_estimate = 208;
  meta.status = handcraftApplied >= 208 ? 'applied' : 'in_progress';
  meta.updated_at = new Date().toISOString().slice(0, 10);
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  const registryPath = resolve('data/catalog-migration/handcraft-registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
    pacotes: Record<
      string,
      { handcraft_applied?: number; total_slugs?: number; status?: string; updated_at?: string }
    >;
    updated_at?: string;
  };
  if (registry.pacotes['Vias de Administração']) {
    const pkg = registry.pacotes['Vias de Administração'];
    pkg.handcraft_applied = handcraftApplied;
    pkg.total_slugs = 208;
    pkg.status = handcraftApplied >= 208 ? 'applied' : 'in_progress';
  }
  registry.updated_at = new Date().toISOString().slice(0, 10);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: false,
    candidates: candidates.length,
    applied_lotes: appliedLotes.length,
    failed_lotes: results.filter((r) => r.status !== 'ok').length,
    slugs_attempted: appliedLotes.reduce((n, r) => n + (r.ok ?? 0), 0),
    handcraft_applied_total: handcraftApplied,
    results,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const out = resolve('artifacts/vias-apply-batch-report.json');
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\n[apply:vias-ready-batch] RESUMO');
  console.log(`  aplicados: ${appliedLotes.length}/${candidates.length} lotes`);
  console.log(`  handcraft_applied registry: ${handcraftApplied}/208`);
  console.log(`  relatório: ${out}`);

  if (report.failed_lotes > 0) process.exitCode = 1;
}

main();
