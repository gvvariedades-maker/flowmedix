# História da Enfermagem — handcraft golden-v1 (fechado)

**Subtópico:** História da Enfermagem  
**Modo:** Handcraft total (20 slugs)  
**Status:** applied · `production_ready` · onda nota-10 (2026-07-14)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

Relatório fechamento: [`artifacts/historia-enfermagem-nota10-report.md`](../../../artifacts/historia-enfermagem-nota10-report.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 20 (`manifest.json`) |
| Lotes | `historia-enfermagem-g01` (8) · `g02` (8) · `g03` (2) · `g04` (2) |
| Guideline | `lib/guidelines/historiaEnfermagem.ts` |
| A4-mínimo | [`docs/PROTOCOLO_A4_MINIMO_HISTORIA.md`](../../../docs/PROTOCOLO_A4_MINIMO_HISTORIA.md) · `stamp:a4-minimo` 20/20 |
| L3 ramos | `historia_nightingale` · `historia_humanizacao` · `historia_comunicacao_etica` · `historia_generico` |
| Briefs L3 | [`artifacts/l3-brief-historia-enfermagem-INDEX.md`](../../../artifacts/l3-brief-historia-enfermagem-INDEX.md) |
| Cluster | [`artifacts/historia-enfermagem-topic-cluster-report.json`](../../../artifacts/historia-enfermagem-topic-cluster-report.json) |
| Handcraft meta | `handcraft-meta.json` (inferência L2.5) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=historia-enfermagem-g01 --slugs=...
# handcraft: data/catalog-migration/historia-enfermagem-g01/questions/<slug>.json
npm run validate:goldens -- --lote=historia-enfermagem-g01 --strict
npm run enrich:historia-guideline-meta -- --lote=historia-enfermagem-completo --write
npm run stamp:a4-minimo -- --lote=historia-enfermagem-completo
npm run catalog:apply-lote -- --lote=historia-enfermagem-g01 --dry-run
# apply só quando pedido:
npm run catalog:apply-lote -- --lote=historia-enfermagem-g01 --apply
```

## Qualidade vendável (Fase 2)

```bash
npm run reconcile:handcraft-manifest -- --subtopico="História da Enfermagem"
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "História"
npm run audit:subtopico-quality -- --subtopico="História da Enfermagem"
```

## Nota de classificação

Parte dos 18 slugs no Supabase está com `subtopico` = História da Enfermagem, mas o enunciado cobre temas adjacentes (teorias, processo de enfermagem, vias). O handcraft ensina **cada card da prova** — slides ancorados no enunciado, não texto genérico de história.
