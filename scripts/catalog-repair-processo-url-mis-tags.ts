#!/usr/bin/env tsx
/**
 * Classify + repair URL mis-tags: slug contém `processo-de-enfermagem` mas titulo_aula ≠ canônico.
 *
 *   npm run catalog:repair-processo-url-mis-tags -- --dry-run
 *   npm run catalog:repair-processo-url-mis-tags -- --apply --min-confidence=0.85
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { classifySubtopicoAgent } from '@/lib/catalogMigration/classifySubtopicoAgent';
import { isInferenceApplicable } from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';
import { buildConteudoJson } from '@/lib/catalogMigration/validatePayload';
import { unwrapCatalogPayload } from '@/lib/catalogMigration/unwrapCatalogPayload';
import { invalidateModulosCache, invalidateQuestoesCache } from '@/lib/cache';
import { createServerSupabase } from '@/lib/supabase/server';

const CANONICAL = 'Processo de Enfermagem';
const PAGE = 500;
const APPLY_BATCH = 25;

type Row = {
  modulo_slug: string;
  titulo_aula: string | null;
  from: string;
  suggested: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
  applicable: boolean;
  applied?: boolean;
  error?: string;
};

function extractFields(raw: unknown, titulo: string | null) {
  const unwrapped = unwrapCatalogPayload(raw);
  const rec =
    unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped)
      ? (unwrapped as Record<string, unknown>)
      : {};
  const qd = (rec.question_data ?? {}) as Record<string, unknown>;
  const meta = (rec.meta ?? {}) as Record<string, unknown>;
  const instruction = typeof qd.instruction === 'string' ? qd.instruction : '';
  const textFragment = typeof qd.text_fragment === 'string' ? qd.text_fragment : '';
  const options = Array.isArray(qd.options) ? qd.options : [];
  const optionsPreview = options
    .slice(0, 5)
    .map((o) => {
      const opt = o as { id?: string; text?: string };
      return `${opt.id ?? ''}) ${opt.text ?? ''}`;
    })
    .join(' | ');
  const currentSubtopico =
    (typeof meta.subtopico === 'string' && meta.subtopico.trim()) || titulo?.trim() || '';
  return { instruction, textFragment, optionsPreview, currentSubtopico, payload: unwrapped };
}

async function fetchMisTaggedSlugs(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
): Promise<string[]> {
  const slugs: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula')
      .ilike('modulo_slug', '%processo-de-enfermagem%')
      .neq('titulo_aula', CANONICAL)
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    if (batch.length === 0) break;
    for (const row of batch) slugs.push(row.modulo_slug);
    offset += PAGE;
    if (batch.length < PAGE) break;
  }
  return slugs;
}

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const minConfidence = Number(parseArg('min-confidence') ?? '0.85');
  const limit = parseArg('limit') ? Number(parseArg('limit')) : null;

  const supabase = await createServerSupabase();
  let slugs = await fetchMisTaggedSlugs(supabase);
  if (limit && limit > 0) slugs = slugs.slice(0, limit);

  console.log(
    `[repair:processo-url-mis-tags] mode=${dryRun ? 'dry-run' : 'apply'} slugs=${slugs.length} min_conf=${minConfidence}`,
  );

  const proposals: Row[] = [];

  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, titulo_aula, conteudo_json')
      .eq('modulo_slug', slug)
      .maybeSingle();

    if (error || !data) {
      proposals.push({
        modulo_slug: slug,
        titulo_aula: null,
        from: '—',
        suggested: '—',
        confidence: 0,
        keep_current: true,
        rationale: error?.message ?? 'not_found',
        applicable: false,
        error: error?.message ?? 'not_found',
      });
      continue;
    }

    const fields = extractFields(data.conteudo_json, data.titulo_aula);
    const from = fields.currentSubtopico || data.titulo_aula || '—';

    if (!fields.instruction.trim()) {
      proposals.push({
        modulo_slug: slug,
        titulo_aula: data.titulo_aula,
        from,
        suggested: from,
        confidence: 0,
        keep_current: true,
        rationale: 'enunciado vazio',
        applicable: false,
        error: 'instruction vazia',
      });
      continue;
    }

    const inference = classifySubtopicoAgent({
      slug,
      instruction: fields.instruction,
      textFragment: fields.textFragment,
      optionsPreview: fields.optionsPreview,
      currentSubtopico: from,
    });

    const applicable = isInferenceApplicable(inference, from, minConfidence);

    proposals.push({
      modulo_slug: slug,
      titulo_aula: data.titulo_aula,
      from,
      suggested: inference.suggested_subtopico,
      confidence: inference.confidence,
      keep_current: inference.keep_current,
      rationale: inference.rationale,
      applicable,
    });
  }

  const summary = {
    scanned: proposals.length,
    keep_current: proposals.filter((p) => p.keep_current).length,
    applicable: proposals.filter((p) => p.applicable).length,
    same_subtopico: proposals.filter((p) => p.suggested === p.from).length,
    errors: proposals.filter((p) => p.error).length,
    applied: 0,
    failed: 0,
  };

  if (!dryRun) {
    const toApply = proposals.filter((p) => p.applicable);
    for (let i = 0; i < toApply.length; i += APPLY_BATCH) {
      const batch = toApply.slice(i, i + APPLY_BATCH);
      for (const p of batch) {
        const { data, error } = await supabase
          .from('modulos_estudo')
          .select('id, titulo_aula, conteudo_json')
          .eq('modulo_slug', p.modulo_slug)
          .single();

        if (error || !data) {
          p.error = error?.message ?? 'not_found';
          summary.failed += 1;
          continue;
        }

        const inner = unwrapCatalogPayload(data.conteudo_json);
        const result = applySubtopicoLabelToPayload(inner, p.suggested, data.titulo_aula);
        if (!result.changed || !result.zodValid) {
          p.error = result.zodMessage ?? result.skipReason ?? 'apply_failed';
          summary.failed += 1;
          continue;
        }

        const { error: upErr } = await supabase
          .from('modulos_estudo')
          .update({
            titulo_aula: p.suggested,
            conteudo_json: buildConteudoJson(result.payload as never, p.modulo_slug),
          })
          .eq('id', data.id);

        if (upErr) {
          p.error = upErr.message;
          summary.failed += 1;
          continue;
        }

        p.applied = true;
        summary.applied += 1;
        console.log(`  OK ${p.modulo_slug} — ${p.from} → ${p.suggested}`);
      }
    }

    if (summary.applied > 0) {
      try {
        await invalidateModulosCache();
        await invalidateQuestoesCache();
      } catch {
        console.warn('[repair:processo-url-mis-tags] Cache não invalidado.');
      }
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply',
    min_confidence: minConfidence,
    summary,
    proposals,
  };

  mkdirSync(resolve('artifacts'), { recursive: true });
  const reportPath = resolve('artifacts/catalog-repair-processo-url-mis-tags.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`[repair:processo-url-mis-tags] report=${reportPath}`);
}

main().catch((err) => {
  console.error('[repair:processo-url-mis-tags]', err);
  process.exitCode = 1;
});
