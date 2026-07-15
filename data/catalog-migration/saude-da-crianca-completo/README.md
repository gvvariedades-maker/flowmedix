# Saúde da Criança — handcraft golden-v1

**Subtópico:** Saúde da Criança  
**Modo:** Pipeline + paridade Adolescente + L3 bespoke  
**Status:** Fase 0/0b em andamento · 62 slugs exportados

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md`](../../../docs/PROMPT_PARIDADE_ADOLESCENTE_L3_BESPOKE.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 62 (`manifest.json`) |
| Lotes planejados | `saude-da-crianca-g01` … `g08` (8 slugs/lote) |
| Ramos fortes (≥5) | aleitamento · triagem · genérico · desidratação · APS |
| Moldes L3 bespoke | 7 pacotes 4/4 (cyan template) |
| Guideline | `lib/guidelines/saudeCrianca.ts` |
| Cluster | `npm run cluster:saude-da-crianca` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Pipeline por lote

```bash
npm run plan:saude-da-crianca-batches
npm run catalog:export-lote -- --lote=saude-da-crianca-g01 --from-manifest=data/catalog-migration/saude-da-crianca-g01/manifest.json
# handcraft: data/catalog-migration/saude-da-crianca-g01/questions/<slug>.json
npm run validate:goldens -- --lote=saude-da-crianca-g01 --strict
npm run audit:questao-readiness -- --lote=saude-da-crianca-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=saude-da-crianca-g01 --dry-run
```
