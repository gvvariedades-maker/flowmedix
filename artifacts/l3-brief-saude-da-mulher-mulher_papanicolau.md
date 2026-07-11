# BRIEF DE VARIANTES — Saúde da Mulher / mulher_papanicolau

**Gerado:** 2026-07-08  
**Política:** `molde_inedito`  
**Família:** `conceito` (95% MCQ idade × periodicidade)  
**Template:** `pink` (t14)  
**Volume:** 37 slugs · 14,1% do subtópico

**Âncora:** `data/catalog-migration/saude-da-mulher-completo/questions/vunesp-enfermagem-saude-da-mulher-1777104295283-1.json`

| Campo | Valor |
|-------|-------|
| Banca / ano | VUNESP 2025 |
| Tipo | MCQ — rastreio câncer de colo (INCA/MS) |
| Gabarito | C — Papanicolau 25–64 anos, a cada 3 anos |

**Erro reproduzível:** aluno marca **40 anos** (A), **só com sintomas** (B), **anual para todas** (D) — confunde **faixa etária** e **periodicidade trienal**.

**Por que bespoke:**

1. Erro **espacial** — posicionar idade **25 vs 40 vs 64** e intervalo **1 vs 3 anos** no mesmo espectro.
2. **37 slugs** — terceiro ramo forte.
3. Mesmo padrão de prova que imunização/calendário — merece `spectrum` + `board`, não tabela plana.

---

## 1. Metáfora do pacote

**“Espectro etário 25–64 → painel Papanicolau/HPV → tap-flow eliminação → arena idade errada.”**

Universo visual: régua horizontal de idade com zonas coloridas (início · rastreio · término).

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `mulher-screening-spectrum`
- **Metáfora:** spectrum de faixas etárias; cartão expandível por zona.
- **Componente proposto:** `MulherScreeningSpectrumConceptMap.tsx`

**Wire:**

```text
 18   25═══════50═══════64
      ↑ início    ↑ trienal
      HPV 9–14 (campanha)
```

**Slots:** `Início rastreio` · `Periodicidade` · `HPV vacina` · `Sintomáticos` · `INCA 2025`

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `mulher-papanicolau-board`
- **Metáfora:** board com régua fixa + rows de conduta.
- **Componente proposto:** `GoldenRuleMulherPapanicolauBoard.tsx`

**Rows:**

| label | value | badge |
|-------|-------|-------|
| Início | 25 anos após início vida sexual | hot |
| Periodicidade | 3 anos se normais anteriores | hot |
| Término | Até 64 anos | info |
| Pegadinha 40 anos | Não é marco de início | warn |
| Pegadinha anual | Não rotina universal | warn |

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `mulher-screening-tap-flow`
- **`reveal_mode`:** `tap`
- **Metáfora:** eliminar letras por idade/intervalo inválido.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `mulher-screening-trap-arena`
- **`bullet_style`:** `x_icon`
- **Metáfora:** distrator posicionado na régua errada × posição correta 25–64/3a.

**Pegadinhas:** 40 anos · anual universal · só sintomática · antes de 25 sem critério.

---

## 6. DoD §9

- [ ] Metáfora única 4/4 (régua etária)
- [ ] 4× `layout_variant` nomeados
- [ ] 375px; toque ≥44px
- [ ] 0 hardcode; par spectrum ↔ trap arena
- [ ] Não vazar tema mama no mesmo componente (ramo separado `mulher_mama`)

**Golden sugerido:** `examples/questao-premium-vunesp-saude-mulher-papanicolau.json`
