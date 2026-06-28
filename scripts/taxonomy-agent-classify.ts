#!/usr/bin/env tsx
/**
 * Classificação agente (Cursor) — sem Google API.
 *
 * Uso:
 *   npm run taxonomy:agent-classify -- --lote=taxonomy-agent-deep --dry-run
 *   npm run taxonomy:agent-classify -- --lote=taxonomy-agent-deep --apply --min-confidence=0.85
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { hasFlag, parseArg } from '@/lib/catalogMigration/cliArgs';
import { classifySubtopicoAgent } from '@/lib/catalogMigration/classifySubtopicoAgent';
import { isInferenceApplicable } from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';
import type { InferProposalRow, InferReport } from './catalog-infer-subtopico-cli';
import { createServerSupabase } from '@/lib/supabase/server';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';
import {
  invalidateModulosCache,
  invalidateQuestoesCache,
} from '@/lib/cache';

const LOTE_DEFAULT = 'taxonomy-agent-pending';
const APPLY_BATCH = 25;

function extractFields(raw: unknown, titulo: string | null) {
  const rec =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
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
    (typeof meta.subtopico === 'string' && meta.subtopico.trim()) ||
    titulo?.trim() ||
    '';
  return { instruction, textFragment, optionsPreview, currentSubtopico };
}

async function main() {
  const apply = hasFlag('apply');
  const dryRun = !apply || hasFlag('dry-run');
  const minConfidence = Number(parseArg('min-confidence') ?? '0.85');
  const lote = parseArg('lote') ?? LOTE_DEFAULT;
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);
  const reportSlug = lote === LOTE_DEFAULT ? 'taxonomy-agent' : lote;

  if (!existsSync(questionsDir)) {
    throw new Error(`Export ausente: ${questionsDir} — rode catalog:export-lote primeiro.`);
  }

  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
  const proposals: InferProposalRow[] = [];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const raw = JSON.parse(readFileSync(join(questionsDir, file), 'utf8'));
    const meta = (raw.meta ?? {}) as Record<string, unknown>;
    const titulo = typeof meta.subtopico === 'string' ? meta.subtopico : null;
    const fields = extractFields(raw, titulo);
    const from = fields.currentSubtopico;

    if (!fields.instruction) {
      proposals.push({
        modulo_slug: slug,
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

    proposals.push({
      modulo_slug: slug,
      from,
      suggested: inference.suggested_subtopico,
      confidence: inference.confidence,
      keep_current: inference.keep_current,
      rationale: inference.rationale,
      applicable: isInferenceApplicable(inference, from, minConfidence),
      source: 'agent',
    });
  }

  const report: InferReport = {
    generated_at: new Date().toISOString(),
    mode: apply && !dryRun ? 'apply' : 'infer',
    bucket: lote,
    min_confidence_apply: minConfidence,
    limit: null,
    inference_source: 'agent',
    summary: {
      scanned: proposals.length,
      inferred: proposals.length,
      errors: proposals.filter((p) => p.error).length,
      keep_current: proposals.filter((p) => p.keep_current).length,
      same_subtopico: proposals.filter((p) => p.suggested === p.from).length,
      applicable: proposals.filter((p) => p.applicable).length,
    },
    proposals,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(artifactsDir, `catalog-infer-subtopico-${reportSlug}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`[taxonomy-agent-classify] lote=${lote} report=${reportPath}`);

  if (dryRun) return;

  const supabase = await createServerSupabase();
  const toApply = proposals.filter((p) => p.applicable);
  let applied = 0;
  const errors: Array<{ slug: string; reason: string }> = [];

  for (let i = 0; i < toApply.length; i += APPLY_BATCH) {
    const batch = toApply.slice(i, i + APPLY_BATCH);
    for (const p of batch) {
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, titulo_aula, conteudo_json')
        .eq('modulo_slug', p.modulo_slug)
        .single();

      if (error || !data) {
        errors.push({ slug: p.modulo_slug, reason: error?.message ?? 'not found' });
        continue;
      }

      const result = applySubtopicoLabelToPayload(data.conteudo_json, p.suggested, data.titulo_aula);
      if (!result.changed || !result.zodValid) {
        errors.push({ slug: p.modulo_slug, reason: result.zodMessage ?? result.skipReason ?? 'apply_failed' });
        continue;
      }

      const { error: upErr } = await supabase
        .from('modulos_estudo')
        .update({
          titulo_aula: p.suggested,
          conteudo_json: result.payload,
        })
        .eq('id', data.id);

      if (upErr) {
        errors.push({ slug: p.modulo_slug, reason: upErr.message });
        continue;
      }

      applied += 1;
      console.log(`  OK ${p.modulo_slug} — ${p.from} → ${p.suggested}`);
    }
  }

  try {
    await invalidateModulosCache();
    await invalidateQuestoesCache();
  } catch {
    console.warn('[taxonomy-agent-classify] Cache não invalidado.');
  }

  report.summary.applied = applied;
  writeFileSync(
    resolve(artifactsDir, `catalog-infer-subtopico-${reportSlug}-applied.json`),
    JSON.stringify({ applied, failed: errors.length, errors, min_confidence: minConfidence }, null, 2),
    'utf8',
  );
  console.log(JSON.stringify({ applied, failed: errors.length }, null, 2));
}

main().catch((err) => {
  console.error('[taxonomy-agent-classify]', err);
  process.exitCode = 1;
});
