#!/usr/bin/env tsx
/**
 * Consolida titulo_aula legado → subtópico canônico (Fase 1).
 *
 * Uso:
 *   npm run catalog:reclassify-subtopico -- --dry-run
 *   npm run catalog:reclassify-subtopico -- --apply
 *   npm run catalog:reclassify-subtopico -- --dry-run --tier=alias
 *   npm run catalog:reclassify-subtopico -- --apply --sync-meta  # fase 2: titulo_aula ← meta.subtopico
 */

import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import {
  invalidateModulosCache,
  invalidateQuestoesCache,
} from '@/lib/cache';
import { isCanonicalSubtopico } from '@/lib/catalogMigration/canonicalSubtopicos';
import { LEGACY_SUBTOPICO_MAP } from '@/lib/catalogMigration/legacySubtopicoMap';
import { reclassifySubtopicoPayload, syncTituloAulaFromMetaSubtopico } from '@/lib/catalogMigration/reclassifySubtopico';

const PAGE_SIZE = 200;
const APPLY_BATCH = 50;

type ModuloRow = {
  id: string;
  modulo_slug: string;
  titulo_aula: string | null;
  conteudo_json: unknown;
};

function parseArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split('=').slice(1).join('=');
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function fetchAllRows(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const rows: ModuloRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, titulo_aula, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);
    const batch = (data ?? []) as ModuloRow[];
    if (batch.length === 0) break;
    rows.push(...batch);
    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const mode = apply && !hasFlag('dry-run') ? 'apply' : 'dry-run';
  const tierFilter = parseArg('tier') as 'alias' | 'best_fit' | undefined;
  const syncMeta = hasFlag('sync-meta') || hasFlag('sync-from-meta');

  const supabase = await createServerSupabase();
  const rows = await fetchAllRows(supabase);

  const byFromLabel = new Map<string, number>();
  const byToLabel = new Map<string, number>();
  const unmappedLabels = new Map<string, number>();
  const exceptions: Array<{ modulo_slug: string; reason: string; from?: string | null }> = [];
  const samples: Array<{
    modulo_slug: string;
    from: string | null;
    to: string;
    tier: string;
  }> = [];

  const pendingUpdates: Array<{
    id: string;
    modulo_slug: string;
    titulo_aula: string;
    conteudo_json: unknown;
  }> = [];

  let wouldChange = 0;
  let wouldChangeMetaSync = 0;
  let skippedCanonical = 0;
  let skippedUnmapped = 0;
  let zodFail = 0;

  for (const row of rows) {
    const label = row.titulo_aula?.trim() ?? null;

    if (!syncMeta) {
      if (isCanonicalSubtopico(label)) {
        skippedCanonical++;
        continue;
      }

      const result = reclassifySubtopicoPayload(row.conteudo_json, row.titulo_aula);

      if (!result.changed) {
        if (result.skipReason === 'sem mapeamento legado') {
          skippedUnmapped++;
          if (label) unmappedLabels.set(label, (unmappedLabels.get(label) ?? 0) + 1);
        }
        continue;
      }

      if (tierFilter && result.tier !== tierFilter) continue;

      if (!result.zodValid || !result.toLabel) {
        zodFail++;
        exceptions.push({
          modulo_slug: row.modulo_slug,
          reason: result.zodMessage ?? result.skipReason ?? 'zod_invalid',
          from: result.fromLabel,
        });
        continue;
      }

      wouldChange++;
      byFromLabel.set(result.fromLabel ?? '?', (byFromLabel.get(result.fromLabel ?? '?') ?? 0) + 1);
      byToLabel.set(result.toLabel, (byToLabel.get(result.toLabel) ?? 0) + 1);

      if (samples.length < 25) {
        samples.push({
          modulo_slug: row.modulo_slug,
          from: result.fromLabel,
          to: result.toLabel,
          tier: result.tier ?? '?',
        });
      }

      pendingUpdates.push({
        id: row.id,
        modulo_slug: row.modulo_slug,
        titulo_aula: result.toLabel,
        conteudo_json: result.payload,
      });
      continue;
    }

    const result = syncTituloAulaFromMetaSubtopico(row.conteudo_json, row.titulo_aula);

    if (!result.changed) continue;

    if (!result.zodValid || !result.toLabel) {
      zodFail++;
      exceptions.push({
        modulo_slug: row.modulo_slug,
        reason: result.zodMessage ?? result.skipReason ?? 'zod_invalid',
        from: result.fromLabel,
      });
      continue;
    }

    wouldChangeMetaSync++;
    byFromLabel.set(result.fromLabel ?? '?', (byFromLabel.get(result.fromLabel ?? '?') ?? 0) + 1);
    byToLabel.set(result.toLabel, (byToLabel.get(result.toLabel) ?? 0) + 1);

    if (samples.length < 25) {
      samples.push({
        modulo_slug: row.modulo_slug,
        from: result.fromLabel,
        to: result.toLabel,
        tier: 'meta_sync',
      });
    }

    pendingUpdates.push({
      id: row.id,
      modulo_slug: row.modulo_slug,
      titulo_aula: result.toLabel,
      conteudo_json: result.payload,
    });
  }

  let applied = 0;

  if (mode === 'apply') {
    for (let i = 0; i < pendingUpdates.length; i += APPLY_BATCH) {
      const batch = pendingUpdates.slice(i, i + APPLY_BATCH);
      for (const item of batch) {
        const { error } = await supabase
          .from('modulos_estudo')
          .update({
            titulo_aula: item.titulo_aula,
            conteudo_json: item.conteudo_json,
          })
          .eq('id', item.id);

        if (error) {
          exceptions.push({
            modulo_slug: item.modulo_slug,
            reason: error.message,
            from: item.titulo_aula,
          });
          continue;
        }
        applied++;
      }
    }

    if (applied > 0) {
      try {
        await invalidateModulosCache();
        await invalidateQuestoesCache();
      } catch (cacheErr) {
        console.warn(
          '[catalog:reclassify-subtopico] Cache não invalidado (CLI fora do Next). Tags: modulos-estudo, questoes.',
          cacheErr instanceof Error ? cacheErr.message : cacheErr,
        );
      }
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    mode,
    tier_filter: tierFilter ?? null,
    sync_meta: syncMeta,
    catalog_total: rows.length,
    mapped_legacy_labels: Object.keys(LEGACY_SUBTOPICO_MAP).length,
    skipped_already_canonical: skippedCanonical,
    skipped_unmapped: skippedUnmapped,
    would_change: wouldChange,
    would_change_meta_sync: wouldChangeMetaSync,
    applied,
    zod_failures: zodFail,
    by_from_label: Object.fromEntries([...byFromLabel.entries()].sort((a, b) => b[1] - a[1])),
    by_to_label: Object.fromEntries([...byToLabel.entries()].sort((a, b) => b[1] - a[1])),
    unmapped_labels: Object.fromEntries([...unmappedLabels.entries()].sort((a, b) => b[1] - a[1])),
    samples,
    exceptions: exceptions.slice(0, 50),
  };

  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  const outPath = resolve(
    process.cwd(),
    `artifacts/catalog-reclassify-subtopico-${mode}.json`,
  );
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');

  console.log(JSON.stringify(report, null, 2));
  console.log(`\n[catalog:reclassify-subtopico] report=${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
