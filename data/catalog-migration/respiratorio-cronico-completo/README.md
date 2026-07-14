# Respiratório Crônico — handcraft golden-v1 (fechado)

**Subtópico:** Doenças Respiratórias Crônicas (Asma, DPOC)  
**Status:** applied · `production_ready` · onda nota-10 A4 (2026-07-14)

Relatório: [`artifacts/respiratorio-cronico-nota10-report.md`](../../../artifacts/respiratorio-cronico-nota10-report.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs | 9 (`manifest.json`) |
| Lote apply | `respiratorio-cronico-completo` |
| Guideline | `lib/guidelines/respiratorioCronico.ts` |
| A4-mínimo | [`docs/PROTOCOLO_A4_MINIMO_RESPIRATORIO.md`](../../../docs/PROTOCOLO_A4_MINIMO_RESPIRATORIO.md) |
| L3 briefs | [`artifacts/l3-brief-respiratorio-cronico-INDEX.md`](../../../artifacts/l3-brief-respiratorio-cronico-INDEX.md) |

## Pipeline onda nota-10

```bash
npm run enrich:respiratorio-guideline-meta -- --lote=respiratorio-cronico-completo --write
npm run stamp:a4-minimo -- --lote=respiratorio-cronico-completo
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Respiratório"
npm run audit:subtopico-quality -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
npm run catalog:apply-lote -- --lote=respiratorio-cronico-completo --apply
```
