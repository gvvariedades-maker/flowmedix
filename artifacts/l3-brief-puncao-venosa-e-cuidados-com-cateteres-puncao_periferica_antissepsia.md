# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_periferica_antissepsia

**Gerado:** 2026-07-11  
**Política:** `molde_inedito` (~25 slugs · periférica 10 + antissepsia 8 + técnica 7)  
**Família:** `protocolo` / `conceito`  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-funpar-puncao-tecnica-periferica.json`  
**Clusters unidos:** Punção venosa periférica · Antissepsia na punção · Técnica de punção periférica  
**`sample_slugs[0]`:** `amauc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-5`

## Pacote 4/4

| Slide | `layout_variant` | Componente proposto |
|-------|------------------|---------------------|
| concept_map | `iv-puncture-rail` | `IvPunctureRailConceptMap.tsx` |
| golden_rule | `iv-antisepsis-board` | `GoldenRuleIvAntisepsisBoard.tsx` |
| logic_flow | `iv-puncture-tap-flow` | `LogicFlowIvPunctureTapFlow.tsx` |
| danger_zone | `iv-order-invert-trap` | `DangerZoneIvOrderInvertTrap.tsx` |

---

## 0. Questão âncora

**Erro reproduzível:** inverter ordem (antissepsia antes/depois), sentido proximal→distal, bisel para baixo, reuso de cateter na mesma tentativa.

**Por que bespoke:** sequência de conduta — **trilho** com ordem obrigatória; erro = passo fora de lugar.

---

## 1. Metáfora

**“Trilho da punção periférica → checklist antissepsia → passos tap → trap de ordem invertida.”**

---

## 2. Slide 1 — `concept_map` (`iv-puncture-rail`)

**Wire:**

```text
  HIGIENE → ANTISSEPSIA 70% → SECAR → SELEÇÃO VEIA → BISEL↑ → PUNCIONAR → FIXAR → IDENTIFICAR
  toque na estação → detail (sem gabarito)
```

**Slots:** higiene das mãos, álcool 70% sentido único, secar, veia proeminente/firme, bisel para cima, cateter novo, etiqueta data/hora.

---

## 3. Slide 2 — `golden_rule` (`iv-antisepsis-board`)

`rows[]`: antissepsia (70%, fricção, secar), seleção de veia, fixação, identificação. Referência COFEN/ANVISA em `sources`.

---

## 4. Slide 3 — `logic_flow` (`iv-puncture-tap-flow`)

`reveal_mode: "tap"` · validar cada passo da sequência → eliminar alternativas que invertem ordem → gabarito → *"Em similares: antissepsia seca antes da punção"*.

---

## 5. Slide 4 — `danger_zone` (`iv-order-invert-trap`)

Pegadinhas: distal→proximal na fricção; punção sem secar; mesmo cateter em nova tentativa; bisel invertido. Transferência: banca troca “proeminente” por “menos proeminente”.

---

## 6. DoD

- [x] 4× variantes · trilho com scroll snap em 375px
- [x] Sem vocabulário CVC/bundle sem âncora no enunciado
