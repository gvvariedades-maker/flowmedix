/**
 * Lógica pura de pareamento e reconciliação — Evidence Engine Fase 1 (Lote 9).
 * Spec §1.10 (reconciliação) + §5 do plano (recuperação operacional obrigatória).
 *
 * Sem I/O — o caller (`scripts/reconcile-evidence-events.ts`) busca os
 * registros no Supabase e passa arrays já carregados/normalizados.
 *
 * Invariantes (não negociáveis):
 * - `attempt_id` é a chave de pareamento preferencial; secundário =
 *   user_id + question_id + janela de tempo (+ session_id quando presente).
 * - Nunca assume 1:1 permanente por (user_id, question_id) — múltiplos
 *   eventos por questão são válidos (§1.2.1).
 * - Nunca inventa `selected_alternative`, `correct`, `conviction`, tempo ou
 *   `question_version` ausentes. Gaps sem metadados recuperáveis ficam
 *   `unresolved` — não reduzir para 0 corrigindo silenciosamente.
 */

import type { EvidenceAttemptContextPhase1, EvidenceConviction } from '@/lib/evidence/types';

export type ReconcileSourceTable = 'historico_questoes' | 'simulado_respostas';

/**
 * Registro de origem legado (histórico ou simulado) já normalizado pelo
 * caller. Campos ausentes na fonte legada (ex.: `selected_alternative` em
 * `historico_questoes`) devem ser `null` — nunca inferidos aqui.
 */
export type ReconcileAttemptSourceRecord = {
  source_table: ReconcileSourceTable;
  /** id da linha de origem — só para relatório/auditoria; não é `attempt_id`. */
  source_id: string;
  user_id: string;
  question_id: string;
  session_id: string | null;
  /**
   * `attempt_id` recuperável (log estruturado / outbox futuro).
   * Ausente na maioria dos casos — `historico_questoes` não guarda hoje.
   */
  attempt_id: string | null;
  /** Só disponível de fato em `simulado_respostas` (`opcao_id`). */
  selected_alternative: string | null;
  correct: boolean | null;
  /** Fase 1: default `unknown`; nunca inventar valor diferente sem fonte. */
  conviction: EvidenceConviction | null;
  /** Derivado pelo caller via `lib/evidence/deriveContext.ts` — nunca aqui. */
  context: EvidenceAttemptContextPhase1 | null;
  /**
   * Hash já calculado pelo caller (`lib/evidence/questionVersion.ts`) a
   * partir do `conteudo_json` vigente — este módulo não recalcula.
   */
  question_version: string | null;
  /** ISO 8601 — `created_at` (histórico) / `respondida_em` (simulado). */
  occurred_at: string;
};

export type ReconcileEventRecord = {
  attempt_id: string;
  user_id: string;
  question_id: string;
  session_id: string | null;
  selected_alternative: string;
  correct: boolean;
  created_at: string;
};

export type ReconcilePairedOutcome = {
  kind: 'paired';
  matched_by: 'attempt_id' | 'secondary';
  source: ReconcileAttemptSourceRecord;
  event: ReconcileEventRecord;
};

/** Severidade P1 (spec §1.10) — nunca corrigido silenciosamente. */
export type ReconcileOutcomeMismatch = {
  kind: 'outcome_mismatch';
  matched_by: 'attempt_id' | 'secondary';
  source: ReconcileAttemptSourceRecord;
  event: ReconcileEventRecord;
  reason: 'selected_alternative_mismatch' | 'correct_mismatch';
};

export type ReconcileMissingEventGap = {
  kind: 'gap_missing_event';
  source: ReconcileAttemptSourceRecord;
  /** true quando há metadados suficientes para backfill sem inventar campos. */
  backfillable: boolean;
  reason: 'no_secondary_match';
};

/** Evento sem linha de histórico correspondente — informativo (§1.10). */
export type ReconcileMissingSourceGap = {
  kind: 'gap_missing_source';
  event: ReconcileEventRecord;
};

