/**
 * Constantes e helpers de observabilidade operacional — Evidence Engine
 * Fase 1 (Lote 10). Espelha spec §1.12 + plano §Lote 10 (tabela de
 * "Métricas obrigatórias").
 *
 * Fonte única de nomes: usar `EVIDENCE_METRIC_NAMES` em vez de strings soltas
 * em novos pontos de instrumentação (núcleo de ingestão, rotas, runner de
 * reconciliação). Ver docs/EVIDENCE_OPS_METRICS.md para o mapa completo
 * nome → ponto de emissão → tipo de query real (SQL vs contador em memória).
 */

import { getEvidenceMetricCount, recordEvidenceMetric } from '@/lib/evidence/metrics';

/** Nomes canônicos — não inventar strings alternativas em novo código. */
export const EVIDENCE_METRIC_NAMES = {
  INGEST_TOTAL: 'evidence_event_ingest_total',
  IDEMPOTENT_REPLAY_TOTAL: 'evidence_event_idempotent_replay_total',
  CONFLICT_TOTAL: 'evidence_event_conflict_total',
  ATTEMPT_ID_INVALID_TOTAL: 'evidence_attempt_id_invalid_total',
  CONTEXT_REJECTED_TOTAL: 'evidence_event_context_rejected_total',
  QUESTION_VERSION_FAILED_TOTAL: 'evidence_event_question_version_failed_total',
  CONVICTION_UNKNOWN_RATE: 'evidence_event_conviction_unknown_rate',
  RESPONSE_TIME_INVALID_RATE: 'evidence_event_response_time_invalid_rate',
  INGEST_LATENCY_MS: 'evidence_event_ingest_latency_ms',
  INVALID_CLIENT_FIELDS_TOTAL: 'evidence_event_invalid_client_fields_total',
  PERSISTENCE_FAILED_TOTAL: 'evidence_event_persistence_failed_total',
  /** Lote 9 — runner `reconcile:evidence-events`. */
  RECONCILE_GAP_TOTAL: 'evidence_reconcile_gap_total',
  RECONCILE_OUTCOME_MISMATCH_TOTAL: 'evidence_reconcile_outcome_mismatch_total',
  /** Obrigatório — gate de saída da Fase 1 (plano §5.1, §19 item 2). */
  RECONCILE_UNRESOLVED_AFTER_JOB_TOTAL: 'evidence_reconcile_unresolved_after_job_total',
  /** Proposto — só relevante se outbox físico for adotado (plano §5.2). */
  OUTBOX_BACKLOG_TOTAL: 'evidence_outbox_backlog_total',
} as const;

export type EvidenceMetricName =
  (typeof EVIDENCE_METRIC_NAMES)[keyof typeof EVIDENCE_METRIC_NAMES];

/**
 * Métricas emitidas pelo runner de reconciliação (Lote 9) — chamadas pelo
 * script `scripts/reconcile-evidence-events.ts` após cada execução (dry-run
 * ou apply). Contadores em memória (processo do script) + log estruturado;
 * o relatório JSON em `artifacts/` é a evidência point-in-time auditável.
 */
export function recordEvidenceReconcileGap(labels: {
  source_table: 'historico_questoes' | 'simulado_respostas';
}): void {
  recordEvidenceMetric(EVIDENCE_METRIC_NAMES.RECONCILE_GAP_TOTAL, labels, 1, 'warn');
}

export function recordEvidenceReconcileOutcomeMismatch(labels: {
  reason: 'selected_alternative_mismatch' | 'correct_mismatch';
}): void {
  recordEvidenceMetric(
    EVIDENCE_METRIC_NAMES.RECONCILE_OUTCOME_MISMATCH_TOTAL,
    labels,
    1,
    'warn',
  );
}

/**
 * `count`: total de gaps que permaneceram sem evento após o job (sem
 * metadados recuperáveis para backfill). Gate de saída da Fase 1 — limiar
 * em `artifacts/evidence-fase1-operational-plan.md`.
 */
export function recordEvidenceReconcileUnresolvedAfterJob(count: number): void {
  recordEvidenceMetric(
    EVIDENCE_METRIC_NAMES.RECONCILE_UNRESOLVED_AFTER_JOB_TOTAL,
    undefined,
    count,
    count > 0 ? 'warn' : 'info',
  );
}

/** Proposto (plano §5.2) — só usado se outbox físico for implantado. */
export function recordEvidenceOutboxBacklog(count: number): void {
  recordEvidenceMetric(EVIDENCE_METRIC_NAMES.OUTBOX_BACKLOG_TOTAL, undefined, count, 'info');
}

/**
 * Leitura dos contadores em memória do processo atual — **debug local /
 * testes apenas**. Nunca usar isto como fonte de decisão operacional; ver
 * cabeçalho de `lib/evidence/metrics.ts` e docs/EVIDENCE_OPS_METRICS.md.
 */
export function getEvidenceOpsMetricSnapshot(): Record<EvidenceMetricName, number> {
  const snapshot = {} as Record<EvidenceMetricName, number>;
  for (const name of Object.values(EVIDENCE_METRIC_NAMES)) {
    snapshot[name] = getEvidenceMetricCount(name);
  }
  return snapshot;
}
