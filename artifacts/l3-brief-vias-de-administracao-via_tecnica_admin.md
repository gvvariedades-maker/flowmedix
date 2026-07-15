# BRIEF DE VARIANTES — Vias de Administração / via_tecnica_admin

**Gerado:** 2026-07-14  
**Política:** `ok_generico` (85 slugs — 41%)  
**Família:** mista (`vf` · `conceito` · `protocolo`)  
**Template:** `emerald` (t02)  
**Âncora:** `examples/questao-premium-cpcon-vias-im-vf.json`  
**Pacote atual:** `VIA_TECNICA_MOLD` (morphological · banner · cards · compare)

---

## 0. Papel do ramo

**Técnica de punção e sítio anatômico:** ângulo IM 90°, volume por sítio (deltoide 2 mL, glútea 5 mL), marcos ósseos, ventroglúteo/vasto lateral, complicações locais.

**Erro reproduzível:** confundir sítio × volume × ângulo; aceitar ventroglúteo como inseguro; inverter técnica SC (45°/90°) com IM.

**Decisão L3:** genérico premium — o erro é **normativo-tabular** (decore COFEN/Potter), não espacial como o trilho de absorção. Bespoke só se `audit:subtopico-quality` reportar drift visual recorrente.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | Sítio + técnica + complicação (3 pilares) |
| `golden_rule` | `reference_table` + `rows` | Volumes, ângulos, agulhas (sem gabarito) |
| `logic_flow` | `cards` + `reveal_mode: tap` | Eliminação V/F técnica ou sequência de punção |
| `danger_zone` | `compare` + `correct[]` | Pegadinha volume/ângulo × conduta correta |

**Inferência:** `inferViaBranch` quando corpus ancora punção IM/IV/SC, sítio, volume, ângulo.

---

## 2. Padrões de conteúdo (L2)

| Padrão | Handcraft |
|--------|-----------|
| V/F técnica IM | logic_flow tap; golden_rule com rows volume/ângulo |
| Sítio seguro | concept_map com ventroglúteo/vasto lateral |
| Pegadinha ventroglúteo | danger_zone item falso com `correct` normativo |
| Volume numérico | numeric-factcheck L2b + whitelist A4 |

---

## 3. Quando **não** usar este ramo

| Sinal no enunciado | Ramo correto |
|--------------------|--------------|
| absorção, trilho IV>IM>SC, 1ª passagem | `via_vf_absorcao` |
| EXCETO/INCORRETA sem técnica | `via_generico` |
| indicação de via por velocidade | `via_vf_absorcao` |

---

## 4. Gate nota-10

- ≥1 slug real no manifest: **85** (`via_tecnica_admin`)
- visual-anchors.json: `cpcon-uepb-enfermagem-vias-de-administracao-1776056366158-7`
- Playwright: bloco `Vias via_tecnica_admin` PASS em `e2e/visual-mold-regression.spec.ts`
