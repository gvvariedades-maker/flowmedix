#!/usr/bin/env tsx
/**
 * Apply em massa — lotes Saúde da Criança handcraft ready.
 *
 *   npm run apply:saude-da-crianca-ready-batch
 *   npm run apply:saude-da-crianca-ready-batch -- --dry-run
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const PREFIX = 'saude-da-crianca';

function npm(args: string[]): { ok: boolean; output: string } {
  const r = spawnSync('npm', args, {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  return { ok: r.status === 0, output: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

function loteNum(lote: string): number {
  const m = lote.match(/saude-da-crianca-g(\d+)/);
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
  const slugs = new Set(manifest.slugs);
  const count = readdirSync(qd).filter((f) => f.endsWith('.json') && slugs.has(f.replace(/\.json$/, ''))).length;
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
    else console.log(`[apply:sc-ready-batch] skip ${lote}: ${check.reason}`);
  }

  console.log(`[apply:sc-ready-batch] lotes elegíveis: ${candidates.length}`);
  if (dryRun) {
    for (const { lote, expected } of candidates) console.log(`  · ${lote} (${expected} slugs)`);
    return;
  }

  const results: Array<{ lote: string; status: 'ok' | 'anchor_fail' | 'apply_fail'; ok?: number; detail?: string }> = [];

  for (const { lote, expected } of candidates) {
    console.log(`\n[apply:sc-ready-batch] === ${lote} (${expected} slugs) ===`);

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
    results.push({ lote, status: 'ok', ok: okMatch ? Number(okMatch[1]) : expected });
  }

  const applied = results.filter((r) => r.status === 'ok');
  const slugsApplied = applied.reduce((n, r) => n + (r.ok ?? 0), 0);

  const report = {
    generated_at: new Date().toISOString(),
    candidates: candidates.length,
    applied_lotes: applied.length,
    failed_lotes: results.filter((r) => r.status !== 'ok').length,
    slugs_applied: slugsApplied,
    results,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const out = resolve('artifacts/saude-da-crianca-apply-batch-report.json');
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\n[apply:sc-ready-batch] RESUMO');
  console.log(`  aplicados: ${applied.length}/${candidates.length} lotes`);
  console.log(`  slugs: ${slugsApplied}`);
  console.log(`  relatório: ${out}`);

  if (report.failed_lotes > 0) process.exitCode = 1;
}

main();
