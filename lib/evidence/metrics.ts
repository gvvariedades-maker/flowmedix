/**
 * Métricas do Evidence Engine Fase 1 (Lote 4).
 * Contadores em memória + hook para logger em lotes posteriores.
 * Não altera lib/metrics.ts (cache/vitrine).
 *
 * Limitação: contadores não são duráveis — observabilidade operacional = Lote 10.
 * Labels com cardinalidade fixa (sem user_id, attempt_id, e-mail).
 */

import { logger } from '@/lib/logger';

export type EvidenceMetricLabels = Record<string, string>;

const counters = new Map<string, number>();

function metricKey(name: string, labels?: EvidenceMetricLabels): string {
  if (!labels || Object.keys(labels).length === 0) {
    return name;
  }
  const sorted = Object.keys(labels)
    .sort()
    .map((k) => `${k}=${labels[k]}`)
    .join(',');
  return `${name}{${sorted}}`;
}

/** Incrementa contador nomeado (labels opcionais). */
export function recordEvidenceMetric(
  name: string,
  labels?: EvidenceMetricLabels,
  delta = 1,
): void {
  const key = metricKey(name, labels);
  counters.set(key, (counters.get(key) ?? 0) + delta);
}

/** Lê contador (testes / debug). */
export function getEvidenceMetricCount(
  name: string,
  labels?: EvidenceMetricLabels,
): number {
  return counters.get(metricKey(name, labels)) ?? 0;
}

/** Zera contadores (somente testes). */
export function resetEvidenceMetricsForTest(): void {
  counters.clear();
}

export function recordEvidenceIngestTotal(labels: {
  context: string;
  source: string;
  status: string;
}): void {
  recordEvidenceMetric('evidence_event_ingest_total', labels);
}

export function recordEvidenceAttemptIdInvalid(route: string, reason: string): void {
  recordEvidenceMetric('evidence_attempt_id_invalid_total', { route, reason });
}

export function recordEvidenceContextRejected(): void {
  recordEvidenceMetric('evidence_event_context_rejected_total');
}

export function recordEvidenceQuestionVersionFailed(): void {
  recordEvidenceMetric('evidence_event_question_version_failed_total');
}

export function recordEvidenceIdempotentReplay(): void {
  recordEvidenceMetric('evidence_event_idempotent_replay_total');
}

export function recordEvidenceConflict(): void {
  recordEvidenceMetric('evidence_event_conflict_total');
}

export function recordEvidenceInvalidClientFields(): void {
  recordEvidenceMetric('evidence_event_invalid_client_fields_total');
}

export function recordEvidencePersistenceFailed(
  phase: 'find' | 'insert' | 'reload_after_race',
): void {
  recordEvidenceMetric('evidence_event_persistence_failed_total', { phase });
}

export function recordEvidenceIngestLatencyMs(ms: number): void {
  recordEvidenceMetric('evidence_event_ingest_latency_ms_sum', undefined, ms);
  recordEvidenceMetric('evidence_event_ingest_latency_ms_count');
}

/** Log estruturado de conflito (D5) — stream intocado. */
export function logEvidenceIngestConflict(context: {
  attempt_id: string;
  user_id: string;
  question_id: string;
}): void {
  logger.warn('Evidence ingest conflict — evento existente intocado', context);
}

/** Falha de persistência — sem payload, enunciado ou PII. */
export function logEvidenceIngestPersistenceFailed(context: {
  phase: 'find' | 'insert' | 'reload_after_race';
  attempt_id?: string;
  user_id: string;
  question_id: string;
}): void {
  logger.warn('Evidence ingest persistence failed', context);
}
