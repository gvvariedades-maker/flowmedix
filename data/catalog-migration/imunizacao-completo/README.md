# Imunização — handcraft golden-v1 (bootstrap)

**Subtópico:** Imunização  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **in_progress** — 1/575 slugs handcraft aplicado (2026-07-02)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest | 575 (`imunizacao-completo/manifest.json`) |
| Handcraft aplicado | 1 |
| Ramos L3 | `imunizacao_vf_intervalos` · `imunizacao_calendario` · `imunizacao_generico` |
| Âncora via SCR | [`examples/questao-premium-decorp-imunizacao-triplice-viral-via.json`](../../examples/questao-premium-decorp-imunizacao-triplice-viral-via.json) |
| Âncora calendário | [`examples/questao-premium-fundatec-meningococica-3meses.json`](../../examples/questao-premium-fundatec-meningococica-3meses.json) |
| Âncora V/F intervalos | [`examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`](../../examples/questao-premium-cpcon-imunizacao-intervalos-vf.json) |
| Registry âncoras | [`imunizacao-golden-anchors.json`](../imunizacao-golden-anchors.json) |
| Repair DECORP | [`imunizacao-decorp-triplice-viral-repair`](../imunizacao-decorp-triplice-viral-repair/README.md) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Primeiro slug handcraft (referência)

| Slug | Gabarito | Ramo |
|------|----------|------|
| `decorp-enfermagem-vias-de-administracao-1776056357082-0` | A | `imunizacao_generico` |

## Próximo passo

```text
Pipeline completo: Imunização
```

ou handcraft por lote `imunizacao-g01` após cluster (`npm run cluster:imunizacao`).
