# Atenção Básica / Saúde da Família — handcraft golden-v1

**Subtópico:** Atenção Básica / Saúde da Família  
**Status:** Fase 0 — bootstrap (export + registry + cluster)  
**Referência de qualidade:** Promoção à Saúde (vizinho) + Saúde do Adolescente (pacote fechado A4+L6)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/PIPELINE_COMPLETO_CONVERSA.md`](../../../docs/PIPELINE_COMPLETO_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 171 (`manifest.json`) |
| Lotes planejados | `atencao-basica-saude-da-familia-g01` … `g22` (8 slugs/lote; último parcial) |
| Ramos L3 | `ab_acs_territorio` · `ab_esf_composicao` · `ab_pnab_principios` · `ab_te_aps` · `ab_vigilancia_ads` · `ab_generico` |
| Molde bespoke | `ab_esf_composicao` → brief 4/4 (`molde_inedito`); demais `ok_generico` |
| Cluster | `npm run cluster:atencao-basica` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=atencao-basica-saude-da-familia-g01 --from-manifest=data/catalog-migration/atencao-basica-saude-da-familia-g01/manifest.json
# handcraft: data/catalog-migration/atencao-basica-saude-da-familia-g01/questions/<slug>.json
npm run validate:goldens -- --lote=atencao-basica-saude-da-familia-g01 --strict
npm run audit:questao-readiness -- --lote=atencao-basica-saude-da-familia-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=atencao-basica-saude-da-familia-g01 --dry-run
# apply só com: pode aplicar
```

## Taxonomia

- `meta.subtopico` canônico obrigatório.
- Drift de URL legada (`…-processo-de-enfermagem-…` no slug) **aceitável** se `meta.subtopico` = canônico.
