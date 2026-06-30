#!/usr/bin/env tsx
/**
 * Preflight L1 — validate:goldens strict + audit:questao-readiness no lote.
 *
 * Uso:
 *   npm run catalog:preflight -- --lote=processamento-g01
 *   npm run catalog:preflight -- --lote=processamento-g01 --capture
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { runLotePreflight } from '@/lib/catalogMigration/preflightLote';

function loadAnchorSlug(lote: string): string | undefined {
  const metaPath = resolve(process.cwd(), `data/catalog-migration/${lote}/lote-meta.json`);
  if (!existsSync(metaPath)) return undefined;
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as { anchor_slug?: string };
  return meta.anchor_slug;
}

function main(): void {
  const lote = requireArg('lote');
  const strict = !hasFlag('no-strict');
  const capture = hasFlag('capture');

  const report = runLotePreflight(lote, { strict });

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, `catalog-preflight-${lote}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[catalog:preflight] lote=${lote} strict=${strict}`);
  console.log(`[catalog:preflight] passed=${report.passed}/${report.total} failed=${report.failed}`);
  for (const s of report.slugs.filter((x) => !x.ok)) {
    console.log(`  FAIL ${s.slug}`);
    for (const issue of s.issues.slice(0, 5)) {
      console.log(`    · ${issue}`);
    }
  }
  console.log(`[catalog:preflight] report=${outPath}`);

  if (capture) {
    const anchor = loadAnchorSlug(lote);
    if (anchor) {
      console.log(`[catalog:preflight] capture anchor_slug=${anchor}`);
      const result = spawnSync(
        'npx',
        ['tsx', 'scripts/capture-questao-review.ts', `--slug=${anchor}`],
        { stdio: 'inherit', shell: true, cwd: process.cwd() },
      );
      if (result.status !== 0) {
        console.warn('[catalog:preflight] capture falhou (não bloqueia preflight)');
      }
    } else {
      console.warn('[catalog:preflight] --capture ignorado: anchor_slug ausente em lote-meta.json');
    }
  }

  process.exitCode = report.failed > 0 ? 1 : 0;
}

main();
