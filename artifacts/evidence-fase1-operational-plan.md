# Plano Operacional — Evidence Engine Fase 1 (Lote 11)

> Artefato exigido por [`SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md`](../docs/SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md) §1.16 e pelo checklist de go/no-go em [`DECISAO_EVIDENCE_ENGINE.md`](../docs/DECISAO_EVIDENCE_ENGINE.md) §27 ("Saída da Fase 1").
>
> A spec e o ADR **não** fixam números — este documento propõe os limiares concretos e é o local canônico para eles.

## Status de aprovação

| Campo | Valor |
|---|---|
| Status | **PROPOSTO — pendente de aprovação humana** |
| Aprovado por | _(preencher: responsável de produto/engenharia do EE)_ |
| Data de aprovação | _(preencher: AAAA-MM-DD)_ |
| Baseline usado | _(preencher: link do relatório de `reconcile:evidence-events` ou dashboard usado para calibrar os limiares abaixo)_ |

**Regra:** nenhum limiar abaixo é definitivo até este bloco ser preenchido por um humano responsável, com data e referência ao baseline medido (mesmo ritual de aprovação da spec + ADR, conforme §1.16). Antes da primeira medição de baseline, os valores abaixo servem como ponto de partida conservador derivado dos invariantes do ADR §27 e devem ser recalibrados com dados reais da coorte interna (Etapa 1 do rollout, abaixo) antes de avançar para a Etapa 2.

## 1. Janela de observação

- **Janela mínima por etapa do rollout:** 7 dias corridos de tráfego real na coorte daquela etapa.
- **Janela recomendada antes de expandir coorte:** 7–14 dias (usar 14 dias se o volume diário de tentativas da coorte for baixo, para reduzir ruído estatístico).
- **Frequência do job de reconciliação durante a janela de observação:** diária (`npm run reconcile:evidence-events`, modo `--dry-run` até os limiares abaixo estarem estáveis).

## 2. Limiares numéricos propostos

Todos os limiares são calculados sobre o volume de **tentativas elegíveis** (evento `attempt_id` gerado, `EE_V1_INSTRUMENTATION=true`) na janela de observação. "Elegível" exclui eventos com `is_internal = true` quando o limiar for usado para decidir expansão para usuários gerais (ADR §27 item 8).

| Métrica | Limiar proposto | Ação se violado |
|---|---|---|
| `evidence_reconcile_gap_total` (gaps / total de tentativas na janela) | ≤ 2% | Bloqueia expansão de coorte; investigar causa raiz antes de novo ciclo |
| `evidence_reconcile_outcome_mismatch_total` (mismatches / total pareado) | ≤ 0.5% (meta: 0%) | **P1** — qualquer ocorrência gera alerta e investigação humana; **nunca** corrigir o evento canônico silenciosamente (SPEC §1.10) |
| `evidence_reconcile_unresolved_after_job_total` (não resolvidos após 1 execução do job) | ≤ 1% do total de tentativas da janela, e 0 casos com mais de 48h sem resolução | Bloqueia saída da Fase 1 (ADR §27 item 2) até resolvido ou explicitamente aceito como limitação conhecida no aprovador |
| `evidence_event_conviction_unknown_rate` (dentro da coorte com UI de convicção habilitada) | ≤ 15% | Investigar UX/latência do seletor antes de expandir coorte (ADR §27 item 6); fora da coorte, 100% `unknown` é esperado e não é violação |
| `evidence_event_response_time_invalid_rate` | ≤ 10% | Revisar cálculo de `response_time_ms` / causas de `response_time_status != valid` antes de expandir coorte |
| `evidence_event_ingest_latency_ms` (p95) | ≤ 300ms adicionais sobre a latência do endpoint sem EE (medir via log estruturado, não bloqueia resposta ao aluno — SPEC §1.14) | Investigar performance; **nunca** transformar em bloqueio de UX |
| Falhas de persistência do stream que afetaram resposta HTTP ao aluno | 0 (invariante, não é limiar de tolerância) | **P0** — qualquer ocorrência é bug do fallback não bloqueante (SPEC §1.14) e pausa o rollout até correção |
| Duplicação de evento canônico por `attempt_id` | 0 (invariante) | **P0** — indica falha de idempotência; pausa rollout |

## 3. Sequência de rollout

| Etapa | Coorte | `EE_V1_INSTRUMENTATION` | UI de convicção | Critério de avanço |
|---|---|---|---|---|
| 0 — Baseline | Nenhum tráfego real (dev/staging + testes automatizados) | — | — | `npx jest --testPathPattern=lib/evidence` verde; `reconcile:evidence-events --dry-run` roda sem erro |
| 1 — Interno | E-mails em `EE_V1_INTERNAL_EMAILS` (equipe) | `true` | `true` (via `shouldShowConvictionUi`) | 7–14 dias dentro dos limiares da seção 2; `is_internal = true` em 100% dos eventos desta etapa |
| 2 — Usuários de teste | Lista adicional de usuários de teste (ainda via allowlist, `is_internal` pode ser `false` se decidido explicitamente) | `true` | Conforme decisão do aprovador (pode manter restrito à etapa 1) | Mesmos limiares da seção 2, medidos separadamente da etapa 1 |
| 3 — Coorte técnica ampliada | Subconjunto maior definido pelo ADR §18 / RCT-1, **fora** do sampling frame do RCT-1 | `true` | Conforme ADR §1.13 | Limiares da seção 2 estáveis por 2 janelas consecutivas; aprovação humana registrada nesta etapa |

