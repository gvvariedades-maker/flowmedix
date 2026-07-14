# Farmacodinâmica e Farmacocinética — onda nota-10 (2026-07-14)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **13/13** · vendável |
| Manifest ↔ registry | **13/13** alinhado (`reconcile:handcraft-manifest` OK) |
| Cluster | **drift=0** · contract_fail=0 |
| A4-mínimo | **13/13** assinados (10 agente + 3 humano `handcraft-qc`) |
| Apply Supabase | g01 **5/5** + g02 **8/8** aplicados (2026-07-14) |
| L6 checklist | g01+g02 **pass** · revisor `handcraft-qc` |
| L3 visual | **7/7** Playwright PASS · 3 ramos · PNGs + `summary.json` |
| Health | **PASS** (gates L1–L6) |

## A4 humano (3 — amostra 20%)

| Slug | Motivo |
|------|--------|
| `idecan-…2855-6` | Âncora omeprazol EV — amostra 20% |
| `idecan-…2855-7` | Diazepam PK/PD — amostra 20% |
| `quadrix-…1778969018962-1` | Insulina perfil ação — amostra 20% |

## Reparos desta onda

| Item | Ação |
|------|------|
| `fundatec-…7230169-1` (midazolam UTI) | Handcraft golden-v1 `farmaco_clinico_protocolo` — repair `danger_duplicate_justifications` |
| Manifest g02 | +`7230169-1` + quadrix clone |
| Guideline | `lib/guidelines/farmacodinamica.ts` + `enrich:farmacodinamica-guideline-meta` |
| A4-mínimo | `lib/catalogMigration/farmacoA4Minimo.ts` + `auto_approval` no registry |
| L3 DoD 375px | `footer_rule` logic_flow omeprazol alinhado ao player |

## L3 ramos cobertos

`farmaco_clinico_protocolo` · `farmaco_pk_pd_vf` · `farmaco_generico`

Briefs: [`l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md`](l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md)

## Paridade com Saúde do Adolescente

| Dimensão | Adolescente nota-10 | Farmacodinâmica nota-10 |
|----------|---------------------|-------------------------|
| Slugs | 16 | 13 |
| A4-mínimo onda | sim | sim |
| Guideline TS | sim | sim |
| auto_approval | sim | sim |
| L3 Playwright PNG | sim | sim |
| L6 captures PNG | sim (com flaky conhecido) | capture omeprazol flaky sem dev limpo na 3000 |

## Dívida residual (aceitável)

- `capture:questao-review` falha se `next start`/porta 3000 ocupada sem `next dev`
- Segmento URL legado (`processo-de-enfermagem` no slug) — meta `subtopico` canônico OK

## Comandos de referência

```bash
npm run stamp:a4-minimo -- --lote=farmacodinamica-e-farmacocinetica-completo
npm run enrich:farmacodinamica-guideline-meta -- --lote=farmacodinamica-e-farmacocinetica-completo --write
npm run cluster:farmacodinamica
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Farmacodinâmica"
npm run audit:subtopico-quality -- --subtopico="Farmacodinâmica e Farmacocinética"
```
