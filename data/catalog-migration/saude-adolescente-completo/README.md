# Saúde do Adolescente — handcraft golden-v1 (fechado)

**Subtópico:** Saúde do Adolescente  
**Modo:** Handcraft total (16 slugs)  
**Status:** applied · `production_ready` · onda nota-10 (2026-07-13)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs exportados | 16 (`manifest.json`) |
| Lotes | `saude-adolescente-g01` (8) · `g02` (8) |
| Âncora VF gravidez | `examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json` |
| Âncora escore Z | `ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0` |
| Moldes L3 bespoke | **Ética/sigilo:** `adolescent-privacy-curtain` · `adolescent-sigilo-spectrum` · `adolescent-vf-weave-tap` · `adolescent-consent-gate` |
| Moldes L3 bespoke | **Antropometria Z:** `adolescent-growth-z-rail` · `adolescent-z-band-board` · `adolescent-z-classify-tap` · `adolescent-z-threshold-trap` |
| Ramos genéricos | `adolescente_desenvolvimento` · `adolescente_saude_mental` · `adolescente_violencia_protecao` · `adolescente_generico` → `morphological` / `reference_table` / `vertical` / `compare` |
| Briefs L3 | [`artifacts/l3-brief-saude-adolescente-INDEX.md`](../../../artifacts/l3-brief-saude-adolescente-INDEX.md) |
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
