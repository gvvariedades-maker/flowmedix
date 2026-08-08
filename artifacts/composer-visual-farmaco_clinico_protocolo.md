# Composer visual — farmaco_clinico_protocolo (Fábrica G2)

**Pacote:** Farmacodinâmica e Farmacocinética  
**Data:** 2026-08-08  
**Âncora:** `examples/questao-premium-idecan-omeprazol-ev-ulcera.json`  
**Preview:** `/dev/slide-mold-review?branch=farmaco_clinico_protocolo`  
**Banco:** `deck` / `rail` / `compare` (gold)  
**Proibido React novo:** boards 4/4 já ship (`ok_react`); logic já usa `LogicRailShell`

---

## 1) Banco + piso

| Campo | Valor |
|-------|--------|
| gesture_id | `deck` (estações EV) + `rail` (protocolo) + `compare` (trap) |
| Erro espacial | Diluir→infundir→monitorar vira lista; bólus/SC/antiácido parecem “iguais” |
| Refs ouro | Adolescente ética (deck/compare) · demo G2 · preview Fármaco clínico |

---

## 2) Modo V — Design visual

## Design visual — farmaco_clinico_protocolo
Gesto: `deck` — estações paralelas de infusão EV + protocolo tap ≤3
Erro espacial: ordem diluir/infundir/monitor some; via errada (bólus/SC) não pula
4/4: concept=`infusao-ev-station-deck` | golden=`farmaco-clinico-reference-board` | logic=`farmaco-protocol-tap-flow` (`LogicRailShell`) | danger=`farmaco-clinico-trap`
Primitives preferidos: `PillarDeck` · `LabelBodyRow` · `LogicRailShell` · `TwoColumnBoard` · `BoardChrome`
Inspiração → AVANT:
- Deck com massa por estação (não bullets)
- Chip+corpo na norma portátil (via/diluição/monitor)
- Trap EV aberto (bólus vs infusão)
Anti-padrões: forçar ADME rail; hardcode letra no TSX; >3 taps; spoilers CM/GR
Orçamento: protocolo — concept/golden/danger **0**; logic **≤3**
Handoff: reuso + capture gallery | React: **não**
DoD retenção: **PASS**

---

## 3) Crítica atelier (8/8)

| # | Check | |
|---|-------|---|
| 1 | Herói (estações EV / via) | PASS |
| 2 | Cards com massa | PASS |
| 3 | Cor = decisão | PASS |
| 4 | Tipografia | PASS |
| 5 | Âncora tipográfica (EV / não bólus) | PASS |
| 6 | Footer transferência | PASS |
| 7 | JSON alimenta | PASS |
| 8 | 375 legível (DoD brief) | PASS |

**Veredito: ATELIER_PASS**  
Handoff: reuso + capture → `visual_gallery.ready` · sem React novo.
