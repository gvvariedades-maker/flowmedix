# BRIEF DE VARIANTES — Saúde do Adolescente / adolescente_generico

**Gerado:** 2026-07-13  
**Política:** `ok_generico` (6 slugs — 37,5%)  
**Família:** mista (`conceito` · `legis` · `certo_errado` · EXCETO)  
**Template:** `sky` (t08)  
**Âncoras amostra:** `ideap-…9064-2` · `cogeps-unioeste-…9064-7` · `idecan-…6701-7`  
**Pacote atual:** `ADOLESCENTE_GENERIC_DESIGN`

---

## 0. Papel do ramo

**Cauda longa heterogênea:** diretrizes MS adolescente, promoção à saúde, saúde bucal, EXCETO genérico, temas que **não** ancoram sigilo, Z-score, violência, puberdade ou saúde mental específica.

**Princípio:** sem metáfora visual única — o pacote semântico genérico premium é o design correto.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | 3+ pilares do tema (promoção, AB, políticas) |
| `golden_rule` | `reference_table` ou `content` + `rows` | Decore MS / tabela normativa |
| `logic_flow` | `vertical` + `reveal_mode: tap` | Eliminação EXCETO ou sequência normativa |
| `danger_zone` | `compare` + `correct[]` | Pegadinhas por alternativa |

**Inferência:** fallback quando nenhum padrão de ramo forte bate (`inferPedagogicalBranch` → `adolescente_generico`).

---

## 2. Padrões de conteúdo (L2)

| Padrão | Handcraft |
|--------|-----------|
| EXCETO / INCORRETA | Cada distrator = conduta correta; só gabarito = exceção |
| Diretrizes MS | `golden_rule.rows` com políticas/programas |
| Promoção / bucal | concept_map com ações preventivas |
| V/F simples | logic_flow tap; sem tear I/II/III (usar ramo ética se escuta/sigilo) |

---

## 3. Quando **não** usar este ramo

Reclassificar no handcraft se o enunciado ancora:

| Sinal | Ramo correto |
|-------|--------------|
| escuta, sigilo, gravidez | `adolescente_etica_sigilo` |
| escore Z, Caderneta IMC | `adolescente_antropometria` |
| puberdade, Tanner | `adolescente_desenvolvimento` |
| anorexia, depressão, imagem corporal | `adolescente_saude_mental` |
| violência, indicadores, rede | `adolescente_violencia_protecao` |

```bash
npm run catalog:patch-pedagogical-branch -- --lote=saude-adolescente-completo --reconcile-branch --dry-run
```

---

## 4. Bespoke futuro

**Não planejado** para o ramo genérico — por definição absorve heterogeneidade. Novos clusters fortes devem virar **ramo novo** (Fase 1b cluster) antes de molde inédito.

---

## 5. DoD

- [x] Fallback `adolescente_generico` em `pedagogicalBranch.ts`
- [x] 6 slugs handcraft no cluster
- [x] Genérico não conflita com guards bespoke

**Status:** genérico premium em produção — **não** promover a bespoke sem novo cluster.
