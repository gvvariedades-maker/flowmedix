# Revisão de guidelines — Onda 19 (2026-08)

**Política:** só alterar com fonte oficial verificada.  
**Precedente:** [`GUIDELINE_REVIEW_ONDA18_2026-08.md`](GUIDELINE_REVIEW_ONDA18_2026-08.md)  
**Índice:** [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md)

## Escopo desta onda

Delta **IN Calendário Nacional de Vacinação 2026** + alinhamento raiva MS + Saúde Mental (Lei 10.216 / RAPS).

| Tabela | Achado | Ação |
|--------|--------|------|
| `pniCalendario.ts` | SCRV “padrão” aos 15 m | CNV 2026: **SCR 2ª** aos 15 m; **varicela mono** 15 m + 4 a; tetraviral só se mono indisponível (`exam_vs_current`) |
| `pniCalendario.ts` | Sem menACWY aos 12 m | Novo ID `meningo-acwy-12meses` |
| `pniCalendario.ts` | VIP só 15 m; rótulos “2025” | Reforços **15 m e 4 a**; labels CNV 2026 |
| `pniCalendario.ts` | Covid lactente “2 doses 0,25 mL” | Rotina **3 doses** RNAm; volume pediátrico genérico + `exam_vs_current` |
| `pniCalendario.ts` | Raiva com categorias OMS I–III | Alinhar a **leve/grave** (fluxograma MS + NT 8/2022) |
| `parasitariasZoonoses.ts` | “conforme categoria” | Texto leve/grave |
| `saudeMental.ts` | URL só suicídio | Hub **RAPS/DESMAD**; detalhe Lei **10.216** (3 modalidades + art. 4º); novo `sm-lei-10216-principios` |

## Fontes oficiais

- [IN Calendário Nacional de Vacinação 2026](https://www.gov.br/saude/pt-br/vacinacao/publicacoes/instrucao-normativa-que-instrui-o-calendario-nacional-de-vacinacao-2026.pdf)  
- [Calendário Técnico PNI](https://www.gov.br/saude/pt-br/composicao/svsa/pni/calendario-tecnico)  
- [Fluxograma profilaxia raiva humana](https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/raiva/fluxograma-da-profilaxia-da-raiva-humana-cartaz) · NT 8/2022-CGZV  
- [RAPS — MS/DESMAD](https://www.gov.br/saude/pt-br/composicao/saes/desmad/raps) · [Lei 10.216/2001](https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10216.htm)

## IDs estáveis

Mantidos: `scr-2-dose-scrv`, `varicela-calendario`, `raiva-pep-conceito`, `covid-crianca-6m`, `covid-spikevax-lactente`, `rota-2025`, `vip-reforco-2025`, `sm-internacao-involuntaria`.  
Novos: `meningo-acwy-12meses`, `sm-lei-10216-principios`.

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
