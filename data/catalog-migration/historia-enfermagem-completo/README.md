# História da Enfermagem — handcraft golden-v1 (Trilho A)

**Subtópico:** História da Enfermagem  
**Modo:** Trilho A — handcraft total (18 slugs)  
**Status:** **applied** — g01 + g02 + g03 (**18/18** slugs no Supabase)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 18 (`manifest.json`) |
| Lotes | `historia-enfermagem-g01` (8) · `g02` (8) · `g03` (2) |
| Âncora VF Nightingale | `examples/questao-premium-cpcon-historia-enfermagem-nightingale.json` |
| Guideline | `lib/guidelines/historiaEnfermagem.ts` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=historia-enfermagem-g01 --slugs=...
# handcraft: data/catalog-migration/historia-enfermagem-g01/questions/<slug>.json
npm run validate:goldens -- --lote=historia-enfermagem-g01 --strict
npm run catalog:apply-lote -- --lote=historia-enfermagem-g01 --dry-run
# apply só quando pedido:
npm run catalog:apply-lote -- --lote=historia-enfermagem-g01 --apply
```

## Nota de classificação

Parte dos 18 slugs no Supabase está com `subtopico` = História da Enfermagem, mas o enunciado cobre temas adjacentes (teorias, processo de enfermagem, vias). O handcraft ensina **cada card da prova** — slides ancorados no enunciado, não texto genérico de história.
