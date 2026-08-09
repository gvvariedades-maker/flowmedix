# Revisão de guidelines — Onda 13 (2026-08)

**Política:** só alterar com fonte oficial verificada (CONITEC/MS, COFEN, SBC/SBD).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA12_2026-08.md`](GUIDELINE_REVIEW_ONDA12_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `respiratorioCronico.ts` | PCDT **DPOC 2025**; espirometria VEF₁/CVF <0,70; SpO₂ <92% → gasometria; LTOT SpO₂ **<88%** / ≥15 h; asma PCDT 2023/2026 | [PCDT DPOC](https://www.gov.br/conitec/pt-br/midias/protocolos/pcdt-da-doenca-pulmonar-obstrutiva-cronica) · PCDT Asma |
| `historiaEnfermagem.ts` | **Corrige** Anna Nery ≠ 1ª escola 1890; Alfredo Pinto **1890**; Anna Nery escola **1923**; datas Anna Nery; CEPE **564/2017**; hepatite B Sinan 36,8% (boletim 2024) | [COFEN escolas](https://www.cofen.gov.br/raizes-historicas-da-profissao-primeiras-escolas-de-enfermagem-no-brasil/) · [Anna Nery 210 anos](https://www.cofen.gov.br/imortal-hoje-anna-nery-completa-210-anos/) |
| `historiaA4Minimo.ts` | Canonical escolas alinhado ao COFEN | idem |
| `fisiologiaBasica.ts` | PA → DBHA/SBC; glicemia → SBD/MS | DBHA · SBD |

## exam_vs_current

| Tema | Vigente (oficial) | Prova antiga / erro |
|------|-------------------|---------------------|
| 1ª escola BR | Alfredo Pinto **1890** | “Anna Nery / Eulália 1890” |
| Escola Anna Nery | **1923** (modelo Nightingale) | “primeira escola 1890” |
| Hepatite B % Sinan | 36,8% (2000–2023) · ~36,6% (2000–2024) | arredondamentos |

## Onda 14

Concluída em [`GUIDELINE_REVIEW_ONDA14_2026-08.md`](GUIDELINE_REVIEW_ONDA14_2026-08.md) (NR-32 Anexo I/PGR + anatomia).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
