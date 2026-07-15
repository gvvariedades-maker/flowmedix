# Cálculo de Administração de Medicamentos e Infusões — handcraft golden-v1

**Subtópico:** Cálculo de Administração de Medicamentos e Infusões  
**Modo:** Handcraft total (85 slugs canônicos — segmento `calculo-de-administracao` no slug)  
**Status:** em andamento (paridade Adolescente + L3 bespoke)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](../../../docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs canônicos | 85 (`manifest.json` — drift taxonômico excluído) |
| Lotes | `calculo-de-administracao-de-medicamentos-e-infusoes-g01` … `g11` (8 slugs/lote) |
| Guideline | `lib/guidelines/calculoMedicamentos.ts` |
| A4-mínimo | [`docs/PROTOCOLO_A4_MINIMO_CALCULO.md`](../../../docs/PROTOCOLO_A4_MINIMO_CALCULO.md) |
| Âncora equivalências | `examples/questao-premium-idecan-calculo-equivalencias-gotas.json` |
| Âncora ml/gotas | `examples/questao-premium-idecan-calculo-ml-gotas-microgotas.json` |
| Molde L3 bespoke (ramo forte) | `dose-equivalence-rail` · `soft-lens-board` · `dose-calc-tap` · `dose-trap` |
| Ramo genérico | `calc_conceito` · `calc_generico` → ok_generico 3/3 |
| Briefs L3 | [`artifacts/l3-brief-calculo-de-administracao-de-medicamentos-e-infusoes-INDEX.md`](../../../artifacts/l3-brief-calculo-de-administracao-de-medicamentos-e-infusoes-INDEX.md) |
| Cluster | `npm run cluster:calculo-de-administracao-de-medicamentos-e-infusoes` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Ramos (cluster 2026-07-15)

| Branch | n | Forte? | L3 |
|--------|---|--------|-----|
| `calc_dose_equivalencia` | 82 | sim | molde_redesign (bespoke 4/4 implementado) |
| `calc_conceito` | 1 | não | ok_generico 3/3 |
| `calc_generico` | 0 | — | ok_generico 3/3 |

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-completo --subtopico="Cálculo de Administração de Medicamentos e Infusões" --limit=10000
# handcraft: npx tsx scripts/handcraft-calculo-de-administracao-de-medicamentos-e-infusoes-gNN.ts
npm run validate:goldens -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01 --strict
npm run enrich:calculo-guideline-meta -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01 --write
npm run stamp:a4-minimo -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01
npm run catalog:apply-lote -- --lote=calculo-de-administracao-de-medicamentos-e-infusoes-g01 --dry-run
```
