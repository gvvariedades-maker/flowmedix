# Urgências — repair AMEOSC queimadura V/F

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_queimadura`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `ameosc-enfermagem-processo-de-enfermagem-1780005556782-6` |
| Golden | [`examples/questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json`](../../../examples/questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json) |
| Banca / ano | AMEOSC 2026 |
| Gabarito | **D** — V,F,V,F (item II queimadura = F) |
| Player | `/estudar/ameosc-enfermagem-processo-de-enfermagem-1780005556782-6` |

**Nota:** slug `selecon-…-1777104038968-4` do cluster report é drift (BT16 esmagamento no DB).

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json
npm run audit:anchor-review -- --lote=urgencias-ameosc-queimadura-vf-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-ameosc-queimadura-vf-repair --apply
```
