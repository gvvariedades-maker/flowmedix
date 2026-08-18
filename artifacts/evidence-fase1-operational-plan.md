# Plano Operacional — Evidence Engine Fase 1 (Lote 11)

> Artefato exigido por SPEC §1.16 e ADR §27 (saída da Fase 1).
> Limiares canônicos deste documento — não inventar números fora daqui.

## Status de aprovação

| Campo | Valor |
|---|---|
| Status | **APROVADO para Etapa 1 (coorte interna)** |
| Aprovado por | Product/Eng EE (autorização explícita no chat 2026-07-27) |
| Data de aprovação | 2026-07-27 |
| Baseline usado | Pré-baseline (Etapa 0→1): limiares conservadores ADR §27; recalibrar após 7 dias de coorte interna com 
econcile:evidence-events --dry-run |

**Escopo desta aprovação:** autoriza **somente Etapa 1** (equipe interna via EE_V1_INTERNAL_EMAILS). Expansão para Etapa 2/3 exige nova aprovação após medições reais dentro dos limiares abaixo.

## 1. Janela de observação

- Mínima por etapa: **7 dias** corridos de tráfego real na coorte.
- Recomendada antes de expandir: **7–14 dias** (preferir 14 se volume baixo).
- Reconciliação na janela: diária (
pm run reconcile:evidence-events -- --dry-run até limiares estáveis).

## 2. Limiares numéricos (aprovados — Etapa 1)

Calculados sobre tentativas elegíveis (ttempt_id gerado, EE_V1_INSTRUMENTATION=true). Para decisão de expansão populacional, excluir is_internal=true (ADR §27 item 8).

| Métrica | Limiar | Ação se violado |
|---|---|---|
| evidence_reconcile_gap_total (gaps / tentativas) | ≤ 2% | Bloqueia expansão; investigar |
| evidence_reconcile_outcome_mismatch_total | ≤ 0.5% (meta 0%) | P1 — alerta; nunca corrigir evento canônico silenciosamente |
| evidence_reconcile_unresolved_after_job_total | ≤ 1% na janela; 0 casos >48h | Bloqueia saída Fase 1 até resolver |
| evidence_event_conviction_unknown_rate (coorte com UI) | ≤ 15% | Investigar UX antes de expandir; fora da coorte 100% unknown é esperado |
| evidence_event_response_time_invalid_rate | ≤ 10% | Revisar timers/visibility |
| evidence_event_ingest_latency_ms p95 | ≤ +300ms vs endpoint sem EE | Investigar perf; nunca bloquear UX |
| Falha EE que afetou HTTP ao aluno | **0** (invariante) | P0 — pausa rollout |
| Duplicação canônica por ttempt_id | **0** (invariante) | P0 — pausa rollout |

## 3. Sequência de rollout

| Etapa | Coorte | Flag | Convicção | Critério |
|---|---|---|---|---|
| 0 Baseline | staging/dev + testes | off/on em teste | — | jest evidence verde; reconcile dry-run ok |
| 1 Interno (**autorizada**) | EE_V1_INTERNAL_EMAILS | 	rue | on | 7–14d dentro dos limiares; is_internal=true |
| 2 Usuários teste | allowlist ampliada | 	rue | conforme aprovador | mesma barra, medição separada |
| 3 Coorte técnica | ADR §18, fora RCT-1 | 	rue | ADR §1.13 | 2 janelas estáveis + aprovação |

Fora da Fase 1: T1, measurement_pool, RCT-1 populacional.

## 4. Rollback

| Ação | Como |
|---|---|
| Pausa imediata | EE_V1_INSTRUMENTATION=false |
| Reduzir coorte | Remover e-mails de EE_V1_INTERNAL_EMAILS |
| Dados | Append-only — **não** apagar eventos no rollback |
| Gatilho | Qualquer P0, ou 2+ P1 na mesma janela |

## 5. LGPD e retenção

- Stream referencia user_id; sem PII direta (nome/e-mail/CPF) no evento.
- Mesma base legal de historico_questoes.
- Retenção alinhada ao histórico de estudo.
- Backfill só com metadados recuperáveis — sem inventar campos.
- Métricas ops via service role; sem endpoint novo de leitura populacional ao client.

## 6. Checklist go/no-go — saída Fase 1

- [ ] Um evento canônico por ttempt_id
- [ ] Reconcile dentro dos limiares §2
- [ ] context válido 100%
- [ ] question_version 100%
- [ ] Tempo válido ou 
esponse_time_status explícito
- [ ] Taxa conviction unknown dentro do limiar (coorte UI)
- [ ] 0 P0 (EE não bloqueou player)
- [ ] is_internal excluído de análise populacional
- [ ] Replay só em teste
- [x] Bloco Status de aprovação preenchido (Etapa 1)

## 7. Changelog

| Data | Mudança | Autor |
|---|---|---|
| 2026-07-27 | Criação inicial (Lote 11) — limiares propostos | Agente |
| 2026-07-27 | **Aprovado Etapa 1** (coorte interna); expansão 2/3 pendente pós-baseline | Product/Eng EE |
