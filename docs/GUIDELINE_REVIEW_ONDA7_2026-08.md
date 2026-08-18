# Revisão de guidelines — Onda 7 (2026-08)

**Política:** só alterar com fonte oficial verificada (COFEN, MS).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA6_2026-08.md`](GUIDELINE_REVIEW_ONDA6_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `saeCofen.ts` | **Res. COFEN 736/2024** (revoga 358/2009); etapas Avaliação→…→Evolução; TE = anotação + implementação + checagem; privativas = diagnóstico + prescrição | [COFEN 736/2024](https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/) |
| `atencaoBasica.ts` | URL Portaria **2.436/2017**; ESF como estratégia prioritária; AB = 1º ponto/RAS | PNAB Portaria GM/MS 2.436/2017 |
| `oxigenoterapia.ts` | Snapshot/ano alinhados à página CONITEC atualizada 2024; números de fluxo/FiO₂ estáveis | Portaria SCTIE/MS 33/2021 · CONITEC Cap. 1 |

## exam_vs_current (prova antiga)

| Tema | Vigente (736/2024) | Prova antiga (358/2009) |
|------|--------------------|-------------------------|
| Etapa 1 | Avaliação de Enfermagem | Coleta de dados / histórico |
| Etapa 5 | Evolução de Enfermagem | Avaliação |
| SAE × PE | Distintos conceitualmente | Frequentemente sinônimos |

ID da tabela `sae-cofen-358` **mantido** (sourceIds nos goldens).

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| PNAB 2.436/2017 | Ainda a política nacional vigente na consolidação MS |
| Fluxos CNA 1–6 L, Venturi, etc. | Parâmetros técnicos estáveis (CONITEC + POPs HU 2025) |

## Onda 8

Concluída em [`GUIDELINE_REVIEW_ONDA8_2026-08.md`](GUIDELINE_REVIEW_ONDA8_2026-08.md) (ITU-AC, LPP NT 05/2023, Lista NC 2026, VSR/menACWY).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
