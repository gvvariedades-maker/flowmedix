# BRIEF DE VARIANTES — Orações coordenadas e subordinadas / pt_oracoes_subordinadas

**Gerado:** 2026-07-20  
**Status implementação:** pendente (brief Fase 3b — sem React neste passo)  
**Decisão L3:** molde_redesign  
**Bespoke target:** pt-period-rail  
**Família:** conceito (MCQ — classificação de orações)  
**Card vitrine:** Orações coordenadas e subordinadas  
**Template sugerido:** teal (sintaxe / C — Sintaxe)  
**Âncora:** tec 3558979 — Ápice ACE Pref. Pocinhos 2025  
**Golden:** examples/questao-premium-apice-portugues-oracoes-adversativa-pocinhos.json  
**Playbook:** lingua-portuguesa.json → pt_oracoes_subordinadas  
**Pergunta-teste Elias M07:** Que função / sentido liga as orações?

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano / órgão | ÁPICE / 2025 / Pref. Pocinhos — ACE |
| Tipo | Conceito — identificar coordenada sindética adversativa |
| Gabarito | A |
| Tec | 3558979 (metadado interno) |

**Erro reproduzível:** rotular pelo conectivo sem testar dependência (coord × subord) nem o sentido (aditiva × adversativa × conclusiva).

**Teste espacial 3/3:** matriz de tipos → molde_redesign.

---

## 1. Metáfora do pacote

> **Trilho do período:** período → orações → dependência (coord/subord) → conectivo → tipo semântico.

Layouts 4/4: pt-period-rail-deck · pt-period-rail-board · pt-period-rail-tap-flow · pt-period-trap-arena

---

## 2–5. Slides (handoff VARIANT_MOLDS)

| Slide | layout_variant | Gesto |
|-------|----------------|-------|
| concept_map | pt-period-rail-deck | Mapa coord × subord + conectivos |
| logic_flow | pt-period-rail-tap-flow | Eliminação por dependência → conectivo |
| golden_rule | pt-period-rail-board | Tabela conectivos × valor |
| danger_zone | pt-period-trap-arena | Troca aditiva/adversativa/conclusiva |

---

## Gate Fase 3b

- [x] Brief 4/4 salvo  
- [x] Âncora golden READY  
- [ ] Moldes React wired (pós-g01)
