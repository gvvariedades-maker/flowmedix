#!/usr/bin/env tsx
/**
 * Runner de reconciliação — Evidence Engine Fase 1 (Lote 9).
 * Spec §1.10 · Plano §5.1 (recuperação operacional obrigatória) · §Lote 9.
 *
 * Pareia `historico_questoes` / `simulado_respostas` (fontes legado) com
 * `evidence_attempt_events` (stream). Gera relatório em `artifacts/` e,
 * opcionalmente (`--apply`), insere backfill (`source = reconcile_backfill`)
 * **somente** para gaps com metadados suficientes (nunca inventa campos).
 *
 * Uso:
 *   npm run reconcile:evidence-events -- --dry-run
 *   npm run reconcile:evidence-events -- --apply
 *   npm run reconcile:evidence-events -- --since-hours=48 --window-ms=300000
 *
 * Default (sem --apply): dry-run. Nunca corrige silenciosamente conflitos
 * de outcome (P1) — apenas reporta (plano §5.1, §1.10 spec).
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { createServerSupabase } from '../lib/supabase/server';
import { extractQuestionVersionInputFromConteudo } from '../lib/evidence/ingestAttemptEvent';
import { computeQuestionVersion } from '../lib/evidence/questionVersion';
import { resolveSimuladoSessionKind } from '../lib/simulado/sessionKind';
import {
  buildBackfillEventDraft,
  reconcileEvidenceEvents,
  type ReconcileAttemptSourceRecord,
  type ReconcileEventRecord,
} from '../lib/evidence/reconcileEvidenceEvents';
import {
  recordEvidenceReconcileGap,
  recordEvidenceReconcileOutcomeMismatch,
  recordEvidenceReconcileUnresolvedAfterJob,
} from '../lib/evidence/opsMetrics';

const DEFAULT_SINCE_HOURS = 24 * 7; // spec §1.16 / plano: janela de observação 7–14 dias
const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // pareamento secundário — 5 min
const ROW_LIMIT = 5000;

function parseArg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split('=').slice(1).join('=');
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

type HistoricoRow = {
  id: string;
  user_id: string;
  modulo_slug: string;
  acertou: boolean | null;
  created_at: string;
};

type SimuladoRespostaRow = {
  id: string;
  user_id: string;
  session_id: string;
  modulo_slug: string;
  opcao_id: string | null;
  acertou: boolean | null;
  respondida_em: string | null;
};

type SimuladoSessionRow = {
  id: string;
  filtros: Record<string, unknown> | null;
};

type EvidenceEventRow = {
  attempt_id: string;
  user_id: string;
  question_id: string;
  session_id: string | null;
  selected_alternative: string;
  correct: boolean;
  created_at: string;
};

async function main(): Promise<void> {
  const dryRun = !hasFlag('apply');
  const sinceHours = Number(parseArg('since-hours') ?? DEFAULT_SINCE_HOURS);
  const windowMs = Number(parseArg('window-ms') ?? DEFAULT_WINDOW_MS);
  const sinceIso = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();

  console.log(
    `[reconcile:evidence-events] mode=${dryRun ? 'dry-run' : 'apply'} since=${sinceIso} window_ms=${windowMs}`,
  );

  const supabase = await createServerSupabase();

  const [historicoResult, simuladoRespostasResult, eventsResult] = await Promise.all([
    supabase
      .from('historico_questoes')
      .select('id, user_id, modulo_slug, acertou, created_at')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(ROW_LIMIT),
    supabase
      .from('simulado_respostas')
      .select('id, user_id, session_id, modulo_slug, opcao_id, acertou, respondida_em')
      .not('respondida_em', 'is', null)
      .gte('respondida_em', sinceIso)
      .order('respondida_em', { ascending: true })
      .limit(ROW_LIMIT),
    supabase
      .from('evidence_attempt_events')
      .select('attempt_id, user_id, question_id, session_id, selected_alternative, correct, created_at')
      .eq('event_type', 'attempt')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(ROW_LIMIT),
  ]);

  if (historicoResult.error) {
    throw new Error(`Falha ao buscar historico_questoes: ${historicoResult.error.message}`);
  }
  if (simuladoRespostasResult.error) {
    throw new Error(`Falha ao buscar simulado_respostas: ${simuladoRespostasResult.error.message}`);
  }
  if (eventsResult.error) {
    throw new Error(`Falha ao buscar evidence_attempt_events: ${eventsResult.error.message}`);
  }

  const historicoRows = (historicoResult.data ?? []) as HistoricoRow[];
  const simuladoRows = (simuladoRespostasResult.data ?? []) as SimuladoRespostaRow[];
  const eventRows = (eventsResult.data ?? []) as EvidenceEventRow[];

  for (const [label, rows] of [
    ['historico_questoes', historicoRows],
    ['simulado_respostas', simuladoRows],
    ['evidence_attempt_events', eventRows],
  ] as const) {
    if (rows.length >= ROW_LIMIT) {
      console.warn(
        `[reconcile:evidence-events] ALERTA: ${label} atingiu ROW_LIMIT=${ROW_LIMIT} — reduza --since-hours`,
      );
    }
  }

  const sessionIds = [...new Set(simuladoRows.map((r) => r.session_id))];
  const sessionsById = new Map<string, SimuladoSessionRow>();
  if (sessionIds.length > 0) {
    const { data: sessionRows, error: sessionsError } = await supabase
      .from('simulado_sessions')
      .select('id, filtros')
      .in('id', sessionIds);
    if (sessionsError) {
      throw new Error(`Falha ao buscar simulado_sessions: ${sessionsError.message}`);
    }
    for (const row of (sessionRows ?? []) as SimuladoSessionRow[]) {
      sessionsById.set(row.id, row);
    }
  }

  // question_version só é calculável para simulado_respostas (única fonte
  // legado com selected_alternative); historico_questoes nunca é
  // backfillable (§1.10 — proibido inventar selected_alternative).
  const moduloSlugsNeedingVersion = [...new Set(simuladoRows.map((r) => r.modulo_slug))];
  const questionVersionBySlug = new Map<string, string | null>();
  if (moduloSlugsNeedingVersion.length > 0) {
    const { data: moduloRows, error: moduloError } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, conteudo_json')
      .in('modulo_slug', moduloSlugsNeedingVersion);
    if (moduloError) {
      throw new Error(`Falha ao buscar modulos_estudo: ${moduloError.message}`);
    }
    for (const row of (moduloRows ?? []) as { modulo_slug: string; conteudo_json: unknown }[]) {
      const versionInput = extractQuestionVersionInputFromConteudo(
        row.conteudo_json,
        row.modulo_slug,
      );
      questionVersionBySlug.set(
        row.modulo_slug,
        versionInput ? computeQuestionVersion(versionInput) : null,
      );
    }
  }

  const historicoSources: ReconcileAttemptSourceRecord[] = historicoRows.map((row) => ({
    source_table: 'historico_questoes',
    source_id: row.id,
    user_id: row.user_id,
    question_id: row.modulo_slug,
    session_id: null,
    attempt_id: null,
    // historico_questoes nunca guardou opcao_id — nunca inventar aqui.
    selected_alternative: null,
    correct: row.acertou,
    conviction: null,
    context: 'regular_practice',
    question_version: null,
    occurred_at: row.created_at,
  }));

  const simuladoSources: ReconcileAttemptSourceRecord[] = simuladoRows
    .filter((row) => row.respondida_em != null)
    .map((row) => {
      const session = sessionsById.get(row.session_id);
      const kind = resolveSimuladoSessionKind(session?.filtros ?? null);
      return {
        source_table: 'simulado_respostas',
        source_id: row.id,
        user_id: row.user_id,
        question_id: row.modulo_slug,
        session_id: row.session_id,
        attempt_id: null,
        selected_alternative: row.opcao_id,
        correct: row.acertou,
        conviction: null,
        context: kind === 'diagnostico' ? 'diagnostic' : 'simulation',
        question_version: questionVersionBySlug.get(row.modulo_slug) ?? null,
        occurred_at: row.respondida_em as string,
      } satisfies ReconcileAttemptSourceRecord;
    });

  const events: ReconcileEventRecord[] = eventRows.map((row) => ({
    attempt_id: row.attempt_id,
    user_id: row.user_id,
    question_id: row.question_id,
    session_id: row.session_id,
    selected_alternative: row.selected_alternative,
    correct: row.correct,
    created_at: row.created_at,
  }));

  const report = reconcileEvidenceEvents({
    sources: [...historicoSources, ...simuladoSources],
    events,
    window_ms: windowMs,
  });

  for (const gap of report.gaps_missing_event) {
    recordEvidenceReconcileGap({ source_table: gap.source.source_table });
  }
  for (const mismatch of report.outcome_mismatches) {
    recordEvidenceReconcileOutcomeMismatch({ reason: mismatch.reason });
  }
  recordEvidenceReconcileUnresolvedAfterJob(report.unresolved.length);

  console.log(
    `[reconcile:evidence-events] sources=${report.counts.sources} events=${report.counts.events} ` +
      `paired=${report.counts.paired} mismatches=${report.counts.outcome_mismatches} ` +
      `gaps=${report.counts.gaps_missing_event} (unresolved=${report.counts.unresolved}, ` +
      `backfillable=${report.counts.backfill_candidates}) events_sem_fonte=${report.counts.gaps_missing_source}`,
  );

  if (report.counts.outcome_mismatches > 0) {
    console.warn(
      `[reconcile:evidence-events] ALERTA P1: ${report.counts.outcome_mismatches} outcome mismatch(es) — investigação humana necessária (§1.10, nunca corrigir silenciosamente)`,
    );
  }

  const insertedBackfill: { attempt_id: string; question_id: string }[] = [];
  const failedBackfill: { source_id: string; error: string }[] = [];

  if (!dryRun && report.backfill_candidates.length > 0) {
    const nowIso = new Date().toISOString();
    for (const gap of report.backfill_candidates) {
      const attemptId = randomUUID();
      const draft = buildBackfillEventDraft(gap, attemptId, nowIso);
      if (!draft) continue;
      const { error } = await supabase.from('evidence_attempt_events').insert(draft);
      if (error) {
        failedBackfill.push({ source_id: gap.source.source_id, error: error.message });
        continue;
      }
      insertedBackfill.push({ attempt_id: attemptId, question_id: draft.question_id });
    }
    console.log(
      `[reconcile:evidence-events] backfill aplicado: inserted=${insertedBackfill.length} failed=${failedBackfill.length}`,
    );
  } else if (dryRun && report.backfill_candidates.length > 0) {
    console.log(
      `[reconcile:evidence-events] dry-run — ${report.backfill_candidates.length} candidato(s) de backfill não aplicados (use --apply)`,
    );
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  if (!existsSync(artifactsDir)) mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(
    artifactsDir,
    `evidence-reconcile-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );

  const sample = <T,>(arr: T[], n = 20) => arr.slice(0, n);

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        mode: dryRun ? 'dry-run' : 'apply',
        since: sinceIso,
        window_ms: windowMs,
        counts: report.counts,
        outcome_mismatches_sample: sample(report.outcome_mismatches),
        unresolved_sample: sample(report.unresolved),
        backfill_candidates_sample: sample(report.backfill_candidates),
        gaps_missing_source_sample: sample(report.gaps_missing_source),
        backfill_applied: dryRun ? [] : insertedBackfill,
        backfill_failed: dryRun ? [] : failedBackfill,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`[reconcile:evidence-events] report=${reportPath}`);
}

main().catch((error) => {
  console.error('[reconcile:evidence-events] falhou', error);
  process.exitCode = 1;
});
