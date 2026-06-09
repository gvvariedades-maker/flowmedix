#!/usr/bin/env tsx
/**
 * Normalização em massa do catálogo (modulos_estudo.conteudo_json).
 *
 * Uso:
 *   npm run catalog:normalize -- --dry-run
 *   npm run catalog:normalize -- --apply
 *   npm run catalog:normalize -- --dry-run --sampleLimit=30
 */

import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import { generateContentHash } from '@/lib/contentHash';
import {
  invalidateModulosCache,
  invalidateQuestoesCache,
} from '@/lib/cache';
import {
  normalizeQuestaoCatalogPayload,
  payloadsEqual,
  type CatalogNormalizeChangeCode,
} from '@/lib/questaoCatalogNormalize';

const PAGE_SIZE = 200;
const APPLY_BATCH = 50;

type ModuloRow = {
  id: string;
  modulo_slug: string;
  conteudo_json: unknown;
  content_hash: string | null;
};

type Summary = Record<CatalogNormalizeChangeCode | 'would_change' | 'exceptions' | 'zod_failures_after' | 'tecconcursos_blocked' | 'applied' | 'skipped_unchanged', number>;

function parseArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split('=').slice(1).join('=');
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function emptySummary(): Summary {
  return {
    would_change: 0,
    applied: 0,
    skipped_unchanged: 0,
    exceptions: 0,
    zod_failures_after: 0,
    tecconcursos_blocked: 0,
    meta_cargo_header: 0,
    meta_prova: 0,
    meta_topico: 0,
    meta_banca: 0,
    meta_orgao: 0,
    meta_ano: 0,
    meta_subtopico: 0,
    meta_header_line_removed: 0,
    instruction_cleaned: 0,
    text_fragment_cleaned: 0,
    slides_normalized: 0,
    slides_legacy_fixed: 0,
  };
}

async function fetchAllRows(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const rows: ModuloRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, conteudo_json, content_hash')
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
  const sampleLimit = Number(parseArg('sampleLimit') ?? '40');
  const mode = apply && !hasFlag('dry-run') ? 'apply' : 'dry-run';

  const supabase = await createServerSupabase();
  const rows = await fetchAllRows(supabase);
  const summary = emptySummary();

  const samples: Array<{
    modulo_slug: string;
    changes: CatalogNormalizeChangeCode[];
    exception?: string;
    zodValid: boolean;
    before_instruction: string;
    after_instruction: string;
    before_meta: unknown;
    after_meta: unknown;
  }> = [];

  const exceptions: Array<{ modulo_slug: string; reason: string; zodMessage?: string }> = [];
  const pendingUpdates: Array<{
    id: string;
    modulo_slug: string;
    conteudo_json: unknown;
    content_hash: string;
  }> = [];

  for (const row of rows) {
    const result = normalizeQuestaoCatalogPayload(row.conteudo_json);

    if (result.tecconcursos) {
      summary.tecconcursos_blocked += 1;
      exceptions.push({ modulo_slug: row.modulo_slug, reason: 'tecconcursos_reference' });
      continue;
    }

    if (!result.zodValid) {
      summary.zod_failures_after += 1;
      exceptions.push({
        modulo_slug: row.modulo_slug,
        reason: 'zod_invalid_after_normalize',
        zodMessage: result.zodMessage,
      });
      continue;
    }

    if (!result.changed) {
      summary.skipped_unchanged += 1;
      continue;
    }

    summary.would_change += 1;
    for (const code of result.changes) {
      summary[code] += 1;
    }
    if (result.exception) {
      summary.exceptions += 1;
    }

    const beforeQd = (row.conteudo_json as { question_data?: { instruction?: string } })?.question_data;
    const afterQd = (result.payload as { question_data?: { instruction?: string } })?.question_data;

    if (samples.length < sampleLimit) {
      samples.push({
        modulo_slug: row.modulo_slug,
        changes: result.changes,
        exception: result.exception,
        zodValid: result.zodValid,
        before_instruction: beforeQd?.instruction?.slice(0, 280) ?? '',
        after_instruction: afterQd?.instruction?.slice(0, 280) ?? '',
        before_meta: (row.conteudo_json as { meta?: unknown })?.meta ?? null,
        after_meta: (result.payload as { meta?: unknown })?.meta ?? null,
      });
    }

    if (result.changed) {
      const instruction =
        (result.payload as { question_data: { instruction: string } }).question_data.instruction;
      const hash = await generateContentHash(instruction);
      pendingUpdates.push({
        id: row.id,
        modulo_slug: row.modulo_slug,
        conteudo_json: result.payload,
        content_hash: hash,
      });
    }
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(
    artifactsDir,
    mode === 'apply' ? 'catalog-normalize-applied.json' : 'catalog-normalize-report.json',
  );

  if (mode === 'apply') {
    for (let i = 0; i < pendingUpdates.length; i += APPLY_BATCH) {
      const chunk = pendingUpdates.slice(i, i + APPLY_BATCH);
      for (const item of chunk) {
        let { error } = await supabase
          .from('modulos_estudo')
          .update({
            conteudo_json: item.conteudo_json,
            content_hash: item.content_hash,
          })
          .eq('id', item.id);

        if (error?.message?.includes('uniq_modulos_estudo_content_hash')) {
          const retry = await supabase
            .from('modulos_estudo')
            .update({ conteudo_json: item.conteudo_json })
            .eq('id', item.id);
          error = retry.error;
        }

        if (error) {
          exceptions.push({ modulo_slug: item.modulo_slug, reason: `update_failed: ${error.message}` });
        } else {
          summary.applied += 1;
        }
      }
      console.log(`[catalog:normalize] apply progress ${Math.min(i + APPLY_BATCH, pendingUpdates.length)}/${pendingUpdates.length}`);
    }

    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (cacheErr) {
      console.warn(
        '[catalog:normalize] Cache não invalidado (rode fora do Next.js). Tags: modulos-estudo, questoes.',
        cacheErr instanceof Error ? cacheErr.message : cacheErr,
      );
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    mode,
    catalog_total: rows.length,
    summary,
    samples,
    exceptions: exceptions.slice(0, 500),
    notes: [
      'Linha 2 no player: topico === "Enfermagem" exibe só subtopico (alteração em lib/questionHeader.ts).',
      'orgao_not_inferable: meta corrigida onde possível; revisar manualmente se cabeçalho ainda incompleto.',
    ],
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[catalog:normalize] mode=${mode}`);
  console.log(`[catalog:normalize] catalog_total=${rows.length}`);
  console.log(`[catalog:normalize] would_change=${summary.would_change}`);
  console.log(`[catalog:normalize] applied=${summary.applied}`);
  console.log(`[catalog:normalize] skipped_unchanged=${summary.skipped_unchanged}`);
  console.log(`[catalog:normalize] zod_failures_after=${summary.zod_failures_after}`);
  console.log(`[catalog:normalize] exceptions=${summary.exceptions}`);
  console.log(`[catalog:normalize] report=${reportPath}`);

  if (dryRun && !hasFlag('apply')) {
    console.log('[catalog:normalize] Dry-run concluído. Rode com --apply para gravar.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
