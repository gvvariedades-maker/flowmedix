# Urgências — repair ADM&TEC fratura exposta

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_exceto_conduta`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-5` |
| Golden | [`examples/questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json`](../../../examples/questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json) |
| Banca / ano | ADM&TEC 2024 |
| Gabarito | **A** — imobilizar buscando anatomia, exceto dor/resistência |
| Player | `/estudar/adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-5` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json
npm run audit:anchor-review -- --lote=urgencias-admtec-fratura-exposta-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-admtec-fratura-exposta-repair --apply
```
