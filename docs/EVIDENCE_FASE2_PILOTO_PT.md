# Evidence Engine — Fase 2: Piloto PT (anotação)

**Status:** foundation code apenas — nenhum dado real anotado, nenhuma ativação de produto.
**Escopo:** taxonomia (`lib/evidence/taxonomy.ts`), gate `evidence_ready` (`lib/evidence/evidenceReady.ts`), inventário fictício de planejamento (`data/evidence/pilot-pt-*.json`).

Complementa: [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) §5, §6, §10, §25 (Fase 2) · [`SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md`](SPEC_EVIDENCE_ENGINE_FASE_1_EVENT_STREAM.md).

---

## 1. O que esta fase é (e não é)

- **É:** código puro de taxonomia + gate `evidence_ready` + schema/inventário de planejamento para 3 skills piloto de Língua Portuguesa (crase, colocação pronominal, pontuação/vocativo).
- **Não é:** anotação real do catálogo, apply em Supabase, ativação de T1/CTA, ou qualquer alteração de comportamento no player/vitrine.

## 2. Regra central: NÃO anotar o catálogo inteiro

Do ADR §10: *"Questões sem `evidence_ready` permanecem no fluxo legado. Não é necessário anotar o catálogo inteiro antes do piloto."*

Este piloto cobre **apenas** 3 skills de Língua Portuguesa, com inventário mínimo (poucas questões por skill). Não expandir para outras disciplinas ou skills nesta fase — expansão é Fase 6, condicionada a uplift do RCT-1/RCT-2 (§25, §27).

## 3. `data/evidence/pilot-pt-crase-colocacao-vocativo.json`

- Todo `question_id` é um **slug fictício** (`fict-pt-*-inventario`), marcado com `is_fictional_slug: true`. Nenhum corresponde a uma linha real em `modulos_estudo`.
- `is_inventory_only: true` no topo do arquivo — nunca remover essa marca sem que o conteúdo passe a ser handcraft real revisado.
- `human_review: false` e `evidence_ready: false` em todas as entradas — **estado inicial obrigatório**. Ninguém deve editar esses campos para `true` fora do processo abaixo.
- Schema de validação: `data/evidence/pilot-pt-inventory.schema.json`.

## 4. Processo obrigatório para sair de inventário → `evidence_ready: true`

1. Substituir o slug fictício por um `question_id` real do catálogo, handcraft golden-v1 (trilho A único — [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md)).
2. Preencher `primary_skill_id`, `difficulty`, `surface_template_id`, `question_version` reais.
3. Revisar os distratores (diagnóstico de misconception) e mapear `misconception_codes` — proposta pode vir de IA offline, mas **publicação é sempre humana** (ADR §10, §24).
4. **Revisão humana explícita** confirma `human_review: true` — nunca inferir automaticamente.
5. Só então rodar `evaluateEvidenceReady()` (`lib/evidence/evidenceReady.ts`). Se `evidence_ready` resultante for `true`, a questão pode entrar no inventário de transferência da Fase 3 — **ainda assim sem ativar T1 em produto** (Fase 3 é seletor de laboratório; ver `docs/EVIDENCE_FASE3_T1.md`).
6. Qualquer mudança posterior em `primary_skill_id`, `misconception_codes`, `difficulty`, `surface_template_id` ou `question_version` invalida `evidence_ready` (`shouldInvalidateEvidenceReady()`) — a questão volta ao passo 3.

## 5. Proibições explícitas desta fase

- Não aplicar (`catalog:apply-lote` ou equivalente) qualquer conteúdo fictício deste inventário.
- Não criar `skill_id` novo sem inventário mínimo comprovado (`minimum_inventory_confirmed`) — ADR §5.
- Não usar `pedagogical_branch` ou `family` como `skill_id` (ADR §6) — usar `isSkillIdAliasOfBranchOrFamily()` como guarda em revisão de PR quando os dois catálogos existirem lado a lado.
- Não marcar `evidence_ready: true` sem revisão humana registrada.

## 6. Testes

`__tests__/lib/evidence/evidenceReady.test.ts` cobre o gate puro. `__tests__/lib/evidence/taxonomy.test.ts` cobre validação de `skill_id` e guarda anti-alias.