export type ReconcileEvidenceEventsInput = {
  sources: readonly ReconcileAttemptSourceRecord[];
  events: readonly ReconcileEventRecord[];
  /** Janela de pareamento secundário em ms (spec §1.10) — ex.: 5 min. */
  window_ms: number;
};

export type ReconcileEvidenceEventsReport = {
  paired: ReconcilePairedOutcome[];
  outcome_mismatches: ReconcileOutcomeMismatch[];
  gaps_missing_event: ReconcileMissingEventGap[];
  gaps_missing_source: ReconcileMissingSourceGap[];
  /** Subconjunto de `gaps_missing_event` sem metadados para backfill. */
  unresolved: ReconcileMissingEventGap[];
  /** Subconjunto de `gaps_missing_event` com metadados suficientes. */
  backfill_candidates: ReconcileMissingEventGap[];
  counts: {
    sources: number;
    events: number;
    paired: number;
    outcome_mismatches: number;
    gaps_missing_event: number;
    gaps_missing_source: number;
    unresolved: number;
    backfill_candidates: number;
  };
};

function isSourceBackfillable(source: ReconcileAttemptSourceRecord): boolean {
  return (
    typeof source.selected_alternative === 'string' &&
    source.selected_alternative.length > 0 &&
    typeof source.correct === 'boolean' &&
    typeof source.question_version === 'string' &&
    source.question_version.length > 0 &&
    typeof source.context === 'string'
  );
}

function detectOutcomeMismatch(
  source: ReconcileAttemptSourceRecord,
  event: ReconcileEventRecord,
): ReconcileOutcomeMismatch['reason'] | null {
  if (
    typeof source.selected_alternative === 'string' &&
    source.selected_alternative !== event.selected_alternative
  ) {
    return 'selected_alternative_mismatch';
  }
  if (typeof source.correct === 'boolean' && source.correct !== event.correct) {
    return 'correct_mismatch';
  }
  return null;
}

function timeDiffMs(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime());
}

/**
 * Pareia fontes (histórico/simulado) com eventos do stream — sem DB.
 * Ordem de preferência (§1.10): `attempt_id` > secundário
 * (user_id + question_id + janela + session_id quando presente).
 */
export function reconcileEvidenceEvents(
  input: ReconcileEvidenceEventsInput,
): ReconcileEvidenceEventsReport {
  const eventsById = new Map<string, ReconcileEventRecord>();
  for (const event of input.events) {
    eventsById.set(event.attempt_id, event);
  }
  const consumedEventIds = new Set<string>();

  const paired: ReconcilePairedOutcome[] = [];
  const outcome_mismatches: ReconcileOutcomeMismatch[] = [];
  const gaps_missing_event: ReconcileMissingEventGap[] = [];

  // Ordena por occurred_at para determinismo do pareamento secundário.
  const sortedSources = [...input.sources].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );

  for (const source of sortedSources) {
    let matchedEvent: ReconcileEventRecord | null = null;
    let matchedBy: 'attempt_id' | 'secondary' | null = null;

    if (source.attempt_id) {
      const byId = eventsById.get(source.attempt_id);
      if (byId && !consumedEventIds.has(byId.attempt_id)) {
        matchedEvent = byId;
        matchedBy = 'attempt_id';
      }
    }

    if (!matchedEvent) {
      const candidates = input.events.filter(
        (event) =>
          !consumedEventIds.has(event.attempt_id) &&
          event.user_id === source.user_id &&
          event.question_id === source.question_id &&
          (source.session_id == null || event.session_id === source.session_id) &&
          timeDiffMs(event.created_at, source.occurred_at) <= input.window_ms,
      );
      if (candidates.length > 0) {
        candidates.sort((a, b) => {
          const diffA = timeDiffMs(a.created_at, source.occurred_at);
          const diffB = timeDiffMs(b.created_at, source.occurred_at);
          if (diffA !== diffB) return diffA - diffB;
          return a.attempt_id.localeCompare(b.attempt_id);
        });
        matchedEvent = candidates[0];
        matchedBy = 'secondary';
      }
    }

    if (matchedEvent && matchedBy) {
      consumedEventIds.add(matchedEvent.attempt_id);
      const mismatchReason = detectOutcomeMismatch(source, matchedEvent);
      if (mismatchReason) {
        outcome_mismatches.push({
          kind: 'outcome_mismatch',
          matched_by: matchedBy,
          source,
          event: matchedEvent,
          reason: mismatchReason,
        });
      } else {
        paired.push({ kind: 'paired', matched_by: matchedBy, source, event: matchedEvent });
      }
      continue;
    }

    gaps_missing_event.push({
      kind: 'gap_missing_event',
      source,
      backfillable: isSourceBackfillable(source),
      reason: 'no_secondary_match',
    });
  }

  const gaps_missing_source: ReconcileMissingSourceGap[] = input.events
    .filter((event) => !consumedEventIds.has(event.attempt_id))
    .map((event) => ({ kind: 'gap_missing_source' as const, event }));

  const unresolved = gaps_missing_event.filter((gap) => !gap.backfillable);
  const backfill_candidates = gaps_missing_event.filter((gap) => gap.backfillable);

  return {
    paired,
    outcome_mismatches,
    gaps_missing_event,
    gaps_missing_source,
    unresolved,
    backfill_candidates,
    counts: {
      sources: input.sources.length,
      events: input.events.length,
      paired: paired.length,
      outcome_mismatches: outcome_mismatches.length,
      gaps_missing_event: gaps_missing_event.length,
      gaps_missing_source: gaps_missing_source.length,
      unresolved: unresolved.length,
      backfill_candidates: backfill_candidates.length,
    },
  };
}

