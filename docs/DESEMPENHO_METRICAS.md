# Contrato de métricas — Meu Desempenho

Glossário canônico do hub `/desempenho`. Toda métrica exibida ao aluno tem aqui: definição, fonte, unidade, fórmula, período, timezone, amostra mínima, estado sem dado e limitações.

Redesign e regras de produto: [`PROMPT_DESEMPENHO_TEC_ADAPTADO.md`](PROMPT_DESEMPENHO_TEC_ADAPTADO.md).

## 1. Convenções globais

| Item | Contrato |
|------|----------|
| Timezone | `America/Sao_Paulo` (UTC−3 fixo, sem DST) — helper `toFreemiumTimezoneYmd` em [`lib/freemium/constants.ts`](../lib/freemium/constants.ts) |
| Período | intervalo **semiaberto** `[start, endExclusive)` — [`lib/desempenho/periodo.ts`](../lib/desempenho/periodo.ts) |
| `endExclusive` | 00:00 do dia civil **seguinte** a hoje (evento futuro fica fora) |
| `7d` | hoje + 6 datas civis anteriores = **7 datas**, nunca 8 |
| `30d` / `90d` | hoje + 29 / 89 datas civis anteriores |
| `12m` | mesmo dia civil 12 meses atrás (inclusive) até hoje; clamp de fim de mês |
| `all` | sem limite inferior; limite superior continua sendo hoje |
| Unidade de "respondidas" | **questão distinta** (`historico_questoes` tem 1 linha por questão) |
| Erro de leitura | estado `error` (`loadState`), nunca KPI `0` |

### Níveis de confiança

[`lib/desempenho/confidence.ts`](../lib/desempenho/confidence.ts) — função pura, testada nas fronteiras.

| Amostra | `confidenceId` | Rótulo | Tom conclusivo | Ranqueia | Diagnostica |
|---------|----------------|--------|----------------|----------|-------------|
| 0 | `sem_dados` | Sem dados | não | não | não |
| 1–2 | `dados_iniciais` | Dados iniciais | não | não | não |
| 3–4 | `tendencia_inicial` | Tendência inicial | não | não | não |
| 5–9 | `evidencia_moderada` | Evidência moderada | sim | sim | sim |
| 10+ | `diagnostico_confiavel` | Diagnóstico mais confiável | sim | sim | sim |

Constantes: `DESEMPENHO_MIN_SAMPLE = 5` (mínimo para %/rank), `DESEMPENHO_COACH_UNLOCK = 10` (libera o mapa e o nível alto).

## 2. Aba Estudo

Fonte: `historico_questoes` (via `getHistoricoCompleto`) × catálogo liberado (`getModulosEstudoForUserCached`), agregado por `titulo_aula` em [`lib/desempenho/studyPerformance.ts`](../lib/desempenho/studyPerformance.ts).

| Métrica exibida | Definição | Unidade | Fórmula | Amostra mínima | Sem dado |
|-----------------|-----------|---------|---------|----------------|----------|
| Respondidas | questões distintas com alternativa marcada no período | questão | `count(historico onde respondida ≠ false)` | — | `0` |
| Acertos / Erros | idem, particionado por `acertou` | questão | `count` | — | `0` |
| % acerto | taxa sobre questões distintas | % | `acertos / respondidas` | **5** | `—` (mostra fração) |
| % com fração | leitura obrigatória | texto | `71% · 30/42` | 5 para o `%` | `2/4` |
| Cobertura | fração do material liberado já praticada | % | `respondidas / total_disponivel` | — | `0%` |
| Meta do dia | questões distintas praticadas **hoje** | questão | `count(dia civil de Brasília == hoje)` | — | `0/10` |
| Última prática | `max(created_at)` do assunto | data | — | — | `—` |
| Erros sem reverso | erros cujo estudo reverso não foi concluído | evento | `count(!acertou && estudo_reverso_concluido ≠ true)` | — | `0` |

Notas:

- `respondida = false` é placeholder de "marcar como estudado" sem alternativa: **fora** de %, placar e recentes; permanece no catálogo. Depende da migration `20260811120000_historico_questoes_respondida.sql`.
- o filtro de período recorta **atividade** (última prática), não recalcula o total disponível do catálogo;
- `totalDisponivel` respeita os filtros de disciplina/banca/área aplicados ao catálogo.

### Prioridade de estudo (`nextPractice`)

Ordenação determinística, sem score opaco. Tiers, nesta ordem, dedup por assunto, máximo 5:

1. **`wrong_unreviewed`** — erros sem estudo reverso concluído, por quantidade de erros (desc). Não exige amostra mínima: é evento concreto, não estatística.
2. **`weak_accuracy`** — `% < 70` com amostra ≥ 5; desempate por maior amostra.
3. **`low_coverage`** — cobertura `< 40%` com `totalDisponivel ≥ 3`; desempate por maior material disponível.

Desempates finais em todos os tiers: prática mais antiga, depois ordem alfabética estável.

Não existe critério de "importância em prova" / "alta incidência": não há fonte auditável de frequência por banca.

### Evolução do desempenho (série diária)

