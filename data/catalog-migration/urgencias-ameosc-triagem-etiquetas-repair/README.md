# Urgências — repair AMEOSC triagem etiquetas

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_manchester_triagem`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `ameosc-enfermagem-processo-de-enfermagem-1780011967989-1` |
| Golden | [`examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json`](../../../examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json) |
| Banca / ano | AMEOSC 2026 |
| Gabarito | **A** — vermelho = emergência |
| Player | `/estudar/ameosc-enfermagem-processo-de-enfermagem-1780011967989-1` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json
npm run audit:anchor-review -- --lote=urgencias-ameosc-triagem-etiquetas-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-ameosc-triagem-etiquetas-repair --apply
```
