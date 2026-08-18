# Composer visual — farmaco_pk_pd_vf (Fábrica G2)

**Pacote:** Farmacodinâmica e Farmacocinética  
**Data:** 2026-08-08  
**Âncora:** `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`  
**Preview:** `/dev/slide-mold-review?branch=farmaco_pk_pd_vf`  
**Banco:** `rail` (gold) · refs ouro Adolescente antropometria + demo G2  
**Proibido React novo:** boards 4/4 já ship (`ok_react`)

---

## 1) Banco + piso

| Campo | Valor |
|-------|--------|
| gesture_id | `rail` (primário) + apoio `critical_number` / `compare` |
| Erro espacial | Aluno vê ADME como cards soltos e troca meia-vida 50%↔100% |
| Refs ouro abertas | `adolescente_antropometria` (rail) · demo `neuroslides-g2-demo.html` · preview Fármaco ADME |

---

## 2) Modo V — Design visual

## Design visual — farmaco_pk_pd_vf
Gesto: `rail` — jornada ADME A→D→M→E + marco t½=50%
Erro espacial: ordem ADME some; meia-vida vira “eliminar 100%”
4/4: concept=`adme-journey-rail` | golden=`pk-pd-reference-board` | logic=`farmaco-vf-juggle-tap` (≤3 taps) | danger=`farmaco-trap` (arena aberta)
Primitives preferidos (banco): `ProtocolRailRow` · `LogicRailShell` · `BoardChrome` · `CriticalNumber` · `TwoColumnBoard`
Inspiração → AVANT:
- Rail com passo numerado legível (não cards soltos)
- Número crítico tipográfico no golden (50%)
- Trap compare ✗×✔ sem tap extra
Anti-padrões: forçar estações EV; spoiler de letra no concept/golden; >3 taps no juggle; lista pastel sem massa
Orçamento de clique (família): VF protocolo — concept/golden/danger **0**; logic **≤3**
Handoff: reuso + capture gallery | React: **não**
DoD retenção: **PASS**

---

## 3) Crítica atelier (8/8)

| # | Check | |
|---|-------|---|
| 1 | Herói único (rail ADME / 50%) | PASS |
| 2 | Cards com massa | PASS (molde ship) |
| 3 | Cor = decisão | PASS |
| 4 | Tipografia legível | PASS |
| 5 | Âncora tipográfica (50% / ADME) | PASS |
| 6 | Footer transferência | PASS (âncora golden-v1) |
| 7 | JSON alimenta tudo | PASS |
| 8 | Responsivo 375 | PASS (Playwright DoD pacote) |

**Veredito: ATELIER_PASS**  
Handoff: reuso + `capture:questao-review` → `visual_gallery.status=ready` · elevar ≤1 path ADME no banco `rail`.

---

## Crítica atelier — redesign estático 2026-08-08

**ATELIER_PASS** 4/4 (0 taps). Gallery recapturada em `funcamp-farmacodinamica-vf/`.
