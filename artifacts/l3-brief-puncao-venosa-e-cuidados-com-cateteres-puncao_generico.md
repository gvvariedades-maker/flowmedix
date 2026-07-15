# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_generico

**Gerado:** 2026-07-14  
**Política:** `ok_generico` (24 slugs — 21,8%)  
**Família:** mista (`conceito` · `protocolo` · `certo_errado` · EXCETO)  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-gama-puncao-scalp-jelco-calibre.json`  
**Pacote atual:** `PUNCAO_GENERIC_DESIGN`

---

## 0. Papel do ramo

**Cauda longa heterogênea:** protocolos mistos, temas de punção/cateter sem cluster forte (midline, oclusão, veia preferida, legislação residual).

**Princípio:** sem metáfora visual única — pacote semântico genérico premium é o design correto.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `bridge` / `morphological` | 3+ pilares do tema |
| `golden_rule` | `reference_table` ou `content` + `rows` | Decore normativo |
| `logic_flow` | `cards` + `reveal_mode: tap` | Eliminação ou sequência |
| `danger_zone` | `compare` + `correct[]` | Pegadinhas por alternativa |

**Inferência:** fallback quando nenhum padrão de ramo forte bate (`inferPedagogicalBranch` → `puncao_generico`).

---

## 2. Padrões de conteúdo (L2)

| Padrão | Handcraft |
|--------|-----------|
| EXCETO / INCORRETA | Cada distrator = conduta correta; só gabarito = exceção |
| Protocolo misto | `golden_rule.rows` com parâmetros da guideline |
| V/F / É CORRETO | logic_flow tap; sem vazar vocabulário IPCS/CVC sem âncora |

---

## 3. Quando **não** usar este ramo

| Sinal | Ramo correto |
|-------|--------------|
| flebite, infiltração, hematoma | `puncao_flebite` |
| jelco, calibre, scalp, gauge | `puncao_dispositivo` |
| EXCETO técnica punção | `puncao_exceto` |
| troca equipos, intervalos | `puncao_tempo` |
| antissepsia, técnica periférica | `puncao_periferica_antissepsia` |
| bundle, IPCS, CVC | `puncao_ipcs_cvc` |

---

## 4. Bespoke futuro

**Não planejado** para o ramo genérico — novos clusters fortes viram ramo novo (Fase 0 cluster) antes de molde inédito.

---

## 5. DoD

- [x] Fallback `puncao_generico` em `pedagogicalBranch.ts`
- [x] 24 slugs handcraft no cluster
- [x] Genérico não conflita com guards bespoke (sem drift IPCS)

**Status:** genérico premium em produção — não promover a bespoke sem novo cluster.
