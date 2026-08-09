# Revisão de guidelines — Onda 12 (2026-08)

**Política:** só alterar com fonte oficial verificada (Anvisa, MS/PNSP, OMS).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA11_2026-08.md`](GUIDELINE_REVIEW_ONDA11_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `procedimentosDiversos.ts` | Lista explícita dos **5 momentos**; água/sabão × álcool; RDC **42/2010**; URL Protocolo HM PNSP | [Protocolo Higiene das Mãos](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/protocolo-de-higiene-das-maos) · RDC 42/2010 · NT GVIMS 05/2024 |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Antissepsia × desinfecção | Distinção clássica estável |
| Glicemia capilar / nebulização | Técnica TE estável |

## Onda 13

Concluída em [`GUIDELINE_REVIEW_ONDA13_2026-08.md`](GUIDELINE_REVIEW_ONDA13_2026-08.md) (PCDT DPOC/Asma + correção escolas COFEN).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
