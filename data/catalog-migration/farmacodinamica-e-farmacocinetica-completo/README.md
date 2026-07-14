# Farmacodinâmica e Farmacocinética — handcraft golden-v1 (fechado)

**Subtópico:** Farmacodinâmica e Farmacocinética  
**Modo:** Handcraft total (13 slugs)  
**Status:** applied · `production_ready` · onda nota-10 (2026-07-14)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

Relatório fechamento: [`artifacts/farmacodinamica-nota10-report.md`](../../../artifacts/farmacodinamica-nota10-report.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 13 (`manifest.json`) |
| Lotes | `farmacodinamica-e-farmacocinetica-g01` (5) · `g02` (8) |
| Guideline | `lib/guidelines/farmacodinamica.ts` |
| A4-mínimo | [`docs/PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md`](../../../docs/PROTOCOLO_A4_MINIMO_FARMACODINAMICA.md) · `stamp:a4-minimo` 13/13 |
| Âncora VF ADME | `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json` |
| Âncora clínico EV | `examples/questao-premium-idecan-omeprazol-ev-ulcera.json` |
| Moldes L3 bespoke | **Clínico:** `infusao-ev-station-deck` · `farmaco-clinico-reference-board` · `farmaco-protocol-tap-flow` · `farmaco-clinico-trap` |
| Moldes L3 bespoke | **PK/PD V/F:** `adme-journey-rail` + layouts semânticos ADME |
| Ramo genérico | `farmaco_generico` → `morphological` / `reference_table` / `vertical` / `compare` |
| Briefs L3 | [`artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md`](../../../artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md) |
| Cluster | `npm run cluster:farmacodinamica` → `artifacts/farmacodinamica-topic-cluster-report.json` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=farmacodinamica-e-farmacocinetica-completo --subtopico="Farmacodinâmica e Farmacocinética" --limit=10000
# handcraft: data/catalog-migration/farmacodinamica-e-farmacocinetica-gNN/questions/<slug>.json
npm run validate:goldens -- --lote=farmacodinamica-e-farmacocinetica-g01 --strict
npm run enrich:farmacodinamica-guideline-meta -- --lote=farmacodinamica-e-farmacocinetica-g01 --write
npm run stamp:a4-minimo -- --lote=farmacodinamica-e-farmacocinetica-g01
npm run catalog:apply-lote -- --lote=farmacodinamica-e-farmacocinetica-g01 --dry-run
# apply só quando pedido:
npm run catalog:apply-lote -- --lote=farmacodinamica-e-farmacocinetica-g01 --apply
```

## Qualidade vendável (Fase 2)

```bash
npm run reconcile:handcraft-manifest -- --subtopico="Farmacodinâmica e Farmacocinética"
npm run audit:handcraft-dod -- --subtopico="Farmacodinâmica e Farmacocinética"
npm run audit:anchor-review -- --lote=farmacodinamica-e-farmacocinetica-g01 --record-pass --reviewer=handcraft-qc
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Farmacodinâmica"
npm run audit:subtopico-quality -- --subtopico="Farmacodinâmica e Farmacocinética"
```
