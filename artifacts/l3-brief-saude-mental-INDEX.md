# Saúde Mental — índice de briefs L3 (6 ramos)

**Subtópico:** Saúde Mental · **37 slugs** · `production_ready` · onda paridade Adolescente (2026-07-15)

| Ramo | Slugs | Pacote L3 | Brief |
|------|-------|-----------|-------|
| `mental_raps_legis` | 11 | **bespoke** | [mental_raps_legis](l3-brief-saude-mental-mental_raps_legis.md) |
| `mental_crise_caps` | 6 | **bespoke** | [mental_crise_caps](l3-brief-saude-mental-mental_crise_caps.md) |
| `mental_dependencia_tabagismo` | 6 | genérico premium | [mental_dependencia_tabagismo](l3-brief-saude-mental-mental_dependencia_tabagismo.md) |
| `mental_depressao` | 5 | genérico premium | [mental_depressao](l3-brief-saude-mental-mental_depressao.md) |
| `mental_aps_acolhimento` | 3 | genérico premium | [mental_aps_acolhimento](l3-brief-saude-mental-mental_aps_acolhimento.md) |
| `mental_generico` | 6 | genérico premium | [mental_generico](l3-brief-saude-mental-mental_generico.md) |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| visual-anchors 6/6 | `data/catalog-migration/visual-anchors.json` |
| Playwright | `e2e/visual-mold-regression.spec.ts` → `summary.json` pacote_prefix=`saude-mental` |
| A4-mínimo | `lib/catalogMigration/saudeMentalA4Minimo.ts` |
| Relatório | `artifacts/saude-mental-nota10-report.md` |
