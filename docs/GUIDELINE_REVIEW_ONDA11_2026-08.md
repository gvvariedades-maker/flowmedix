# Revisão de guidelines — Onda 11 (2026-08)

**Política:** só alterar com fonte oficial verificada (Anvisa, MS/PNSP, NPIAP).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA10_2026-08.md`](GUIDELINE_REVIEW_ONDA10_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `mobilizacaoPosicionamento.ts` | Snapshot Anvisa/PNSP 2023; reposicionamento individualizado + 2/2 h (prova); lateral **30°**; cabeceira máx. ~**30°** (cisalhamento); LPP nomenclatura | Anvisa NT GVIMS 05/2023 · Protocolo PNSP LPP · NPIAP |

## exam_vs_current

| Tema | Vigente | Prova antiga |
|------|---------|--------------|
| Intervalo de decúbito | individualizado (superfície + tolerância) | fixo 2/2 h (ainda cobrado) |
| Úlcera × lesão | **lesão por pressão** | úlcera por pressão |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Fowler / Trendelenburg / Sims | Definições estáveis na assistência TE |
| Transferência segura | Princípios ergonômicos estáveis |

## Onda 12

Concluída em [`GUIDELINE_REVIEW_ONDA12_2026-08.md`](GUIDELINE_REVIEW_ONDA12_2026-08.md) (5 momentos HM + RDC 42/2010).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
