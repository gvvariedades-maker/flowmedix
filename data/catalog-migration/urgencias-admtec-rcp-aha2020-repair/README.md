# Urgências — repair ADM&TEC RCP AHA 2020

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_rcp_sbv`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6` |
| Golden | [`examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json`](../../../examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json) |
| Banca / ano | ADM&TEC 2024 |
| Gabarito | **D** — 30:2 sem VA avançada |
| Sub-âncora V/F | [`examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json`](../../../examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json) |
| Player | `/estudar/adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json
npm run audit:anchor-review -- --lote=urgencias-admtec-rcp-aha2020-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-admtec-rcp-aha2020-repair --apply
```
