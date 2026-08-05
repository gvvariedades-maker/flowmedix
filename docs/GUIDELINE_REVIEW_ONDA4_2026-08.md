# Revisão de guidelines — Onda 4 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, Anvisa).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA3_2026-08.md`](GUIDELINE_REVIEW_ONDA3_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `segurancaPaciente.ts` | URL PNSP vigente; Protocolo Identificação (2 IDs, pulseira RN); 6 protocolos básicos; RDC 36/NSP | MS Segurança do Paciente · Protocolo Identificação · Avaliação Práticas Anvisa 2025 |
| `tuberculose.ts` | URL portal MS; transmissão = **aerossóis**; N95/PFF2; entry **TRM-TB** | Manual TB MS 2ª ed. (ainda vigente) · Anvisa Protocolo 5 |
| `saudeMental.ts` | Snapshot prevenção suicídio MS; CVV 188 parceria SUS; entry RAPS Port. 3.088/2011 | MS Suicídio (Prevenção) · Portaria 3.088/2011 · cartilha MS 2024 |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Manual TB 2ª ed. (2019) | Ainda é o manual nacional publicado no portal MS (atualizado na página em 2024) |
| Esquema RHZE 6 meses / TDO / sintomático ≥3 semanas | Sem nota técnica MS conflitante nesta onda |
| Conteúdo clínico RAPS/CAPS | Estrutura estável; expansão 2024 não muda competências TE |

## Onda 5

Concluída em [`GUIDELINE_REVIEW_ONDA5_2026-08.md`](GUIDELINE_REVIEW_ONDA5_2026-08.md) (virais + ISTs/PrEP).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
