# Fábrica visual G2 — Farmacodinâmica e Farmacocinética

**Fechamento:** 2026-08-08  
**Pacote:** 13/13 `production_ready` · 3 ramos L3  
**Contrato:** [`docs/PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md)  
**Âncoras 100%:** [`farmacodinamica-e-farmacocinetica-ancoras-100-report.md`](farmacodinamica-e-farmacocinetica-ancoras-100-report.md)

---

## visual_bar: **pass**

| vs_anterior | anti_regressao |
|-------------|----------------|
| Gallery ausente → `ready` 3/3 + captures player | Sem React novo; sem feed; boards `ok_react` mantidos |

---

## Fase -1 Composer

| ramo | gesture_id | ATELIER | artefato |
|------|------------|---------|----------|
| `farmaco_pk_pd_vf` | `rail` (+ critical_number) | **PASS** | `artifacts/composer-visual-farmaco_pk_pd_vf.md` |
| `farmaco_clinico_protocolo` | `deck` / `rail` / `compare` | **PASS** | `artifacts/composer-visual-farmaco_clinico_protocolo.md` |
| `farmaco_generico` | focus/compare | pulado (ok_generico) | — |

Handoff: **reuso + capture** — proibido `Implementar molde:` (gesto no banco + variants ship).

---

## Gallery

| ramo | status | captures_dir |
|------|--------|--------------|
| `farmaco_pk_pd_vf` | **ready** | `artifacts/questao-review/funcamp-farmacodinamica-vf` |
| `farmaco_clinico_protocolo` | **ready** | `artifacts/questao-review/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6` |
| `farmaco_generico` | **ready** | `artifacts/questao-review/instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-2` |

---

## Evidência

| Gate | Resultado |
|------|-----------|
| `capture:questao-review` VF | PASS (6 PNGs) |
| `capture:questao-review` clínico | PASS (6 PNGs) |
| Playwright `Farmacodinâmica` moldes L3 | **8/8** PASS |
| React novo | **0** |
| Banco Composer `rail` | ADME path elevado (≤2 ouro: antropometria + FUNCAMP) |

---

## Checklist Camada 7

```text
[x] Gate Composer pending/ausente → ATELIER_PASS (2 fortes)
[x] 1 gesto nomeado por ramo forte
[x] Reuso primitives/shells (sem variant nova)
[x] Orçamento de clique família
[x] 0 hardcode gabarito no TSX (inalterado)
[x] Evidência Playwright + captures
[x] visual_gallery playbook ready 3/3
[x] Banco Composer atualizado (1 path)
[x] visual_bar: pass
```

## Próximo

Handcraft em massa **não** faz parte desta Fábrica. Nova conversa: `Handcraft: Farmacodinâmica e Farmacocinética` só se houver escopo de conteúdo.

---

## Atualização 2026-08-08 (redesign estático VF)

Revisão humana/agente dos 4 slides `farmaco_pk_pd_vf` após posters EBSERH/aleitamento:

| slide | veredicto |
|------:|-----------|
| 1 concept_map | **ATELIER_PASS** |
| 2 logic_flow | **ATELIER_PASS** |
| 3 golden_rule | **ATELIER_PASS** |
| 4 danger_zone | **ATELIER_PASS** |

Recapture: `artifacts/questao-review/funcamp-farmacodinamica-vf` (01–06, 11:23–11:24).  
Índice: `l3-visual-gallery-farmacodinamica-e-farmacocinetica-index.md`.  
`visual_bar: pass` (ratchet: 0-tap 4/4 no ramo VF).
