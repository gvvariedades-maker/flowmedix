# Urgências — repair FAU Unicentro engasgo (sinal universal)

**Subtópico:** Urgências e Emergências  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-07)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../../docs/GOLDEN_HANDCRAFT_MODEL.md)

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-6` |
| Golden | [`examples/questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json`](../../../examples/questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json) |
| Banca / ano | FAU Unicentro 2026 |
| Gabarito | **E** — Pescoço |
| Ramo L3 | `urgencias_engasgo` |
| Player | `/estudar/fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-6` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=data/catalog-migration/urgencias-fau-unicentro-engasgo-repair/questions/fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-6.json
npm run audit:anchor-review -- --lote=urgencias-fau-unicentro-engasgo-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-fau-unicentro-engasgo-repair --dry-run
npm run catalog:apply-lote -- --lote=urgencias-fau-unicentro-engasgo-repair --apply
```
