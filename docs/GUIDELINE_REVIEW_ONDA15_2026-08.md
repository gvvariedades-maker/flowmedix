# Revisão de guidelines — Onda 15 (2026-08)

**Política:** só alterar com fonte oficial verificada (Anvisa, ISMP-Brasil).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA14_2026-08.md`](GUIDELINE_REVIEW_ONDA14_2026-08.md)  
**Índice:** [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `calculoMedicamentos.ts` | KCl periférico **≤40 mEq/L**; velocidade sem bolus; URL Protocolo Anvisa medicamentos; citação ISMP-Brasil | [Protocolo medicamentos](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/protocolo-de-seguranca-na-prescricao-uso-e-administracao-de-medicamentos) · ISMP-Brasil KCl |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| 20 gts/mL · 60 microgts/mL | Constante de equipo padrão em provas BR |
| Regra % → mg/mL (×10) | Matemática farmacêutica estável |
| ADME / alta vigilância em `farmacodinamica.ts` | Já revisado em ondas anteriores |

## Onda 16

Concluída em [`GUIDELINE_REVIEW_ONDA16_2026-08.md`](GUIDELINE_REVIEW_ONDA16_2026-08.md).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
