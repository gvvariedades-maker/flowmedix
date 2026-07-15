# BRIEF DE VARIANTES — Vias de Administração / via_generico

**Gerado:** 2026-07-14  
**Política:** `ok_generico` (24 slugs — 11,5%)  
**Família:** mista (`certo_errado` · EXCETO/INCORRETA · `conceito`)  
**Template:** `emerald` (t02)  
**Âncoras:** `questao-premium-cetrede-vias-injetaveis-incorreta.json` · `questao-premium-avancasp-vias-sublingual-exceto.json`  
**Pacote atual:** `VIA_GENERIC_MOLD` (morphological · center · vertical · compare)

---

## 0. Papel do ramo

**Cauda longa:** EXCETO/INCORRETA sobre vias, perfis sem cluster claro, certo/errado isolado, temas que não ancoram absorção nem técnica de punção.

**Princípio:** sem metáfora visual única — pacote semântico genérico premium é o design correto (paridade `adolescente_generico`).

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | Enquadramento do tema da questão |
| `golden_rule` | `center` ou `reference_table` | Decore / lista de vias |
| `logic_flow` | `vertical` + `reveal_mode: tap` | Eliminação EXCETO ou julgamento |
| `danger_zone` | `compare` + `correct[]` | Cada distrator com justificativa única |

**Inferência:** fallback `inferViaBranch` → `via_generico` quando não há âncora absorção/técnica.

---

## 2. Padrões de conteúdo (L2)

| Padrão | Handcraft |
|--------|-----------|
| EXCETO / INCORRETA | Cada distrator = conduta correta; só gabarito = exceção |
| Certo ou errado | logic_flow tap; danger_zone semântico |
| Perfis mistos | concept_map 3+ itens sem trilho de velocidade |
| Gate `vias_exceto_semantic` | compare com `correct` por letra |

---

## 3. Quando **não** usar este ramo

| Sinal | Ramo correto |
|-------|--------------|
| absorção, biodisponibilidade, trilho | `via_vf_absorcao` |
| punção, ângulo, volume, sítio IM | `via_tecnica_admin` |

---

## 4. Gate nota-10

- ≥1 slug real: **24** (`via_generico`)
- visual-anchors.json: `cetrede-enfermagem-vias-de-administracao-1776056391403-4`
- Playwright: bloco `Vias via_generico` PASS
