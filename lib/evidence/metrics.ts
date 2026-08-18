/**
 * Métricas do Evidence Engine Fase 1 (Lote 4, observabilidade no Lote 10).
 * Contadores em memória (testes/debug) + logs estruturados (auditoria).
 * Não altera lib/metrics.ts (cache/vitrine).
 *
 * IMPORTANTE — fonte de verdade operacional:
 * Os contadores deste módulo são **em memória por processo** — não
 * sobrevivem a restart/deploy e não são agregados entre instâncias
 * serverless. **Não são** a fonte de verdade de operação (plano §5.1:
 * "log volátil sozinho nunca satisfaz recuperação/critério de saída").
 *
 * Fontes de verdade reais (Lote 10):
 * 1. Tabela `evidence_attempt_events` — volume/contexto/source real via SQL
 *    (`SELECT count(*) ... GROUP BY context, source`), auditável e durável.
 * 2. Logs estruturados abaixo (`[evidence_metric] <nome>`) — plataforma de
 *    logs (ex.: Vercel/Sentry) agrega por texto/labels; `warn`/`error` são
 *    sempre emitidos (mesmo em produção — ver lib/logger.ts); `info` é
 *    suprimido em produção e serve só para debug local/dev.
 * 3. Relatório do runner `reconcile:evidence-events` (artifacts/) — contagens
 *    de gap/unresolved point-in-time, não substituídas por este módulo.
 *
 * Ver docs/EVIDENCE_OPS_METRICS.md para a lista completa + pontos de emissão.
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

/**
 * Log estruturado por métrica — auditoria durável via plataforma de logs.
 * `warn` é sempre emitido (produção inclusa); `info` só em desenvolvimento
 * (ver lib/logger.ts). Usar `warn` para status que merecem atenção
 * operacional (conflito, falha, rejeição); `info` para volume "saudável".
 */
function emitEvidenceMetricLog(
  name: string,
  labels: EvidenceMetricLabels | undefined,
  level: 'info' | 'warn' = 'info',
): void {
  const message = `[evidence_metric] ${name}`;
  if (level === 'warn') {
    logger.warn(message, labels);
  } else {
    logger.info(message, labels);
  }
}

/** Incrementa contador nomeado (labels opcionais) + log estruturado. */
export function recordEvidenceMetric(
  name: string,
  labels?: EvidenceMetricLabels,
  delta = 1,
  logLevel: 'info' | 'warn' = 'info',
): void {
  const key = metricKey(name, labels);
  counters.set(key, (counters.get(key) ?? 0) + delta);
  emitEvidenceMetricLog(name, labels, logLevel);
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

/** `status`: created | duplicate — info; conflict | skipped | persistence_failed — warn. */
export function recordEvidenceIngestTotal(labels: {
  context: string;
  source: string;
  status: string;
}): void {
  const healthyStatus = labels.status === 'created' || labels.status === 'duplicate';
  recordEvidenceMetric(
    'evidence_event_ingest_total',
    labels,
    1,
    healthyStatus ? 'info' : 'warn',
  );
}

export function recordEvidenceAttemptIdInvalid(route: string, reason: string): void {
  recordEvidenceMetric('evidence_attempt_id_invalid_total', { route, reason }, 1, 'warn');
}

export function recordEvidenceContextRejected(): void {
  recordEvidenceMetric('evidence_event_context_rejected_total', undefined, 1, 'warn');
}

export function recordEvidenceQuestionVersionFailed(): void {
  recordEvidenceMetric('evidence_event_question_version_failed_total', undefined, 1, 'warn');
}

export function recordEvidenceIdempotentReplay(): void {
  recordEvidenceMetric('evidence_event_idempotent_replay_total');
}

export function recordEvidenceConflict(): void {
  recordEvidenceMetric('evidence_event_conflict_total', undefined, 1, 'warn');
}

export function recordEvidenceInvalidClientFields(): void {
  recordEvidenceMetric('evidence_event_invalid_client_fields_total', undefined, 1, 'warn');
}

export function recordEvidencePersistenceFailed(
  phase: 'find' | 'insert' | 'reload_after_race',
): void {
  recordEvidenceMetric('evidence_event_persistence_failed_total', { phase }, 1, 'warn');
}

/**
 * Latência por evento — em memória apenas (sem log por request; volume alto
 * geraria ruído). Latência p95 real requer APM (fora do escopo Fase 1) —
 * ver docs/EVIDENCE_OPS_METRICS.md.
 */
export function recordEvidenceIngestLatencyMs(ms: number): void {
  const key = metricKey('evidence_event_ingest_latency_ms_sum', undefined);
  counters.set(key, (counters.get(key) ?? 0) + ms);
  const countKey = metricKey('evidence_event_ingest_latency_ms_count', undefined);
  counters.set(countKey, (counters.get(countKey) ?? 0) + 1);
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
