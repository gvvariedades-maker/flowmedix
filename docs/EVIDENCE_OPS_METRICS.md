# Evidence Engine Fase 1 — Métricas operacionais (Lote 10)

**Fontes normativas:** [`SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md`](SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md) §1.12 · [`PLANO_IMPLEMENTACAO_EVIDENCE_ENGINE_FASE_1.md`](PLANO_IMPLEMENTACAO_EVIDENCE_ENGINE_FASE_1.md) §Lote 10.

Este documento é a referência única de nomes de métrica → ponto de emissão →
tipo de fonte real. Nomes canônicos: [`lib/evidence/opsMetrics.ts`](../lib/evidence/opsMetrics.ts)
(`EVIDENCE_METRIC_NAMES`).

---

## 1. Por que não confiar só nos contadores em memória

[`lib/evidence/metrics.ts`](../lib/evidence/metrics.ts) mantém contadores **em
memória por processo** para permitir testes unitários determinísticos
(`getEvidenceMetricCount`, `resetEvidenceMetricsForTest`). Em produção
(serverless/multi-instância):

- Contadores **não são compartilhados** entre invocações/instâncias.
- Contadores **não sobrevivem** a cold start / redeploy.
- **Não são** a fonte de verdade de operação — plano §5.1: *"log volátil
  sozinho (`logger.warn`) nunca satisfaz recuperação nem critério de saída
  da Fase 1"*.

Por isso este módulo também emite **log estruturado** a cada incremento
(`[evidence_metric] <nome>` + labels) e o **critério de saída real** depende
de consultar diretamente `evidence_attempt_events` (fonte durável) e o
relatório do runner de reconciliação (Lote 9).

## 2. As três fontes de verdade reais

| # | Fonte | Uso |
|---|-------|-----|
| 1 | Tabela `evidence_attempt_events` (SQL direto) | Volume real, `context`, `source`, `is_internal`, taxa `conviction=unknown`, taxa `response_time_status=invalid` — sempre auditável, nunca perdido por restart |
| 2 | Logs estruturados (`[evidence_metric] <nome>` via `lib/logger.ts`) | `warn`/`error` sempre emitidos (mesmo em produção); agregação por texto/labels na plataforma de logs (ex.: Vercel Logs, Sentry). `info` só em desenvolvimento |
| 3 | Relatório JSON do runner (`artifacts/evidence-reconcile-report-*.json`) | Contagem point-in-time de gaps/unresolved/outcome mismatch — evidência formal para o gate de saída da Fase 1 |

## 3. Tabela de métricas (spec §1.12 + plano §Lote 10)

