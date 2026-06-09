#!/usr/bin/env tsx
/**
 * Atalho: aplica data/premium-pilot-manifest.json (examples/ → Supabase).
 * Para fluxo local-first completo, prefira:
 *   npm run catalog:seed-lote -- --lote=pilot-goldens --from-manifest=data/premium-pilot-manifest.json
 *   npm run catalog:apply-lote -- --lote=pilot-goldens --apply
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { applyLoteToSupabase } from '@/lib/catalogMigration/applyLote';
import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import {
  validateAndNormalizeQuestao,
  type ValidatedQuestao,
} from '@/lib/catalogMigration/validatePayload';

type ManifestItem = {
  id: string;
  modulo_slug: string;
  golden_file: string | null;
  mode: 'update' | 'insert' | 'skip';
  skip_reason?: string;
};

type Manifest = {
  items: ManifestItem[];
};

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const mode = apply && !hasFlag('dry-run') ? 'apply' : 'dry-run';

  const manifestPath = resolve(process.cwd(), 'data/premium-pilot-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
  const supabase = await createServerSupabase();

  const items: { modulo_slug: string; payload: ValidatedQuestao }[] = [];
  const skipped: { id: string; modulo_slug: string; detail: string }[] = [];
  const failed: { id: string; modulo_slug: string; detail: string }[] = [];

  for (const item of manifest.items) {
    if (item.mode === 'skip' || !item.golden_file) {
      skipped.push({
        id: item.id,
        modulo_slug: item.modulo_slug,
        detail: item.skip_reason ?? 'sem golden',
      });
      continue;
    }

    const goldenPath = resolve(process.cwd(), 'examples', item.golden_file);
    if (!existsSync(goldenPath)) {
      failed.push({
        id: item.id,
        modulo_slug: item.modulo_slug,
        detail: `golden ausente: ${item.golden_file}`,
      });
      continue;
    }

    const raw = JSON.parse(readFileSync(goldenPath, 'utf8'));
    const validated = validateAndNormalizeQuestao(item.modulo_slug, raw);
    if (!validated.ok) {
      failed.push({
        id: item.id,
        modulo_slug: item.modulo_slug,
        detail: validated.reason,
      });
      continue;
    }

    items.push({ modulo_slug: item.modulo_slug, payload: validated.data });
  }

  const { results, appliedSlugs } = await applyLoteToSupabase(supabase, items, {
    dryRun,
    strictGabarito: true,
    allowInsert: manifest.items.some((i) => i.mode === 'insert'),
  });

  const summary = {
    generated_at: new Date().toISOString(),
    mode,
    total: manifest.items.length,
    ok: results.filter((r) => r.status === 'ok').length,
    skipped: skipped.length + results.filter((r) => r.status === 'skipped').length,
    failed: failed.length + results.filter((r) => r.status === 'failed').length,
    applied_slugs: appliedSlugs,
    skipped_items: skipped,
    load_failures: failed,
    results,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(
    artifactsDir,
    mode === 'apply' ? 'premium-pilot-applied.json' : 'premium-pilot-dry-run.json',
  );
  writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`[premium:pilot] mode=${mode}`);
  console.log(`[premium:pilot] ok=${summary.ok} skipped=${summary.skipped} failed=${summary.failed}`);
  for (const s of skipped) {
    console.log(`  SKIPPED ${s.id} (${s.modulo_slug}) — ${s.detail}`);
  }
  for (const f of failed) {
    console.log(`  FAILED ${f.id} (${f.modulo_slug}) — ${f.detail}`);
  }
  for (const r of results) {
    console.log(`  ${r.status.toUpperCase()} ${r.modulo_slug} — ${r.detail ?? ''}`);
  }
  console.log(`[premium:pilot] report=${reportPath}`);

  if (dryRun && !hasFlag('apply')) {
    console.log('[premium:pilot] Dry-run concluído. Rode com --apply para gravar.');
  }

  process.exitCode = summary.failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
