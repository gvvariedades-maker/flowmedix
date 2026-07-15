#!/usr/bin/env tsx
/**
 * Preenche meta.sources tier A + content_review (Segurança do Paciente).
 *
 *   npm run enrich:seguranca-paciente-guideline-meta -- --lote=seguranca-do-paciente-g01 --write
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { enrichSegurancaPacienteGuidelineMeta } from '@/lib/catalogMigration/segurancaPacientePedagogy';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

function loadTargets(): { path: string; slug: string }[] {
  const file = parseArg('file');
  const lote = parseArg('lote');

  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/^.*[/\\]/, '').replace(/\.json$/, '');
    return [{ path, slug }];
  }

  if (!lote) throw new Error('Informe --file= ou --lote=');

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
    const { payload: next, changed, reasons } = enrichSegurancaPacienteGuidelineMeta(payload);
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
  const outPath = resolve(outDir, 'seguranca-paciente-guideline-meta-enrich.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({ ...report, artifact: outPath }, null, 2));
}

main();
