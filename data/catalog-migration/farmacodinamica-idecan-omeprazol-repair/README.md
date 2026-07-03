# Farmacodinâmica — repair IDECAN omeprazol EV

**Subtópico:** Farmacodinâmica e Farmacocinética  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-01)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md)

## Questão documentada

| Campo | Valor |
|-------|--------|
| Slug | `idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6` |
| Golden | [`examples/questao-premium-idecan-omeprazol-ev-ulcera.json`](../../../examples/questao-premium-idecan-omeprazol-ev-ulcera.json) |
| Banca / ano | IDECAN 2025 — SESAP RN |
| Comando | Marque a opção **adequada** |
| Gabarito | **B** — monitorar pH e ajustar infusão conforme resposta clínica |
| Ramo L3 | `farmaco_clinico_protocolo` |
| Família | `protocolo` |
| Player | `/estudar/idecan-enfermagem-farmacodinamica-e-farmacocinetica-1778712122855-6` |

## Âncora pedagógica

Referência de estilo para handcraft de **fármaco clínico hospitalar EV** (IBP, infusão monitorada, diluição, interações).

Registry: [`data/catalog-migration/farmacodinamica-golden-anchors.json`](../farmacodinamica-golden-anchors.json)

## Pipeline (reaplicar)

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-idecan-omeprazol-ev-ulcera.json
npm run catalog:apply-lote -- --lote=farmacodinamica-idecan-omeprazol-repair --dry-run
npm run catalog:apply-lote -- --lote=farmacodinamica-idecan-omeprazol-repair --apply
```

**Não usar:** `ai:generate` · `catalog:upgrade-premium`
