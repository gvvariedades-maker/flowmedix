# Saúde do Adolescente — handcraft golden-v1 (fechado)

**Subtópico:** Saúde do Adolescente  
**Modo:** Handcraft total (16 slugs)  
**Status:** applied — g01 + g02 (16/16 slugs no catálogo)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 16 (`manifest.json`) |
| Lotes | `saude-adolescente-g01` (8) · `g02` (8) |
| Âncora VF gravidez | `examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json` |
| Moldes L3 | `adolescent-privacy-curtain` · `adolescent-sigilo-spectrum` · `adolescent-vf-weave-tap` · `adolescent-consent-gate` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Pipeline por lote

```bash
npm run catalog:export-lote -- --lote=saude-adolescente-g01 --slugs=...
# handcraft: data/catalog-migration/saude-adolescente-g01/questions/<slug>.json
npm run validate:goldens -- --lote=saude-adolescente-g01 --strict
npm run catalog:apply-lote -- --lote=saude-adolescente-g01 --dry-run
# apply só quando pedido:
npm run catalog:apply-lote -- --lote=saude-adolescente-g01 --apply
```