| Métrica | Emissão (arquivo/função) | Nível de log | Query SQL real equivalente |
|---------|---------------------------|--------------|------------------------------|
| `evidence_event_ingest_total{context,source,status}` | `ingestAttemptEvent.ts` → `recordEvidenceIngestTotal` (`metrics.ts`) | `info` (created/duplicate) · `warn` (conflict/skipped/persistence_failed) | `SELECT context, source, count(*) FROM evidence_attempt_events GROUP BY 1,2` |
| `evidence_event_idempotent_replay_total` | `ingestAttemptEvent.ts` → `recordEvidenceIdempotentReplay` | `info` | N/A (deriva de `status=duplicate` acima) |
| `evidence_event_conflict_total` | `ingestAttemptEvent.ts` → `recordEvidenceConflict` + `logEvidenceIngestConflict` | `warn` | N/A — conflitos não são persistidos (evento original intocado); só via log |
| `evidence_attempt_id_invalid_total{route,reason}` | `ingestAttemptEvent.ts` → `recordEvidenceAttemptIdInvalid` | `warn` | N/A — corpo rejeitado antes de qualquer insert |
| `evidence_event_context_rejected_total` | `ingestAttemptEvent.ts` → `recordEvidenceContextRejected` | `warn` | N/A — body do cliente ignorado; `context` real sempre derivado da rota |
| `evidence_event_question_version_failed_total` | `ingestAttemptEvent.ts` → `recordEvidenceQuestionVersionFailed` | `warn` | N/A — evento não inserido (soft-skip) |
| `evidence_event_invalid_client_fields_total` | `ingestAttemptEvent.ts` → `recordEvidenceInvalidClientFields` | `warn` | N/A |
| `evidence_event_persistence_failed_total{phase}` | `ingestAttemptEvent.ts` → `recordEvidencePersistenceFailed` + `logEvidenceIngestPersistenceFailed` | `warn` | Comparar contagem de tentativas legado (`historico_questoes`/`simulado_respostas`) vs `evidence_attempt_events` no mesmo período — gap = falhas de persistência não capturadas em log |
| `evidence_event_conviction_unknown_rate` | **Agregação** — não incrementada em runtime | — | `SELECT avg((conviction = 'unknown')::int) FROM evidence_attempt_events WHERE created_at > now() - interval '7 days' AND is_internal = false` |
| `evidence_event_response_time_invalid_rate` | **Agregação** — não incrementada em runtime | — | `SELECT avg((response_time_status = 'invalid')::int) FROM evidence_attempt_events WHERE created_at > now() - interval '7 days'` |
| `evidence_event_ingest_latency_ms` | `ingestAttemptEvent.ts` → `recordEvidenceIngestLatencyMs` | nenhum (sem log por request — ruído) | Latência real requer APM (fora do escopo Fase 1); contador em memória serve só para smoke/debug local |
| `evidence_reconcile_gap_total{source_table}` | `scripts/reconcile-evidence-events.ts` → `recordEvidenceReconcileGap` (`opsMetrics.ts`) | `warn` | Contagem direta no relatório do runner (`gaps_missing_event.length`) |
| `evidence_reconcile_outcome_mismatch_total{reason}` | `scripts/reconcile-evidence-events.ts` → `recordEvidenceReconcileOutcomeMismatch` | `warn` (severidade P1 — plano §5.1) | Contagem direta no relatório do runner (`outcome_mismatches.length`) |
| `evidence_reconcile_unresolved_after_job_total` | `scripts/reconcile-evidence-events.ts` → `recordEvidenceReconcileUnresolvedAfterJob` | `warn` se `> 0`; `info` se `0` | Contagem direta no relatório do runner (`unresolved.length`) — **obrigatório** no gate de saída (plano §19 item 2) |
| `evidence_outbox_backlog_total` | **Proposto** — só se outbox físico (plano §5.2) for implantado | — | N/A nesta implementação (sem tabela de outbox) |

## 4. Como consultar em produção (sem dashboard dedicado)

```sql
-- Volume por contexto/status (últimos 7 dias)
select context, source, count(*) as total
from evidence_attempt_events
where created_at > now() - interval '7 days'
group by 1, 2
order by total desc;

-- Taxa de conviction=unknown (excluindo coorte interna)
select avg((conviction = 'unknown')::int) as unknown_rate
from evidence_attempt_events
where created_at > now() - interval '7 days'
  and is_internal = false;

-- Taxa de response_time inválido/desconhecido
select response_time_status, count(*) as total
from evidence_attempt_events
where created_at > now() - interval '7 days'
group by 1;

-- Eventos de backfill (fidelidade limitada — nunca entram em RCT)
select count(*) as backfill_events
from evidence_attempt_events
where source = 'reconcile_backfill';
```

## 5. Logs estruturados — como localizar

Todos os logs deste módulo usam o prefixo `[evidence_metric]` (função
`emitEvidenceMetricLog` em `metrics.ts`) ou mensagem fixa (`logEvidenceIngestConflict`,
`logEvidenceIngestPersistenceFailed`). Em produção, filtrar por:

- `[evidence_metric]` — incrementos de métrica com labels.
- `Evidence ingest conflict` — conflito semântico (§1.3.1) no mesmo `attempt_id`.
- `Evidence ingest persistence failed` — falha de insert/find (sem payload/PII).
- `Evidence ingest boundary failed in <rota>` — falha inesperada no hook (`ingestEvidenceRouteHook.ts`).

## 6. Baseline e alertas (pré-rollout)

Limiares numéricos concretos (taxa de gap, `conviction=unknown`,
`response_time_invalid`, `unresolved_after_job`) **não** são fixados aqui —
ver [`artifacts/evidence-fase1-operational-plan.md`](../artifacts/evidence-fase1-operational-plan.md)
(Lote 11), que define os números aprovados após medir baseline em staging/coorte
interna.

## 7. Não fazer

- Não tratar `getEvidenceMetricCount` / `getEvidenceOpsMetricSnapshot` como
  métrica de produção — servem só para asserções em testes unitários.
- Não introduzir Prometheus/fornecedor externo inexistente no repo (plano
  §Lote 10 — "fora do lote").
- Não alterar `lib/metrics.ts` (cache/vitrine) para acomodar EE — módulos
  separados por design.
