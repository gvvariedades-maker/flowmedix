# Curativos e Manejo de Feridas — handcraft golden-v1

**Subtópico:** Curativos e Manejo de Feridas  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **`none`** — **0/94** handcraft local

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest (curado) | **94** (`curativos-e-manejo-de-feridas-completo/manifest.json`) |
| Export bruto (mis-tags) | 157 → excluídos 63 (processo-de-enfermagem, feridas-e-queimaduras, etc.) |
| Handcraft aplicado | **0/94** |
| `production_status` | **`none`** |
| Ramos L3 | `curativos_cobertura_selecao` · `curativos_ferida_cirurgica` · `curativos_lpp` · `curativos_tecnica_assepsia` · `curativos_desbridamento` · `curativos_exceto_incorreta` · `curativos_estomia` · `curativos_bandagem_imobilizacao` · `curativos_dreno` · `curativos_termoterapia` · `curativos_generico` |
| Playbook | [`handcraft-playbooks/curativos-e-manejo-de-feridas.json`](../handcraft-playbooks/curativos-e-manejo-de-feridas.json) |
| Guideline | [`lib/guidelines/curativos.ts`](../../lib/guidelines/curativos.ts) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Ramos fortes (≥10 slugs)

| Ramo | Slugs | % | L3 decisão |
|------|-------|---|------------|
| `curativos_cobertura_selecao` | 23 | 24.7% | molde_redesign (bespoke 4/4 existente) |
| `curativos_ferida_cirurgica` | 13 | 14.0% | molde_redesign (procedure-protocol + wound-prep) |

## Primeiro lote (g01)

Cluster P0: **Cobertura e seleção** (`curativos_cobertura_selecao`)

```bash
npm run handcraft:brief -- --subtopico="Curativos e Manejo de Feridas"
npm run cluster:curativos-e-manejo-de-feridas
npm run catalog:export-lote -- --lote=curativos-e-manejo-de-feridas-g01 --from-manifest=...
```
