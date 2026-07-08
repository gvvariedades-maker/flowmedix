# Urgências — repair ADM&TEC choque elétrico

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_choque`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-4` |
| Golden | [`examples/questao-premium-admtec-urgencias-choque-eletrico.json`](../../../examples/questao-premium-admtec-urgencias-choque-eletrico.json) |
| Banca / ano | ADM&TEC 2024 |
| Gabarito | **D** — não tocar antes de interromper circuito |
| Sub-âncora | [`choque-hipovolemico`](../../../examples/questao-premium-fepese-urgencias-choque-hipovolemico.json) |
| Player | `/estudar/adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-4` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-admtec-urgencias-choque-eletrico.json
npm run audit:anchor-review -- --lote=urgencias-admtec-choque-eletrico-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-admtec-choque-eletrico-repair --apply
```
