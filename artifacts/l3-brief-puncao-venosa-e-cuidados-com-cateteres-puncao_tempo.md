# BRIEF DE VARIANTES — Punção Venosa e Cuidados com Cateteres / puncao_tempo

**Gerado:** 2026-07-11  
**Política:** `molde_inedito` (11 slugs · 10%)  
**Família:** `protocolo` (intervalos / troca / observação)  
**Template:** `indigo` (t01)  
**Âncora:** `examples/questao-premium-cpcon-puncao-troca-equipos-intervalos.json`  
**Cluster:** Tempo / observação pós-procedimento · `sample_slugs[0]`: `cpcon-uepb-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-3`

## Pacote 4/4

| Slide | `layout_variant` | Componente proposto |
|-------|------------------|---------------------|
| concept_map | `iv-interval-timeline` | `IvIntervalTimelineConceptMap.tsx` |
| golden_rule | `iv-interval-board` | `GoldenRuleIvIntervalBoard.tsx` |
| logic_flow | `iv-interval-tap-flow` | `LogicFlowIvIntervalTapFlow.tsx` |
| danger_zone | `iv-interval-swap-trap` | `DangerZoneIvIntervalSwapTrap.tsx` |

---

## 0. Questão âncora

**Erro reproduzível:** inverter prazos (equipo 24h × curativo 72h × permanência do cateter) ou confundir “observação pós” com “troca obrigatória”.

**Por que bespoke:** erro **sequencial temporal** — timeline fixa ordem e magnitude dos intervalos.

**Risk scoring:** números normativos → tier **alto** → `meta.efficacy_contract.a4_reviewer` humano antes de apply.

---

## 1. Metáfora

**“Linha do tempo de troca → board de intervalos → decisão por prazo → trap de prazo invertido.”**

---

## 2. Slide 1 — `concept_map` (`iv-interval-timeline`)

**Wire:**

```text
  0h ──●── 24h ──●── 72h ──●── 96h+
       │        │         │
    punção   equipo    curativo   cateter*
  (*conforme fonte da questão — não inventar)
```

**Interação:** toque no marco revela `detail` do evento (troca, observação, sinais).

---

## 3. Slide 2 — `golden_rule` (`iv-interval-board`)

`rows[]` com prazos oficiais + `meta.sources[].covers` para cada número. Mnemônico curto em `content`.

---

## 4. Slide 3 — `logic_flow` (`iv-interval-tap-flow`)

Identificar o que a banca pergunta (equipo? curativo? permanência?) → localizar marco na timeline → eliminar prazos trocados → gabarito → fixação portátil.

---

## 5. Slide 4 — `danger_zone` (`iv-interval-swap-trap`)

Pegadinhas: 24h↔72h; cateter “nunca trocar”; observação confundida com troca. Transferência: outra banca usa horas vs dias.

---

## 6. DoD

- [x] 4× variantes · fontes em `meta.sources` · risk alto documentado
- [x] Números só com `covers` tier A/B
