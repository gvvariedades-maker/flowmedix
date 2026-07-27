# Evidence Engine — Fase 6: Expansão

**Status:** foundation code — gates booleanos puros em `lib/evidence/expansionGates.ts`. Nenhuma expansão real ocorreu; nenhum RCT foi executado ainda.

Complementa: [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) §24–§27, §29 · [`EVIDENCE_FASE5_FSRS_RCT2.md`](EVIDENCE_FASE5_FSRS_RCT2.md).

---

## 1. Princípio

> "Expansão de anotação / calibração / modelos posteriores — Só com evidência positiva em 4 e 5." (ADR §25, Fase 6)

Nenhuma expansão é automática. `lib/evidence/expansionGates.ts` só calcula booleanos a partir de resultados experimentais fornecidos pelo caller (nunca infere resultado de experimento sozinho) — a decisão de agir sobre o gate `true` continua humana.

## 2. Gates implementados

| Função | Depende de | Uso pretendido |
|---|---|---|
| `canExpandSkills` | uplift RCT-1 + amostra + contaminação sob controle | Anotar mais skills/disciplinas além do piloto PT |
| `canEnableCalibration` | uplift RCT-1 + inventário de transferência suficiente | Calibração de convicção (Brier etc.) |
| `canEnableFsrsAsDefaultScheduler` | uplift RCT-1 **e** uplift RCT-2 | Promover FSRS a agendador padrão (nunca a partir só do RCT-1 — ADR §12) |
| `canEnableBandit` | uplift RCT-1 **e** RCT-2 + contaminação sob controle | Contextual bandit / RL — "eventual", nunca antes de ambos os RCTs |
| `canEnableLlmRuntimeSelection` | — (hard-coded `false`) | LLM decidindo próxima questão em runtime — **proibido incondicionalmente na V1** (§9, §24) |
| `isOfflineAnnotationWithHumanReviewAllowed` | — (hard-coded `true`) | Documenta que anotação assistida por IA offline é sempre permitida, mas publicação automática nunca é |

## 3. Mais skills / disciplinas

Expansão segue a mesma regra de inventário mínimo da Fase 2 (ADR §5) — `lib/evidence/taxonomy.ts` `minimum_inventory_confirmed` continua exigido por skill, mesmo depois do gate `canExpandSkills` autorizar a fase como um todo.

## 4. Calibração e personalização

Fora de escopo desta fundação: pesos Bayesianos finos, calibração metacognitiva individual (rótulo "SUPERCONFIANTE" só após N mínimo populacional — decisão adiada, ADR §29). `canEnableCalibration()` só sinaliza que o pré-requisito experimental mínimo foi satisfeito.

## 5. Bandit — eventual, nunca antes dos dois RCTs

Contextual bandit / RL educacional está explicitamente fora da V1 (ADR §24). `canEnableBandit()` exige uplift confirmado em **ambos** RCT-1 e RCT-2 — não é uma feature "de roadmap automático"; qualquer implementação real exige nova decisão arquitetural própria (fora deste ADR, ADR §29 "decisões adiadas").

## 6. IA — apenas anotação offline, nunca seleção em runtime

- Permitido: IA propor `misconception_code`, diagnósticos de distrator, ou candidatos de anotação em lote — sempre revisados por humano antes de qualquer publicação (ADR §10, §24).
- Proibido incondicionalmente: LLM escolhendo a próxima questão do aluno em runtime (`canEnableLlmRuntimeSelection()` sempre `false`, sem parâmetros — não há cenário nesta V1 que o torne `true`).

## 7. Proibições explícitas desta fase

- Não remover o hard-code `false` de `canEnableLlmRuntimeSelection()`.
- Não expandir para novas disciplinas sem os gates de RCT-1 satisfeitos.
- Não promover FSRS a padrão sem `rct2UpliftConfirmed === true`.

## 8. Testes

`__tests__/lib/evidence/expansionGates.test.ts` — cada gate com combinações de input positivas/negativas; `canEnableLlmRuntimeSelection` sempre `false`.
