# Evidence Engine — Fase 4: RCT-1 (pacote completo)

**Status:** foundation code — randomização determinística, estados de skill e métrica de uplift em `lib/evidence/`. Nenhum experimento real está rodando; nenhuma flag global liga T1/convicção para a base.

Complementa: [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) §12–§13, §18–§23, §25 (Fase 4), §27 · [`EVIDENCE_FASE3_T1.md`](EVIDENCE_FASE3_T1.md).

---

## 1. Pergunta científica (ADR §2)

> Convicção + transferência T1 + Evidence Engine V1 aumentam o acerto em questões inéditas após 14 dias quando comparados ao AVANT atual?

RCT-1 mede o **pacote completo** (convicção + T1 + seletor EE), não componentes isolados (§18).

## 2. Braços (§18)

| Braço | Experiência |
|---|---|
| `control` | Vitrine livre; `recommendations.ts` legado; sem convicção; sem T1; sem seletor EE |
| `treatment` | Mesma Vitrine livre; convicção; T1; seletor EE **somente** em sessões adaptativas elegíveis |

Ambos os braços compartilham a mesma infraestrutura silenciosa de `measurement_pool` e atribuição de janela — isso **não** conta como tratamento (§18).

## 3. Randomização (`lib/evidence/rct1.ts`)

Três identificadores distintos, ordem causal braço → janela → holdout (§19):

1. `arm_assignment_id = hash(user_id + experiment_id)` → `assignRct1Arm()`. Por usuário; nunca inclui `skill_id`.
2. `measurement_window_assignment_id = hash(user_id + skill_id + experiment_id)` → `assignMeasurementWindow()`. Prioriza `d14` (`DEFAULT_MEASUREMENT_WINDOW_WEIGHTS`); usar `onlyPrimaryD14: true` quando a amostra não sustentar coortes separadas (§14).
3. `holdout_assignment_id = hash(measurement_window_assignment_id + measurement_window + holdout_version)` → `computeHoldoutAssignmentId()`.

Todas as funções são determinísticas: o mesmo input sempre produz o mesmo hash/bucket — pré-requisito para reprodutibilidade e auditoria (§15).

## 4. Isolamento do `measurement_pool` (§14, §16)

`isQuestionInMeasurementPool()` / `filterOutMeasurementPool()` implementam a exclusão comum aos dois braços na vitrine livre, `recommendations.ts` legado e simulado não-medição:

```text
excluídas_vitrine_recomendacoes = measurement_pool
```

Esse filtro **não** é o seletor T1 completo (que também exclui já-vistas e mesmo `surface_template_id` — ver `lib/evidence/transferSelector.ts`, Fase 3).

## 5. Métrica primária (§20, §22)

`computeUplift14d()` calcula:

```text
Uplift_14d = Acerto(tratamento, primary_d14) − Acerto(controle, primary_d14)
```

A resolução de "quais tentativas pertencem à coorte `primary_d14`" (via `measurement_window_assignment_id` + `t0`) é responsabilidade do caller/spec operacional — este módulo só agrega contagens já filtradas.

## 6. Estados de skill (`lib/evidence/learnerSkillState.ts`)

5 estados (`desconhecido`, `adquirido`, `em_consolidacao`, `dominado`, `em_risco`) com transições puras (`transitionLearnerSkillState()`), mapeando a tabela do ADR §12. Invariantes garantidos:

- `concluiu_neuroslides` e `medicao_holdout` **nunca** alteram o estado (§13, §15, §18).
- `violatesSingleT1MasteryInvariant()` detecta se uma sequência de eventos indevidamente atribui `dominado` a partir de uma única transferência T1 correta sem outra evidência (§12: "T1 sozinho nunca basta").

## 7. Go/no-go (§27, resumo)

- Uplift em `primary_d14` conforme plano pré-registrado (N mínimo + regra de decisão — fora deste ADR).
- Contaminação do holdout sob controle operacional.
- Inventário de T1 suficiente (limiar de `transfer_inventory_missing` — plano do RCT-1).
- Sem uplift → **não** escalar para FSRS/bandit (Fase 5/6 permanecem bloqueadas).

## 8. Proibições explícitas desta fase

- Não persistir `arm_assignment_id` real de usuários de produção a partir deste código sem a spec operacional + revisão humana (zona vermelha de engenharia: sessão/cache/experimentação).
- Não usar `skill_id` no cálculo de `arm_assignment_id`.
- Não promover FSRS/bandit sem uplift confirmado (ver `lib/evidence/expansionGates.ts`, Fase 6).

## 9. Testes

`__tests__/lib/evidence/rct1.test.ts` — determinismo de `assignRct1Arm` / `assignMeasurementWindow` / `computeHoldoutAssignmentId`, filtro de measurement_pool, cálculo de uplift.
`__tests__/lib/evidence/learnerSkillState.test.ts` — transições e invariante "T1 sozinho nunca basta".
