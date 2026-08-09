# Revisão de guidelines — Onda 5 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS/SVSA, aids.gov.br).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA4_2026-08.md`](GUIDELINE_REVIEW_ONDA4_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `doencasVirais.ts` | Snapshot/ano 2026; influenza trivalente rotina + estratégia 2026; **SCR dose zero** bloqueio sarampo (6–11 m) | NT DPNI 2026 · Estratégia Influenza 2026 · NT 21/2026 |
| `ists.ts` | Hub PCDTs; snapshot PrEP Oral **2025**; entry PrEP alinhada ao PCDT vigente; PCDT-IST **2022** mantido como base clínica | [PCDTs MS](https://www.gov.br/aids/pt-br/central-de-conteudo/pcdts) |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| PCDT-IST 2022 (sífilis, benzatina, etc.) | Ainda é o PCDT-IST publicado no portal oficial |
| PEP ≤72h | Sem alteração no PCDT PEP referenciado |
| Polio eliminada / manter vacinação | Consenso estável |

## Onda 6

Concluída em [`GUIDELINE_REVIEW_ONDA6_2026-08.md`](GUIDELINE_REVIEW_ONDA6_2026-08.md) (gestante 7 consultas, VPC20 infantil, CME, NR-32).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
