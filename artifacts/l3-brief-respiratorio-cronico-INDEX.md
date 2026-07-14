# Doenças Respiratórias Crônicas — índice de briefs L3 (5 ramos)

**Subtópico:** Doenças Respiratórias Crônicas (Asma, DPOC) · **9 slugs** · `production_ready` · onda nota-10 A4 (2026-07-14)

| Ramo | Slugs (aprox.) | Pacote L3 | Brief | Implementação |
|------|----------------|-----------|-------|---------------|
| `respiratorio_dpoc_oxigenio` | 5 | duel-deck + spo2-board | [dpoc_oxigenio](l3-brief-respiratorio-cronico-respiratorio_dpoc_oxigenio.md) | **React bespoke** |
| `respiratorio_vf_asma_dpoc` | 1 | duel-deck + vf-juggle-tap | [vf_asma_dpoc](l3-brief-respiratorio-cronico-respiratorio_vf_asma_dpoc.md) | **React bespoke** |
| `respiratorio_tecnica_inalador` | 1 | morphological + reference_table | [tecnica_inalador](l3-brief-respiratorio-cronico-respiratorio_tecnica_inalador.md) | genérico premium |
| `respiratorio_asma_crise` | 1 | morphological + banner | [asma_crise](l3-brief-respiratorio-cronico-respiratorio_asma_crise.md) | genérico premium |
| `respiratorio_generico` | 1 | morphological + compare | [generico](l3-brief-respiratorio-cronico-respiratorio_generico.md) | genérico premium |

**9/9 slugs** com `pedagogical_branch` declarado — paridade Saúde do Adolescente (todos os ramos no catálogo).

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Utils SpO₂ / duel-deck | `lib/slides/respiratorioCronicoSlideUtils.ts` |
| A4-mínimo | `lib/catalogMigration/respiratorioA4Minimo.ts` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary.json` |
| Cluster | `artifacts/respiratorio-cronico-topic-cluster-report.json` |
| Relatório nota-10 | `artifacts/respiratorio-cronico-nota10-report.md` |
