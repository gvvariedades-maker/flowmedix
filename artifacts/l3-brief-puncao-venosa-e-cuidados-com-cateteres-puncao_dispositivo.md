# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_dispositivo

**Gerado:** 2026-07-11  
**Política:** `molde_inedito` (12 slugs · 10.9%)  
**Família:** `conceito`  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-gama-puncao-scalp-jelco-calibre.json`  
**Cluster:** Dispositivo / calibre / jelco · `sample_slugs[0]`: `avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-3`

## Pacote 4/4

| Slide | `layout_variant` | Componente proposto |
|-------|------------------|---------------------|
| concept_map | `iv-gauge-matrix` | `IvGaugeMatrixConceptMap.tsx` |
| golden_rule | `iv-device-reference-board` | `GoldenRuleIvDeviceReferenceBoard.tsx` |
| logic_flow | `iv-device-tap-flow` | `LogicFlowIvDeviceTapFlow.tsx` |
| danger_zone | `iv-gauge-mismatch-trap` | `DangerZoneIvGaugeMismatchTrap.tsx` |

---

## 0. Questão âncora

**Erro reproduzível:** confundir calibre do jelco/scalp com indicação (volume rápido × paciente frágil × curta duração).

**Por que bespoke:** matriz 2D calibre × indicação; erro espacial de “slot errado” na grade.

---

## 1. Metáfora

**“Matriz calibre × uso → board de referência → escolha do dispositivo → trap de calibre invertido.”**

---

## 2. Slide 1 — `concept_map` (`iv-gauge-matrix`)

**Wire:**

```text
        CALIBRE (G)
   14  16  18  20  22  24
  ┌───┬───┬───┬───┬───┬───┐
S │   │   │ ● │ ● │   │   │  volume
C │   │   │   │ ● │ ● │ ● │  geral
P │ ● │   │   │   │   │   │  pediátrico
  └───┴───┴───┴───┴───┴───┘
  toque na célula → detail da indicação
```

**Slots:** dispositivo (jelco/scalp/CVC periférico), calibre, indicação, pegadinha calibre grosso em idoso frágil.

---

## 3. Slide 2 — `golden_rule` (`iv-device-reference-board`)

**Rows típicos:**

| label | value |
|-------|-------|
| 14–16G | trauma, volume rápido |
| 18–20G | adulto, hemotransfusão |
| 22–24G | frágil, pediátrico, idoso |
| Scalp | curta duração, dose única |

---

## 4. Slide 3 — `logic_flow` (`iv-device-tap-flow`)

`reveal_mode: "tap"` · passos: identificar paciente/fluxo → cruzar matriz → eliminar calibre errado → gabarito → fixação (*"Em similares: calibre maior = fluxo maior; frágil = calibre menor"*).

---

## 5. Slide 4 — `danger_zone` (`iv-gauge-mismatch-trap`)

Pegadinhas: calibre grosso em veia frágil; scalp para infusão contínua; confundir número G (inversão). Transferência: banca troca “maior calibre” por “menor calibre”.

---

## 6. DoD

- [x] 4× variantes wired · 375px · sem hardcode · `puncao_dispositivo` no mapa
