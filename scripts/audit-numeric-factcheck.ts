#!/usr/bin/env tsx
/**
 * Camada 2b — factcheck numérico contra guidelines.
 *
 * Uso:
 *   npm run audit:numeric-factcheck -- --lote=cme-g01
 *   npm run audit:numeric-factcheck -- --subtopico="Processamento de Artigos e Produtos de Saúde"
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  lintNumericFactcheck,
  numericFactcheckHasErrors,
  type NumericFactcheckIssue,
} from '@/lib/catalogMigration/numericFactcheck';

type SlugResult = {
  slug: string;
  ok: boolean;
  issues: NumericFactcheckIssue[];
};

function loadTargets(): { slug: string; payload: unknown }[] {
  const file = parseArg('file');
  const lote = parseArg('lote');
  const slugFilter = parseArg('slug')?.toLowerCase();
  const targets: { slug: string; payload: unknown }[] = [];

  if (file) {
    const path = resolve(process.cwd(), file);
    const slug = file.replace(/^.*[/\\]/, '').replace(/\.json$/, '');
    targets.push({ slug, payload: JSON.parse(readFileSync(path, 'utf8')) });
    return targets;
  }

  if (!lote) throw new Error('Informe --file= ou --lote=');

  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) throw new Error(`Lote não encontrado: ${dir}`);

  for (const f of readdirSync(dir)
    .filter((n) => n.endsWith('.json'))
    .sort()) {
    const slug = f.replace(/\.json$/, '');
    if (slugFilter && !slug.toLowerCase().includes(slugFilter)) continue;
    targets.push({
      slug,
      payload: JSON.parse(readFileSync(join(dir, f), 'utf8')),
    });
  }
  return targets;
}

function main(): void {
  const subtopicoFilter = parseArg('subtopico')?.toLowerCase();

  const targets = loadTargets().filter(({ payload }) => {
    if (!subtopicoFilter) return true;
    const sub = (payload as { meta?: { subtopico?: string } })?.meta?.subtopico?.toLowerCase() ?? '';
    return sub.includes(subtopicoFilter);
  });

  const results: SlugResult[] = targets.map(({ slug, payload }) => {
    const issues = lintNumericFactcheck(payload);
    return { slug, ok: !numericFactcheckHasErrors(issues), issues };
  });

  const report = {
    generated_at: new Date().toISOString(),
    scanned: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    warn_only: results.filter(
      (r) => r.ok && r.issues.some((i) => i.severity === 'warn'),
    ).length,
    results,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'numeric-factcheck-audit.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[audit:numeric-factcheck] scanned=${report.scanned} pass=${report.passed} fail=${report.failed}`);
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  FAIL ${r.slug}`);
    for (const i of r.issues.filter((x) => x.severity === 'error')) {
      console.log(`    [${i.code}] ${i.message}`);
    }
  }
  console.log(`[audit:numeric-factcheck] report=${outPath}`);

  process.exitCode = report.failed > 0 ? 1 : 0;
}

main();
