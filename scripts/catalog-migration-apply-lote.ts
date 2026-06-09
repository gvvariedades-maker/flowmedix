#!/usr/bin/env tsx
/**
 * Aplica JSON local de data/catalog-migration/{lote}/questions/ → modulos_estudo.
 *
 * Uso:
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --dry-run
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --apply
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --apply --allow-insert
 *   npm run catalog:apply-lote -- --lote=imunizacao-lote-02 --apply --only-slugs-file=data/catalog-migration/imunizacao-lote-02/sub01-slugs.json
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { applyLoteToSupabase } from '@/lib/catalogMigration/applyLote';
import { hasFlag, parseArg, parseCsvArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  validateAndNormalizeQuestao,
  type ValidatedQuestao,
} from '@/lib/catalogMigration/validatePayload';

async function main() {
  const lote = requireArg('lote');
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const mode = apply && !hasFlag('dry-run') ? 'apply' : 'dry-run';
  const strictGabarito = !hasFlag('no-strict-gabarito');
  const allowInsert = hasFlag('allow-insert');

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

  const items: { modulo_slug: string; payload: ValidatedQuestao }[] = [];
  const loadFailures: { file: string; reason: string }[] = [];

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8'));
    const validated = validateAndNormalizeQuestao(slug, raw);
    if (!validated.ok) {
      loadFailures.push({ file, reason: validated.reason });
      continue;
    }
    items.push({ modulo_slug: slug, payload: validated.data });
  }

  const supabase = await createServerSupabase();
  const { results, appliedSlugs } = await applyLoteToSupabase(supabase, items, {
    dryRun,
    strictGabarito,
    allowInsert,
  });

  const allResults = [
    ...loadFailures.map((f) => ({
      modulo_slug: f.file,
      status: 'failed' as const,
      mode: 'load' as const,
      detail: f.reason,
    })),
    ...results,
  ];

  const summary = {
    generated_at: new Date().toISOString(),
    lote,
    mode,
    total_files: files.length,
    ok: allResults.filter((r) => r.status === 'ok').length,
    skipped: allResults.filter((r) => r.status === 'skipped').length,
    failed: allResults.filter((r) => r.status === 'failed').length,
    applied_slugs: appliedSlugs,
    results: allResults,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(
    artifactsDir,
    mode === 'apply' ? `catalog-migration-${lote}-applied.json` : `catalog-migration-${lote}-dry-run.json`,
  );
  writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`[catalog:apply-lote] lote=${lote} mode=${mode}`);
  console.log(
    `[catalog:apply-lote] ok=${summary.ok} skipped=${summary.skipped} failed=${summary.failed}`,
  );
  for (const r of allResults) {
    console.log(`  ${r.status.toUpperCase()} ${r.modulo_slug} — ${r.detail ?? ''}`);
  }
  console.log(`[catalog:apply-lote] report=${reportPath}`);

  if (dryRun && !hasFlag('apply')) {
    console.log('[catalog:apply-lote] Dry-run concluído. Rode com --apply para gravar.');
  }

  process.exitCode = summary.failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
