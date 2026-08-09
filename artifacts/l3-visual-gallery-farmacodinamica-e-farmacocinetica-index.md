# L3 visual gallery — Farmacodinâmica e Farmacocinética

Índice Fábrica G2 · atualizado 2026-08-08 · playbook `farmacodinamica-e-farmacocinetica.json`

| ramo | status | captures | atelier 4/4 |
|------|--------|----------|-------------|
| `farmaco_pk_pd_vf` | ready | `artifacts/questao-review/funcamp-farmacodinamica-vf` | **ATELIER_PASS** (redesign estático 0-tap) |
| `farmaco_clinico_protocolo` | ready | `artifacts/questao-review/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6` | ATELIER_PASS (Fábrica G2) |
| `farmaco_generico` | ready | `artifacts/questao-review/instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-2` | ok_generico |

## `farmaco_pk_pd_vf` — revisão 2026-08-08

Preview: http://localhost:3000/dev/slide-mold-review?branch=farmaco_pk_pd_vf  
Âncora: `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`

| slide | molde | veredicto | gesto |
|------:|-------|-----------|-------|
| 1 concept_map | `adme-journey-rail` | PASS | blocos 1–4 + chips ADME + faixa coral (0 tap) |
| 2 logic_flow | `farmaco-vf-juggle-tap` | PASS | funil V/F EBSERH (I/II/III → letra) (0 tap) |
| 3 golden_rule | `pk-pd-reference-board` | PASS | seções PK×PD + ADME + meia-vida 50% (0 tap) |
| 4 danger_zone | `farmaco-trap` | PASS | vedação ✗/✓ aberta + transferência (0 tap) |

`visual_bar: pass` · recapture: `01-enunciado` … `06-slide4` em `funcamp-farmacodinamica-vf/`.

Report: `farmacodinamica-e-farmacocinetica-fabrica-g2-report.md`
