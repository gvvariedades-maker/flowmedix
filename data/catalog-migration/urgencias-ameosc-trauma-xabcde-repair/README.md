# Urgências — repair AMEOSC trauma XABCDE

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_xabcde_trauma`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `ameosc-enfermagem-processo-de-enfermagem-1780002934000-5` |
| Golden | [`examples/questao-premium-ameosc-urgencias-trauma-queimadura.json`](../../../examples/questao-premium-ameosc-urgencias-trauma-queimadura.json) |
| Banca / ano | AMEOSC 2026 |
| Gabarito | **C** — queimadura: água corrente, sem caseiro |
| Sub-âncoras | [`trauma-imobilizacao-vf`](../../../examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json) · [`bt16-esmagamento`](../../../examples/questao-premium-selecon-urgencias-bt16-esmagamento.json) |
| Player | `/estudar/ameosc-enfermagem-processo-de-enfermagem-1780002934000-5` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-ameosc-urgencias-trauma-queimadura.json
npm run audit:anchor-review -- --lote=urgencias-ameosc-trauma-xabcde-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-ameosc-trauma-xabcde-repair --apply
```
