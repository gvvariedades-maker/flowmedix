#!/usr/bin/env tsx
/**
 * Preenche meta.sources + content_review.guideline_snapshot (COFEN) em questões Vias
 * com dose, ângulo, volume ou claims numéricos nos slides.
 *
 * Uso:
 *   npm run enrich:vias-guideline-meta -- --file=examples/questao-premium-cpcon-vias-im-vf.json --write
 *   npm run enrich:vias-guideline-meta -- --lote=vias-de-administracao-g01 --write
 *   npm run enrich:vias-guideline-meta -- --examples-vias --write
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { enrichViasGuidelineMeta } from '@/lib/catalogMigration/viasPedagogy';

function loadTargets(): { path: string; slug: string }[] {
  const file = parseArg('file');
  const lote = parseArg('lote');
  const examplesVias = process.argv.includes('--examples-vias');

  if (examplesVias) {
    const dir = resolve(process.cwd(), 'examples');
    return readdirSync(dir)
      .filter((n) => n.includes('vias') && n.endsWith('.json'))
      .sort()
      .map((n) => ({ path: join(dir, n), slug: n.replace(/\.json$/, '') }));
  }

  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/^.*[/\\]/, '').replace(/\.json$/, '');
    return [{ path, slug }];
  }

  if (!lote) throw new Error('Informe --file=, --lote= ou --examples-vias');

  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) throw new Error(`Lote não encontrado: ${dir}`);

  return readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .sort()
    .map((n) => ({ path: join(dir, n), slug: n.replace(/\.json$/, '') }));
}

function main(): void {
  const write = process.argv.includes('--write');
  const targets = loadTargets();

  const report = {
    generated_at: new Date().toISOString(),
    scanned: 0,
    enriched: 0,
    skipped: 0,
    results: [] as { slug: string; changed: boolean; reasons: string[] }[],
  };

  for (const { path, slug } of targets) {
    const payload = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    report.scanned += 1;
    const { payload: next, changed, reasons } = enrichViasGuidelineMeta(payload);
    if (changed) {
      report.enriched += 1;
      if (write) {
        writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
      }
    } else {
      report.skipped += 1;
    }
    report.results.push({ slug, changed, reasons });
  }

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'vias-guideline-meta-enrich.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(
    `[enrich:vias-guideline-meta] scanned=${report.scanned} enriched=${report.enriched} skipped=${report.skipped} write=${write}`,
  );
  for (const r of report.results.filter((x) => x.changed)) {
    console.log(`  ${write ? 'WROTE' : 'WOULD'} ${r.slug}: ${r.reasons.join(', ')}`);
  }
  console.log(`[enrich:vias-guideline-meta] report=${outPath}`);
}

main();