Fonte: `evidence_attempt_events` (`context = regular_practice`, `event_type = attempt`) em [`lib/desempenho/attemptSeries.ts`](../lib/desempenho/attemptSeries.ts).

| Métrica | Definição | Fórmula | Sem dado |
|---------|-----------|---------|----------|
| Acerto por dia | acerto das tentativas do dia civil de Brasília | `acertos_dia / tentativas_dia` | dia sem tentativa = `null` (não plota) |
| Tempo médio | só eventos com `response_time_status = valid` | `soma(response_time_ms) / count(valid)` | `—` |
| Acerto na primeira tentativa do período | acerto na **primeira** tentativa de cada questão **dentro do recorte** | `first_correct / questões distintas` | `—` |
| Tentativas / questão | densidade de repetição | `total_eventos / questões distintas` | `—` |

Limites e estados:

- teto de leitura = `SCALE_LIMITS.HISTORICO_ANALYTICS_READ` (5.000);
- a leitura ordena **do mais recente para o mais antigo** e reordena em memória — ordenar ascendente antes do `limit` descartaria os eventos recentes;
- ao bater o teto, `truncated = true` e a UI avisa "série parcial"; **nenhum limite é silencioso**;
- flag `EE_V1_INSTRUMENTATION` off → `available: false` (`flag_off`), sem query, e a dobra não aparece;
- falha de leitura → `unavailableReason: 'error'`, nunca zeros.

**Limitação conhecida:** "Acerto na primeira tentativa" é a primeira tentativa **no recorte selecionado**, não vitalícia. Trocar o rótulo se o cálculo passar a ser vitalício.

## 3. Aba Simulados

Fonte: sessões de simulado + `simulado_analytics_daily` + `simulado_analytics_session_dims`, em [`lib/simulado/analyticsSummary.ts`](../lib/simulado/analyticsSummary.ts), servidas por `GET /api/simulado/analytics`.

| Métrica exibida | Definição | Unidade | Fórmula |
|-----------------|-----------|---------|---------|
| Simulados concluídos | sessões concluídas no período | sessão | `count(sessions)` |
| Média de acerto | taxa **ponderada por questão** | % | `soma(acertos) / soma(questões)` |
| Questões respondidas | questões do período | questão | `soma(total_questoes)` |
| Tempo médio por questão | tempo total ÷ questões | ms/questão | `soma(tempo) / soma(questões)` |
| Últimos 12 meses | recorte de 12 meses, **não** histórico total | — | período `12m` |

Decisões:

- o KPI principal é **por questão**, não a média das médias de sessão: duas sessões de tamanhos muito diferentes não podem pesar igual (teste obrigatório);
- `0%` é resultado real e recebe tom neutro/negativo — nunca destaque positivo;
- tendência exige **≥ 4 pontos**; abaixo disso o rótulo é "Tendência ainda indisponível", nunca "Estável";
- prioridades por tópico/subtópico usam os mesmos limiares de amostra da aba Estudo;
- filtros exibidos são enviados ponta a ponta; filtro não implementado não aparece na superfície nem na URL.

**Limitação conhecida:** "Últimos 12 meses" não é histórico vitalício. Só renomear para "Geral" se houver agregação completa e escalável.

## 4. Aba Atividade

Fonte: `historico_questoes` com `estudo_reverso_concluido = true`.

| Métrica | Definição | Unidade | Timezone |
|---------|-----------|---------|----------|
| Sequência (streak) | dias civis consecutivos com ao menos 1 questão | dia | Brasília |
| Meta do dia | questões distintas hoje | questão | Brasília |
| Atividade de 30 dias | contagem por dia civil | questão/dia | Brasília |
| No histórico | total all-time com reverso concluído | questão | — |

Notas: a contagem deduplica por `modulo_slug` por dia; o heatmap é informativo (não é botão) e não força overflow do documento no mobile.

## 5. Reset

| Item | Contrato |
|------|----------|
| Nome | Zerar desempenho de estudo |
| CTA de confirmação | `Zerar desempenho de estudo` — ação destrutiva autoexplicativa, nunca "Sim" genérico |
| Endpoint | `POST /api/zerar-desempenho` |
| Apaga | apenas `historico_questoes` do usuário (RLS `auth.uid() = user_id`) |
| Preserva | simulados e `evidence_attempt_events` |
| Retorno | `{ success, scope: 'estudo', cleared: ['historico_questoes'], preserved: [...] }` |
| Invalidação | tags `historico` e `user-{id}` |

A copy do diálogo declara exatamente esse escopo. Ampliar o DELETE para Simulados/Evidence Engine é proibido.

## 6. Limitações e dependências operacionais

| Item | Situação |
|------|----------|
| Migration `20260811120000_historico_questoes_respondida.sql` | dependência do contrato `respondida`; aplicação em produção é **zona vermelha** (humano) |
| Incidência por banca/prova | não existe fonte auditável — nenhuma métrica afirma frequência de prova |
| Comparação com comunidade | fora de escopo por decisão de produto |
| Visão "Tudo" | limitada pelo teto de leitura do histórico/ledger; quando truncada, a UI avisa |
