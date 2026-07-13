# Saúde do Adolescente — onda nota-10 (2026-07-13)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | 16/16 · já vendável |
| Mis-tags slug×meta | **aceitos** (não renomear `modulo_slug`) — `artifacts/catalog-repair-saude-adolescente-mis-tags.json` |
| A4-mínimo | **16/16** assinados (13 agente + 3 humano `handcraft-qc`) |
| Apply Supabase | g01 **8/8** + g02 **8/8** |
| L6 checklist | g01+g02 **15/15 pass** + captures PNG |
| L3 visual | **13/13** Playwright PASS · 6 ramos · `summary.json` |
| Health | **PASS** (0 P0/P1) |

## A4 humano (3)

| Slug | Motivo |
|------|--------|
| `ibam-…nutricao…` | `family=calc` |
| `cpcon-…processo-de-enfermagem…` | amostra 20% |
| `ms-sarmento-…saude-da-mulher…` | amostra 20% |

## L3 ramos cobertos

`adolescente_etica_sigilo` · `adolescente_antropometria` · `adolescente_desenvolvimento` · `adolescente_saude_mental` · `adolescente_violencia_protecao` · `adolescente_generico`

## Inferência

Anorexia/bulimia com IMC no enunciado → `adolescente_saude_mental` (antes caía em antropometria).

## Dívida residual (aceitável)

- Segmento do slug ≠ canônico em 5 itens do g02 (URL legada; meta OK)
- Capture questao-review flaky sem `PLAYWRIGHT_SKIP_WEBSERVER` + next prod na 3000
