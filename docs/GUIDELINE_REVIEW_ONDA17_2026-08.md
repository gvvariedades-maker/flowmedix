# Revisão de guidelines — Onda 17 (2026-08)

**Política:** só alterar com fonte oficial verificada.  
**Precedente:** [`GUIDELINE_REVIEW_ONDA16_2026-08.md`](GUIDELINE_REVIEW_ONDA16_2026-08.md)  
**Índice:** [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md)

## Escopo desta onda

Auditoria residual pós-Onda 16 (spot-check, sem inventar números):

| Tabela | Achado | Ação |
|--------|--------|------|
| `biosseguranca.ts` | Protocolo 5 + NT 11/2025 já ancorados | Manter |
| `cme.ts` | RDC 15/2012 + nota RDC 1002/2025 já ok | Manter |
| `atencaoBasica.ts` | PNAB 2.436/2017 URL BVS ok | Manter |
| `potterPerryFundamentos.ts` | Tier B 11ª ed. 2024 — suporte, não norma | Manter |
| `cuidadosMedicamentos.ts` | COFEN 801/2026 URL ok | Manter |

Nenhuma alteração de fato nesta onda — confirmação de que o ciclo **1–16** está estável.

## Modo daqui pra frente (delta)

Reabrir handcraft de guideline **somente** quando:

1. Sai norma nova (PNI calendário, PCDT, NR, RDC, Res. COFEN, boletim MS com número de prova); ou  
2. `numeric-factcheck` / `audit:questao-readiness` apontar claim divergente; ou  
3. Humano pedir pacote específico.

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
