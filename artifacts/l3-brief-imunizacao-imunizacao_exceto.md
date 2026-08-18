# Brief L3 — Imunização · `imunizacao_exceto` (Onda 3)

**Pacote:** Imunização  
**Ramo:** `imunizacao_exceto`  
**Decisão:** `molde_redesign` (portar gesto EXCETO glanceable da ética Adolescente com skin lime/PNI)  
**Metáfora 4/4:** **isolar a conduta que foge do PNI** — manter × exceção, 0 taps.

---

## Erro espacial (prova)

A banca marca **EXCETO / INCORRETA**: 3–4 letras seguem calendário/manual MS; **uma** foge (dose/idade/intervalo/definição estreita). O aluno precisa **ver** a exceção isolada — não serializar em 5 taps.

## Pacote de moldes

| Slide | `layout_variant` | Modo |
|-------|------------------|------|
| concept_map | `morphological` | glanceable (genérico premium) |
| golden_rule | `reference_table` | glanceable |
| logic_flow | `pni-exceto-isolate-board` | **0 taps** — TwoColumnBoard keep × exception |
| danger_zone | `pni-exceto-compare` | glanceable — PolarityPanel por letra |

**Primitives:** `BoardChrome` · `AlertCallout` · `TwoColumnBoard` · `PolarityPanel` · tone `lime` (PNI).

## Orçamento de clique

Pacote EXCETO ≤ **1 tap** no total (boards abertos). `steps[]` no JSON permanece; o board **ignora serialização**.

## Calendário (mesmo pacote Imunização)

`imunizacao_calendario` / `pni-calendar-board`: polish Onda 3 — rows via `LabelBodyRow` + `CategoryStrip` (mês/badge); sem carrossel de feed.

## Anti-cópia

- Sem assets 3D / watermark / carrossel N/M.
- Skin editorial light + template lime — não pastel Instagram.
- JSON alimenta gabarito/letra — zero hardcode no TSX.

## Wiring

- `IMUNIZACAO_EXCETO_MOLD` em `pedagogicalBranch.ts`
- Registry + `logicFlowLayout` / `dangerZoneLayout` + affinity `PNI_EXCETO_VARIANTS`
- Gate: `pedagogicalBranch === imunizacao_exceto`

## DoD

- [x] Gesto único: isolar foge-do-PNI
- [x] Variants compõem primitives
- [x] Jest mold / pedagogicalBranch
- [ ] Playwright flagship (opcional — regressão PNI existente cobre calendário)
