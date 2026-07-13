#!/usr/bin/env tsx
/**
 * Upgrade híbrido (nível A): classifica família + monta danger_zone/compare das options.
 * concept_map / golden_rule ficam como stub ou preservados se já premium.
 *
 * Uso:
 *   npm run catalog:upgrade-premium -- --lote=imunizacao-lote-02 --dry-run
 *   npm run catalog:upgrade-premium -- --lote=imunizacao-lote-02 --write
 *   npm run catalog:upgrade-premium -- --lote=imunizacao-lote-02 --write --force
 *   npm run catalog:upgrade-premium -- --lote=imunizacao-lote-02 --write --danger-only
 *   npm run catalog:upgrade-premium -- --lote=imunizacao-lote-02 --write --only-slugs-file=data/catalog-migration/imunizacao-lote-02/sub01-slugs.json
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg, parseCsvArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { upgradePremiumHybrid } from '@/legacy/catalog-migration/upgradePremiumHybrid';

type RowResult = {
  modulo_slug: string;
  status: 'upgraded' | 'skipped' | 'failed';
  family?: string;
  golden_reference?: string;
  generic_before?: boolean;
  changes?: string[];
  detail?: string;
};

async function main() {
  const lote = requireArg('lote');
  const write = hasFlag('write');
  const dryRun = !write || hasFlag('dry-run');
  const mode = write && !hasFlag('dry-run') ? 'write' : 'dry-run';
  const force = hasFlag('force');
  const dangerOnly = hasFlag('danger-only');
  const noPreserve = hasFlag('no-preserve-rich');

  const questionsDir = loteQuestionsDir(lote);
  if (!existsSync(questionsDir)) {
    throw new Error(`Lote não encontrado: ${questionsDir}`);
  }

  let files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const onlySlugsFile = parseArg('only-slugs-file');
  const onlySlugsCsv = parseCsvArg('only-slugs');
  let onlySlugs: Set<string> | null = null;
  if (onlySlugsFile) {
    const list = JSON.parse(readFileSync(resolve(process.cwd(), onlySlugsFile), 'utf8')) as string[];
    onlySlugs = new Set(list);
  } else if (onlySlugsCsv?.length) {
    onlySlugs = new Set(onlySlugsCsv);
  }
  if (onlySlugs) {
    files = files.filter((f) => onlySlugs!.has(f.replace(/\.json$/, '')));
  }

  if (files.length === 0) {
    throw new Error(`Nenhum JSON em ${questionsDir}`);
  }

  const results: RowResult[] = [];
  let upgraded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const path = resolve(questionsDir, file);
    const raw = JSON.parse(readFileSync(path, 'utf8'));

    const result = upgradePremiumHybrid(raw, {
      force,
      dangerOnly,
      preserveRichSlides: !noPreserve,
    });

    if (result.skipped) {
      skipped += 1;
      results.push({
        modulo_slug: slug,
        status: 'skipped',
        family: result.family,
        golden_reference: result.goldenReference,
        generic_before: result.genericBefore,
        detail: result.skipReason,
      });
      console.log(`[catalog:upgrade-premium] SKIP ${slug} — ${result.skipReason}`);
      continue;
    }

    if (!result.zodValid) {
      failed += 1;
      results.push({
        modulo_slug: slug,
        status: 'failed',
        family: result.family,
        golden_reference: result.goldenReference,
        detail: result.zodMessage,
      });
      console.log(`[catalog:upgrade-premium] FAIL ${slug} — ${result.zodMessage}`);
      continue;
    }

    upgraded += 1;
    results.push({
      modulo_slug: slug,
      status: 'upgraded',
      family: result.family,
      golden_reference: result.goldenReference,
      generic_before: result.genericBefore,
      changes: result.changes,
    });

    if (mode === 'write') {
      writeFileSync(path, JSON.stringify(result.payload, null, 2), 'utf8');
    }

    console.log(
      `[catalog:upgrade-premium] OK ${slug} family=${result.family} changes=${result.changes.join(',')}`,
    );
  }

  const familyCounts = results.reduce<Record<string, number>>((acc, r) => {
    if (r.family) acc[r.family] = (acc[r.family] ?? 0) + 1;
    return acc;
  }, {});

  const summary = {
    generated_at: new Date().toISOString(),
    lote,
    mode,
    force,
    danger_only: dangerOnly,
    preserve_rich_slides: !noPreserve,
    total_files: files.length,
    upgraded,
    skipped,
    failed,
    family_counts: familyCounts,
    results,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(
    artifactsDir,
    mode === 'write'
      ? `catalog-migration-${lote}-upgrade-premium.json`
      : `catalog-migration-${lote}-upgrade-premium-dry-run.json`,
  );
  writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`[catalog:upgrade-premium] lote=${lote} mode=${mode}`);
  console.log(
    `[catalog:upgrade-premium] upgraded=${upgraded} skipped=${skipped} failed=${failed}`,
  );
  console.log(`[catalog:upgrade-premium] report=${reportPath}`);

  if (dryRun && !hasFlag('write')) {
    console.log('[catalog:upgrade-premium] Dry-run. Rode com --write para gravar JSONs.');
  }

  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
