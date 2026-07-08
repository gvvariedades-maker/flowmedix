# Urgências — repair AMEOSC V/F imobilização

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_vf_protocolo`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `ameosc-enfermagem-processo-de-enfermagem-1780011961798-5` |
| Golden | [`examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json`](../../../examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json) |
| Banca / ano | AMEOSC 2026 |
| Gabarito | **C** — I e III (colar antes da prancha · alinhamento manual) |
| Cross-ref | Gramática trauma também em `urgencias_xabcde_trauma` |
| Player | `/estudar/ameosc-enfermagem-processo-de-enfermagem-1780011961798-5` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json
npm run audit:anchor-review -- --lote=urgencias-ameosc-vf-imobilizacao-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-ameosc-vf-imobilizacao-repair --apply
```
