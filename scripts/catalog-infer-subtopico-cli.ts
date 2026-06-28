#!/usr/bin/env tsx
/**
 * Fase 2 — inferir subtópico canônico pelo enunciado (Gemini) e aplicar propostas.
 *
 * Uso:
 *   npm run catalog:infer-subtopico -- --subtopico="Procedimentos Diversos" --dry-run
 *   npm run catalog:infer-subtopico -- --subtopico="Processo de Enfermagem" --heuristic-only --dry-run
 *   npm run catalog:infer-subtopico -- --subtopico="Procedimentos Diversos" --dry-run --limit=50
 *   npm run catalog:infer-subtopico -- --from-report=artifacts/catalog-infer-subtopico-procedimentos-diversos.json --apply --min-confidence=0.85
 *   npm run catalog:infer-subtopico -- --subtopico="Segurança do Paciente" --dry-run --require-gemini
 *   # Modelo padrão: gemini-2.5-flash-lite (override: GOOGLE_GEMINI_MODEL)
 */

import { loadEnvConfig } from '@next/env';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '@/lib/supabase/server';
import {
  invalidateModulosCache,
  invalidateQuestoesCache,
} from '@/lib/cache';
import { hasFlag, parseArg, parseLimitArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import {
  inferSubtopicoFromEnunciado,
  isInferenceApplicable,
  getGeminiModelId,
} from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';
import { applySubtopicoLabelToPayload } from '@/lib/catalogMigration/reclassifySubtopico';

const PAGE_SIZE = 200;
const APPLY_BATCH = 25;
const INFER_DELAY_MS = Number(process.env.CATALOG_INFER_DELAY_MS ?? 1200) || 1200;

type ModuloRow = {
  id: string;
  modulo_slug: string;
  titulo_aula: string | null;
  conteudo_json: unknown;
};

export type InferProposalRow = {
  modulo_slug: string;
  from: string;
  suggested: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
  applicable: boolean;
  source?: 'gemini' | 'heuristic' | 'agent';
  error?: string;
};

export type InferReport = {
  generated_at: string;
  mode: 'infer' | 'apply';
  bucket: string;
  min_confidence_apply: number;
  limit: number | null;
  inference_source: 'gemini' | 'heuristic' | 'mixed' | 'agent';
  summary: {
    scanned: number;
    inferred: number;
    errors: number;
    keep_current: number;
    same_subtopico: number;
    applicable: number;
    applied?: number;
  };
  proposals: InferProposalRow[];
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugifyBucket(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function defaultReportPath(bucket: string): string {
  return resolve(
    process.cwd(),
    `artifacts/catalog-infer-subtopico-${slugifyBucket(bucket)}.json`,
  );
}

function extractQuestionFields(conteudo_json: unknown, titulo_aula: string | null) {
  const rec =
    conteudo_json && typeof conteudo_json === 'object' && !Array.isArray(conteudo_json)
      ? (conteudo_json as Record<string, unknown>)
      : {};
  const qd = (rec.question_data ?? {}) as Record<string, unknown>;
  const instruction = String(qd.instruction ?? '').trim();
  const textFragment = String(qd.text_fragment ?? '').trim();
  const options = Array.isArray(qd.options)
    ? (qd.options as { id: string; text: string }[])
        .slice(0, 5)
        .map((o) => `${o.id}) ${o.text}`)
        .join(' | ')
    : '';
  const current =
    String((rec.meta as Record<string, unknown> | undefined)?.subtopico ?? '').trim() ||
    titulo_aula?.trim() ||
    '';
  return { instruction, textFragment, optionsPreview: options, currentSubtopico: current };
}

async function fetchBucketRows(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  subtopico: string,
  limit: number,
) {
  const rows: ModuloRow[] = [];
  let offset = 0;

  while (rows.length < limit) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('id, modulo_slug, titulo_aula, conteudo_json')
      .eq('titulo_aula', subtopico)
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Falha ao ler modulos_estudo: ${error.message}`);
    const batch = (data ?? []) as ModuloRow[];
    if (batch.length === 0) break;
    rows.push(...batch);
    offset += PAGE_SIZE;
    if (batch.length < PAGE_SIZE) break;
  }

  return rows.slice(0, limit);
}

function recomputeSummary(proposals: InferProposalRow[], scanned: number): InferReport['summary'] {
  let inferred = 0;
  let errors = 0;
  let keepCurrent = 0;
  let sameSubtopico = 0;
  let applicable = 0;
  for (const p of proposals) {
    if (p.error) {
      errors++;
      continue;
    }
    inferred++;
    if (p.keep_current) keepCurrent++;
    if (p.suggested.trim() === p.from.trim()) sameSubtopico++;
    if (p.applicable) applicable++;
  }
  return { scanned, inferred, errors, keep_current: keepCurrent, same_subtopico: sameSubtopico, applicable };
}

function loadResumeMap(reportPath: string): Map<string, InferProposalRow> {
  const map = new Map<string, InferProposalRow>();
  if (!existsSync(reportPath)) return map;
  const existing = JSON.parse(readFileSync(reportPath, 'utf8')) as InferReport;
  for (const p of existing.proposals) {
    if (p.error) continue;
    if (p.source === 'gemini' || (p.source === 'heuristic' && p.confidence > 0)) {
      map.set(p.modulo_slug, p);
    }
  }
  return map;
}

function writeInferReport(
  reportPath: string,
  report: Omit<InferReport, 'summary' | 'generated_at'> & { summary: InferReport['summary'] },
) {
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  writeFileSync(reportPath, JSON.stringify({ ...report, generated_at: new Date().toISOString() }, null, 2) + '\n');
}

async function runInfer(
  subtopico: string,
  limit: number,
  minConfidence: number,
  reportPath: string,
  heuristicOnly: boolean,
  resumeInfer: boolean,
) {
  const supabase = await createServerSupabase();
  const rows = await fetchBucketRows(supabase, subtopico, limit);

  const resumeMap = resumeInfer ? loadResumeMap(reportPath) : new Map<string, InferProposalRow>();
  const proposals: InferProposalRow[] = [];
  let usedGemini = 0;
  let usedHeuristic = 0;

  if (resumeMap.size > 0) {
    console.log(`[catalog:infer-subtopico] Retomando ${resumeMap.size} inferências do relatório existente.`);
  }

  const requireGemini = hasFlag('require-gemini');
  const apiKey = heuristicOnly ? undefined : process.env.GOOGLE_API_KEY?.trim();
  if (heuristicOnly) {
    console.log('[catalog:infer-subtopico] Modo heurística (--heuristic-only).');
  } else if (!apiKey) {
    const msg =
      'GOOGLE_API_KEY ausente. Defina em .env.local (https://aistudio.google.com/apikey) ou use --heuristic-only.';
    if (requireGemini) {
      throw new Error(`[catalog:infer-subtopico] ${msg}`);
    }
    console.warn(`[catalog:infer-subtopico] ${msg} — usando heurística local.`);
  } else {
    console.log(`[catalog:infer-subtopico] Gemini model=${getGeminiModelId()}`);
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const fields = extractQuestionFields(row.conteudo_json, row.titulo_aula);
    const from = fields.currentSubtopico || subtopico;

    const cached = resumeMap.get(row.modulo_slug);
    if (cached) {
      proposals.push(cached);
      if (cached.source === 'gemini') usedGemini++;
      else if (cached.source === 'heuristic') usedHeuristic++;
      if ((i + 1) % 10 === 0) {
        console.log(`[catalog:infer-subtopico] progress ${i + 1}/${rows.length} (cache)`);
      }
      continue;
    }

    if (!fields.instruction) {
      proposals.push({
        modulo_slug: row.modulo_slug,
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

    try {
      const inference = await inferSubtopicoFromEnunciado(
        {
          instruction: fields.instruction,
          textFragment: fields.textFragment || undefined,
          currentSubtopico: from,
          optionsPreview: fields.optionsPreview || undefined,
        },
        { heuristicOnly },
      );

      if (inference.source === 'gemini') usedGemini++;
      else usedHeuristic++;

      const canApply = isInferenceApplicable(inference, from, minConfidence);

      proposals.push({
        modulo_slug: row.modulo_slug,
        from,
        suggested: inference.suggested_subtopico,
        confidence: inference.confidence,
        keep_current: inference.keep_current,
        rationale: inference.rationale,
        applicable: canApply,
        source: inference.source,
      });
    } catch (err) {
      proposals.push({
        modulo_slug: row.modulo_slug,
        from,
        suggested: from,
        confidence: 0,
        keep_current: true,
        rationale: 'erro na inferência',
        applicable: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    if (apiKey && i < rows.length - 1) await sleep(INFER_DELAY_MS);

    if ((i + 1) % 10 === 0) {
      console.log(`[catalog:infer-subtopico] progress ${i + 1}/${rows.length}`);
      const summary = recomputeSummary(proposals, rows.length);
      writeInferReport(reportPath, {
        mode: 'infer',
        bucket: subtopico,
        min_confidence_apply: minConfidence,
        limit,
        inference_source:
          usedGemini > 0 && usedHeuristic > 0 ? 'mixed' : usedGemini > 0 ? 'gemini' : 'heuristic',
        summary,
        proposals,
      });
    }
  }

  const summary = recomputeSummary(proposals, rows.length);
  const inferenceSource: InferReport['inference_source'] =
    usedGemini > 0 && usedHeuristic > 0 ? 'mixed' : usedGemini > 0 ? 'gemini' : 'heuristic';

  writeInferReport(reportPath, {
    mode: 'infer',
    bucket: subtopico,
    min_confidence_apply: minConfidence,
    limit,
    inference_source: inferenceSource,
    summary,
    proposals,
  });
  console.log(JSON.stringify(summary, null, 2));
  console.log(`[catalog:infer-subtopico] report=${reportPath}`);
}

async function runApply(reportPath: string, minConfidence: number) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as InferReport;
  const toApply = report.proposals.filter(
    (p) => p.applicable && p.confidence >= minConfidence && !p.keep_current,
  );

  const supabase = await createServerSupabase();
  let applied = 0;
  const applyErrors: Array<{ modulo_slug: string; reason: string }> = [];

  for (let i = 0; i < toApply.length; i += APPLY_BATCH) {
    const batch = toApply.slice(i, i + APPLY_BATCH);
    for (const proposal of batch) {
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, titulo_aula, conteudo_json')
        .eq('modulo_slug', proposal.modulo_slug)
        .single();

      if (error || !data) {
        applyErrors.push({ modulo_slug: proposal.modulo_slug, reason: error?.message ?? 'not found' });
        continue;
      }

      const result = applySubtopicoLabelToPayload(
        data.conteudo_json,
        proposal.suggested,
        data.titulo_aula,
      );

      if (!result.changed || !result.zodValid) {
        applyErrors.push({
          modulo_slug: proposal.modulo_slug,
          reason: result.zodMessage ?? result.skipReason ?? 'apply_failed',
        });
        continue;
      }

      const { error: updateError } = await supabase
        .from('modulos_estudo')
        .update({
          titulo_aula: proposal.suggested,
          conteudo_json: result.payload,
        })
        .eq('id', data.id);

      if (updateError) {
        applyErrors.push({ modulo_slug: proposal.modulo_slug, reason: updateError.message });
        continue;
      }

      applied++;
      console.log(`  OK ${proposal.modulo_slug} — ${proposal.from} → ${proposal.suggested}`);
    }
  }

  if (applied > 0) {
    try {
      await invalidateModulosCache();
      await invalidateQuestoesCache();
    } catch (cacheErr) {
      console.warn(
        '[catalog:infer-subtopico] Cache não invalidado (CLI).',
        cacheErr instanceof Error ? cacheErr.message : cacheErr,
      );
    }
  }

  const appliedReport: InferReport = {
    ...report,
    generated_at: new Date().toISOString(),
    mode: 'apply',
    min_confidence_apply: minConfidence,
    summary: {
      ...report.summary,
      applied,
    },
    proposals: report.proposals,
  };

  const outPath = reportPath.replace(/\.json$/, '-applied.json');
  writeFileSync(outPath, JSON.stringify({ ...appliedReport, apply_errors: applyErrors }, null, 2) + '\n');

  console.log(
    JSON.stringify(
      { applied, failed: applyErrors.length, min_confidence: minConfidence, report: outPath },
      null,
      2,
    ),
  );
}

async function main() {
  const apply = hasFlag('apply');
  const fromReport = parseArg('from-report');
  const minConfidence = Number(parseArg('min-confidence') ?? '0.85');
  if (!Number.isFinite(minConfidence) || minConfidence < 0 || minConfidence > 1) {
    throw new Error('--min-confidence deve estar entre 0 e 1');
  }

  if (apply) {
    if (!fromReport) throw new Error('Apply exige --from-report=artifacts/...');
    await runApply(resolve(process.cwd(), fromReport), minConfidence);
    return;
  }

  const subtopico = requireArg('subtopico');
  const limit = parseLimitArg(10_000);
  const reportPath = parseArg('report') ?? defaultReportPath(subtopico);

  if (hasFlag('resume') && !hasFlag('resume-infer') && existsSync(reportPath)) {
    console.log(`[catalog:infer-subtopico] Relatório existente: ${reportPath} (delete para reinferir)`);
    const existing = JSON.parse(readFileSync(reportPath, 'utf8')) as InferReport;
    console.log(JSON.stringify(existing.summary, null, 2));
    return;
  }

  await runInfer(
    subtopico,
    limit,
    minConfidence,
    reportPath,
    hasFlag('heuristic-only'),
    hasFlag('resume-infer'),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
