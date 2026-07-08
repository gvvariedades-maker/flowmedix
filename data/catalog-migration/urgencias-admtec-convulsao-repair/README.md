# Urgências — repair ADM&TEC convulsão

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_convulsao`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-8` |
| Golden | [`examples/questao-premium-admtec-urgencias-convulsao-crise.json`](../../../examples/questao-premium-admtec-urgencias-convulsao-crise.json) |
| Banca / ano | ADM&TEC 2024 |
| Gabarito | **B** — não introduzir objetos na boca |
| Player | `/estudar/adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-8` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-admtec-urgencias-convulsao-crise.json
npm run audit:anchor-review -- --lote=urgencias-admtec-convulsao-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-admtec-convulsao-repair --apply
```
