# Evidence Engine — Fase 3: Seletor T1 (transferência imediata)

**Status:** foundation code — seletor puro + componente de UI gated (`enabled=false` por padrão). Nada ativado em produto.

Complementa: [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) §2, §4, §8, §11, §16, §25 (Fase 3) · [`EVIDENCE_FASE2_PILOTO_PT.md`](EVIDENCE_FASE2_PILOTO_PT.md).

---

## 1. Escopo desta fase

- `lib/evidence/transferSelector.ts`: seletor determinístico de candidata de transferência, com todas as exclusões obrigatórias do ADR §11/§16.
- `components/evidence/TransferCTA.tsx`: CTA "Testar em outra questão", **gated** por prop `enabled` (default `false`). Sem `enabled=true` explícito, o componente não renderiza nada.
- **Nenhum wiring** em `AvantLessonPlayer`, `MarcarEstudoConcluidoButton`, `recommendations.ts` ou rotas de API.

## 2. Fase 3 não anota em runtime (ADR §11)

O seletor **só** aceita candidatas que já passaram pelo gate `evidence_ready` da Fase 2 (`lib/evidence/evidenceReady.ts`): anotadas, revisadas por humano, versionadas, aprovadas. Nenhuma função deste módulo infere `primary_skill_id`, `difficulty`, `surface_template_id` ou `misconception_codes` — esses campos vêm prontos do inventário Fase 2.

## 3. Exclusões obrigatórias implementadas

`evaluateTransferCandidate()` aplica, para cada candidata:

| Exclusão | Motivo |
|---|---|
| `is_mother_question` | questão-mãe nunca é sua própria transferência |
| `already_seen` | aluno não pode repetir questão já vista |
| `in_measurement_pool` | isolamento do holdout (§14, §16) — inelegível em toda superfície |
| `same_surface_template` | exige molde superficial distinto (§11) |
| `incompatible_question_version` | versão da candidata deve ser a vigente esperada (§9) |
| `not_evidence_ready` | só conteúdo aprovado no gate da Fase 2 |
| `different_skill` | mesma `primary_skill_id` da questão-mãe |
| `entitlement_not_allowed` | resolução de entitlement é responsabilidade do caller |

Sem candidata elegível → `{ missing: true, evaluations }`. `mapMissingToTransferInventoryMissingEvent()` traduz esse resultado para o *shape* do evento canônico `transfer_inventory_missing` (ADR §8) — **apenas tipos**; nenhuma emissão real ocorre nesta fase (pipeline de ingestão desse `event_type` é decisão de spec operacional posterior).

## 4. Ordenação (ilustrativa, ADR §11)

1. Sobreposição com misconception detectada na tentativa da questão-mãe (desc).
2. Menor número de exposições prévias (asc).
3. Dificuldade mais próxima da questão-mãe (asc).
4. Empate final por `question_id` lexicográfico — determinístico; "aleatoriedade controlada entre as melhores" (ADR) fica para a spec operacional, não implementada aqui para preservar testes deterministas.

## 5. `TransferCTA`

- Prop `enabled` (default `false`) é o único gate. Nenhum ambiente de produção deve passar `enabled=true` fora de uma sessão explicitamente randomizada para o braço de tratamento do RCT-1 (Fase 4) ou coorte técnica de instrumentação (Fase 1, §18).
- Quando `enabled=false`, o componente retorna `null` — não há estado "visualmente desabilitado" que revele a existência do recurso a usuários fora do experimento.

## 6. Proibições explícitas desta fase

- Não importar `TransferCTA` em `AvantLessonPlayer.tsx` com `enabled` fixo em `true`.
- Não criar rota de API que chame `selectTransferCandidate()` a partir de tráfego real de produção.
- Não usar este seletor para decidir a próxima questão da Vitrine livre — isso violaria o invariante de que a Vitrine permanece livre (ADR §4.2).

## 7. Testes

`__tests__/lib/evidence/transferSelector.test.ts` cobre cada exclusão individualmente, a ordenação determinística e o caso `missing: true` → mapeamento do evento.
