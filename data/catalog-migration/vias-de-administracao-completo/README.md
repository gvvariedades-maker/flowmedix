# Vias de Administração — handcraft golden-v1 (bootstrap)

**Subtópico:** Vias de Administração  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **in_progress** — 1/251 slugs handcraft aplicado (2026-07-01)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs estimados (catálogo) | 251 (`vias-de-administracao-exclude-done.json`) |
| Handcraft aplicado | 1 |
| Ramos L3 | `via_vf_absorcao` · `via_tecnica_admin` · `via_generico` |
| Âncora absorção CORRETA | [`examples/questao-premium-consulpam-vias-absorcao-oral.json`](../../examples/questao-premium-consulpam-vias-absorcao-oral.json) |
| Âncora indicação SC | [`examples/questao-premium-vunesp-via-subcutanea.json`](../../examples/questao-premium-vunesp-via-subcutanea.json) |
| Âncora técnica IM V/F | [`examples/questao-premium-cpcon-vias-im-vf.json`](../../examples/questao-premium-cpcon-vias-im-vf.json) |
| Registry âncoras | [`vias-golden-anchors.json`](../vias-golden-anchors.json) |
| Repair Consulpam | [`vias-de-administracao-consulpam-repair`](../vias-de-administracao-consulpam-repair/README.md) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Primeiro slug handcraft (referência)

| Slug | Gabarito | Ramo |
|------|----------|------|
| `instituto-consulpam-enfermagem-vias-de-administracao-1777178666643-0` | D | `via_vf_absorcao` |

## Próximo passo

```text
Pipeline completo: Vias de Administração
```

ou handcraft por lote `vias-de-administracao-g01` após `catalog:export-lote`.
