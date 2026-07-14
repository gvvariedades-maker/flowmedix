# História da Enfermagem — índice de briefs L3 (4 ramos)

**Subtópico:** História da Enfermagem · **20 slugs** · `production_ready` · paridade L3 Adolescente (2026-07-14)

Política: cada ramo documenta **metáfora visual ↔ erro pedagógico**. Pacote semântico premium (`bridge` ou `morphological`, `rows`, `correct`, `reveal_mode: tap`); sem moldes React bespoke nesta onda — bridge ancora cronologia/ética COFEN×COREN.

| Ramo | Slugs (aprox.) | Pacote L3 | Brief | Implementação |
|------|----------------|-----------|-------|---------------|
| `historia_nightingale` | 4 | bridge + reference_table | [nightingale](l3-brief-historia-enfermagem-historia_nightingale.md) | genérico premium |
| `historia_humanizacao` | 8 | morphological + reference_table | [humanizacao](l3-brief-historia-enfermagem-historia_humanizacao.md) | genérico premium |
| `historia_comunicacao_etica` | 5 | bridge + reference_table | [comunicacao_etica](l3-brief-historia-enfermagem-historia_comunicacao_etica.md) | genérico premium |
| `historia_generico` | 3 | morphological + reference_table | [generico](l3-brief-historia-enfermagem-historia_generico.md) | genérico premium |

## Código e testes

| Área | Arquivo |
|------|---------|
| Ramos + design map | `lib/slides/pedagogicalBranch.ts` |
| Afinidade + guards | `lib/slides/moldAffinity.ts` |
| Gap audit / decisões | `lib/slides/l3MoldGapCatalog.ts` |
| Guideline tier A | `lib/guidelines/historiaEnfermagem.ts` |
| Regressão visual | `e2e/visual-mold-regression.spec.ts` · `artifacts/visual-mold-regression/summary-historia-enfermagem.json` |
| Cluster + volume | `artifacts/historia-enfermagem-topic-cluster-report.json` |
| Relatório nota-10 | `artifacts/historia-enfermagem-nota10-report.md` |

## Inferência (handcraft-meta)

| Sinal no enunciado | Ramo |
|--------------------|------|
| Nightingale, Crimeia, pioneiras, SUS/1988, Lei 7.498 | `historia_nightingale` |
| COFEN, código de ética, comunicação, ruído | `historia_comunicacao_etica` |
| Humanização, Peplau, Horta, V/F I–IV | `historia_humanizacao` |
| Teorias administrativas, slug legado adjacente | `historia_generico` |

```bash
npm run catalog:patch-pedagogical-branch -- --lote=historia-enfermagem-completo --reconcile-branch --dry-run
```
