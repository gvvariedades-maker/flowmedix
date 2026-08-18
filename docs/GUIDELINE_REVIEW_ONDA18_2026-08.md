# Revisão de guidelines — Onda 18 (2026-08)

**Política:** só alterar com fonte oficial verificada.  
**Precedente:** [`GUIDELINE_REVIEW_ONDA17_2026-08.md`](GUIDELINE_REVIEW_ONDA17_2026-08.md)  
**Índice:** [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md)

## Escopo desta onda

Delta pós–modo residual (Onda 17): ISTs/PrEP/PEP + polish de URLs.

| Tabela | Achado | Ação |
|--------|--------|------|
| `ists.ts` | PrEP genérica “2025”; PEP só “72h” | Alinhar a **Portaria SCTIE/MS 55/2024** (PrEP oral: ≥15 a, ≥35 kg; diária com ataque 2 cp; sob demanda **2+1+1**) e **Portaria SECTICS/MS 14/2024** (PEP ≤72 h, **28 dias**) |
| `ists.ts` | — | Novos IDs: `prep-sob-demanda`, `prep-diaria-ataque` |
| `saudeAdolescente.ts` | URL genérica cadernetas | Apontar Caderneta Adolescente **4ª ed.** (gov.br) |
| `anatomiaBasica.ts` | URL raiz `/saude/` | Apontar hub A–Z (terminologia; sem claim novo) |
| `deepeningPlan.ts` | IST sources curtas | Incluir Portarias PrEP/PEP |

## Fontes oficiais

- [PCDT PrEP Oral](https://www.gov.br/saude/pt-br/assuntos/pcdt/p/profilaxia-pre-exposicao-prep-oral-a-infeccao-pelo-hiv) — Portaria SCTIE/MS nº 55/2024  
- [Central PCDTs HIV/AIDS](https://www.gov.br/aids/pt-br/central-de-conteudo/pcdts) — PEP Portaria SECTICS/MS nº 14/2024 (anexo atualizado 2025)  
- Caderneta Adolescente 4ª ed. — portal MS  

## IDs estáveis

Mantidos: `ist-pep-janela`, `prep-hiv`, `pegadinha-pep-prep` (valores/`detail` atualizados).  
Novos: `prep-sob-demanda`, `prep-diaria-ataque`.

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