export type ReconcileBackfillEventDraft = {
  attempt_id: string;
  user_id: string;
  question_id: string;
  question_version: string;
  selected_alternative: string;
  correct: boolean;
  conviction: EvidenceConviction;
  context: EvidenceAttemptContextPhase1;
  started_at: null;
  answered_at: null;
  response_time_ms: null;
  response_time_status: 'unknown';
  response_time_invalid_reason: null;
  answer_change_count: 0;
  session_id: string | null;
  source: 'reconcile_backfill';
  is_internal: boolean;
  event_type: 'attempt';
  created_at: string;
};

/**
 * Constrói o rascunho de uma linha de backfill (`source = reconcile_backfill`)
 * a partir de um gap com metadados suficientes (`backfillable === true`).
 *
 * Nunca preenche `started_at` / `answered_at` / `response_time_*` com valores
 * inventados — ficam `null` / `unknown` (fidelidade limitada; §5.1 do plano:
 * eventos de backfill **não** entram em experimentos/RCT futuros).
 *
 * `attempt_id` é gerado pelo caller (UUID v4) — este módulo não gera IDs.
 */
export function buildBackfillEventDraft(
  gap: ReconcileMissingEventGap,
  attempt_id: string,
  now_iso: string,
  is_internal = false,
): ReconcileBackfillEventDraft | null {
  if (!gap.backfillable) return null;
  const { source } = gap;
  if (
    typeof source.selected_alternative !== 'string' ||
    typeof source.correct !== 'boolean' ||
    typeof source.question_version !== 'string' ||
    typeof source.context !== 'string'
  ) {
    return null;
  }
  return {
    attempt_id,
    user_id: source.user_id,
    question_id: source.question_id,
    question_version: source.question_version,
    selected_alternative: source.selected_alternative,
    correct: source.correct,
    conviction: source.conviction ?? 'unknown',
    context: source.context,
    started_at: null,
    answered_at: null,
    response_time_ms: null,
    response_time_status: 'unknown',
    response_time_invalid_reason: null,
    answer_change_count: 0,
    session_id: source.session_id,
    source: 'reconcile_backfill',
    is_internal,
    event_type: 'attempt',
    created_at: now_iso,
  };
}
