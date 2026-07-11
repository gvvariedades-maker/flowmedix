#!/usr/bin/env tsx
/**
 * Apply em massa — lotes Saúde da Mulher com questions/ completo (handcraft ready).
 *
 *   npm run apply:saude-da-mulher-ready-batch
 *   npm run apply:saude-da-mulher-ready-batch -- --dry-run
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { loadLoteMeta, saveLoteMeta } from '@/lib/catalogMigration/anchorReview';

const PREFIX = 'saude-da-mulher';

function npm(args: string[]): { ok: boolean; output: string } {
  const r = spawnSync('npm', args, {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  return { ok: r.status === 0, output };
}

function loteNum(lote: string): number {
  const m = lote.match(/saude-da-mulher-g(\d+)/);
  return m ? Number(m[1]) : 999;
}

function discoverLotes(): string[] {
  const root = resolve('data/catalog-migration');
  const found: string[] = [];
  for (const name of readdirSync(root)) {
    if (!name.startsWith(`${PREFIX}-g`)) continue;
    if (!existsSync(join(root, name, 'manifest.json'))) continue;
    if (!existsSync(loteQuestionsDir(name))) continue;
    found.push(name);
  }
  return found.sort((a, b) => loteNum(a) - loteNum(b));
}

function isEligible(lote: string): { ok: boolean; reason?: string; expected?: number } {
  const manifestPath = resolve(`data/catalog-migration/${lote}/manifest.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
  const expected = manifest.slugs?.length ?? 0;
  if (expected === 0) return { ok: false, reason: 'manifest vazio' };

  const qd = loteQuestionsDir(lote);
  const count = readdirSync(qd).filter((f) => f.endsWith('.json')).length;
  if (count < expected) {
    return { ok: false, reason: `questions ${count}/${expected}` };
  }

  return { ok: true, expected };
}

function main() {
  const dryRun = hasFlag('dry-run');
  const candidates: Array<{ lote: string; expected: number }> = [];

  for (const lote of discoverLotes()) {
    const check = isEligible(lote);
    if (check.ok) candidates.push({ lote, expected: check.expected! });
    else console.log(`[apply:sm-ready-batch] skip ${lote}: ${check.reason}`);
  }

  console.log(`[apply:sm-ready-batch] lotes elegíveis: ${candidates.length}`);
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
    console.log(`\n[apply:sm-ready-batch] === ${lote} (${expected} slugs) ===`);

    const meta = loadLoteMeta(lote);
    if (!meta?.anchor_slug) {
      console.warn(`[apply:sm-ready-batch] WARN: ${lote} sem anchor_slug — rode seed-saude-da-mulher-l6-anchors`);
    }

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
      results.push({ lote, status: 'anchor_fail', detail: anchor.output.slice(-800) });
      continue;
    }

    const apply = npm(['run', 'catalog:apply-lote', '--', `--lote=${lote}`, '--apply']);
    console.log(apply.output);
    if (!apply.ok) {
      results.push({ lote, status: 'apply_fail', detail: apply.output.slice(-800) });
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
  const slugsApplied = appliedLotes.reduce((n, r) => n + (r.ok ?? 0), 0);

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: false,
    candidates: candidates.length,
    applied_lotes: appliedLotes.length,
    failed_lotes: results.filter((r) => r.status !== 'ok').length,
    slugs_attempted: slugsApplied,
    results,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const out = resolve('artifacts/saude-da-mulher-apply-batch-report.json');
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\n[apply:sm-ready-batch] RESUMO');
  console.log(`  aplicados: ${appliedLotes.length}/${candidates.length} lotes`);
  console.log(`  slugs: ${slugsApplied}`);
  console.log(`  relatório: ${out}`);

  if (report.failed_lotes > 0) process.exitCode = 1;
}

main();