**Fora de escopo da Fase 1:** rollout populacional de convicção/T1, `measurement_pool`, RCT-1 (Fase 4) — não avançar além da Etapa 3 sob este artefato.

## 4. Rollback

| Ação | Como | Efeito |
|---|---|---|
| Pausa imediata (qualquer etapa) | `EE_V1_INSTRUMENTATION=false` no ambiente | Para nova ingestão e UI de convicção; player/simulado voltam ao fluxo legado de confirmação (SPEC §1.15) |
| Reduzir coorte sem desligar tudo | Remover e-mails de `EE_V1_INTERNAL_EMAILS` | Usuários removidos deixam de ver a UI de convicção; ingestão de eventos gerais (sem convicção) continua se a flag global estiver ligada |
| Dados já persistidos | Nenhuma ação — eventos são **append-only** | `evidence_attempt_events`, `historico_questoes` e `simulado_respostas` permanecem inalterados pelo rollback da flag |
| Gatilho para rollback | Qualquer violação de invariante P0 na seção 2, ou 2+ violações de limiar P1 na mesma janela | Decisão do aprovador; registrar no changelog deste artefato |

## 5. LGPD e retenção

- **Dados pessoais no stream:** `evidence_attempt_events` referencia `user_id` (chave para `auth.users`/perfil) mas não duplica dados de identificação direta (nome, e-mail, CPF) nos campos do evento — ver `lib/evidence/persistenceTypes.ts`. `is_internal = true` é o único sinal de "colaborador" persistido.
- **Base legal:** mesma base já aplicada a `historico_questoes` (execução do serviço de estudo reverso) — o event stream é telemetria complementar da mesma tentativa, não uma nova finalidade de tratamento.
- **Retenção:** os eventos de tentativa seguem o mesmo período de retenção do histórico de estudo (`historico_questoes`/`simulado_respostas`), pois representam o mesmo fato (uma tentativa de resposta) em formato estruturado adicional. Não criar política de retenção divergente sem revisão jurídica/produto.
- **Backfill de reconciliação (`source=reconcile_backfill`):** só grava campos recuperáveis das fontes já existentes (`historico_questoes`/`simulado_respostas`); nunca infere ou inventa metadados ausentes (`lib/evidence/reconcileEvidenceEvents.ts`). Isso não introduz novo dado pessoal — apenas reflete no stream o que já existia na fonte legada.
- **Direito de exclusão/portabilidade:** qualquer processo existente de exclusão de conta/dados do aluno deve, ao evoluir para tocar `evidence_attempt_events`, seguir o mesmo runbook usado para `historico_questoes` (fora do escopo de código deste lote — apontar para revisão humana se um pedido de exclusão chegar antes desse runbook existir).
- **Acesso:** leitura de `evidence_attempt_events` para métricas operacionais usa service role server-side (scripts, jobs); não expor endpoint de leitura ao client além do necessário para o próprio aluno via APIs já existentes.

## 6. Checklist de go/no-go — saída da Fase 1

Espelha [`DECISAO_EVIDENCE_ENGINE.md`](../docs/DECISAO_EVIDENCE_ENGINE.md) §27. Todos os itens devem estar marcados antes de declarar a Fase 1 concluída (ver também [`docs/EVIDENCE_FASE1_ROLLOUT_CHECKLIST.md`](../docs/EVIDENCE_FASE1_ROLLOUT_CHECKLIST.md) para o checklist operacional item-a-item):

- [ ] Um único evento canônico por `attempt_id`; reenvios idempotentes sem duplicação
- [ ] Reconciliação (`reconcile:evidence-events`) executada e dentro dos limiares da seção 2
- [ ] `context` válido em 100% dos eventos elegíveis
- [ ] `question_version` presente em 100% dos eventos
- [ ] Tempo de resposta dentro de limites plausíveis, ou marcado `response_time_status != valid` explicitamente
- [ ] Taxa de `conviction = unknown` dentro do limiar (coorte com UI habilitada) e monitorada
- [ ] Nenhuma falha de instrumentação bloqueou o player (0 ocorrências de P0 na seção 2)
- [ ] Eventos `is_internal = true` excluídos de qualquer análise populacional
- [ ] Replay determinístico validado em ambiente de teste (`replayAttemptEvents` + fixtures), sem ativação de projeção em produto
- [ ] Bloco "Status de aprovação" deste artefato preenchido com aprovador + data + baseline

## 7. Changelog deste artefato

| Data | Mudança | Autor |
|---|---|---|
| _(preencher na primeira revisão pós-baseline)_ | Criação inicial (Lote 11) — limiares propostos, pendente de aprovação | Agente (Lote 11) |
