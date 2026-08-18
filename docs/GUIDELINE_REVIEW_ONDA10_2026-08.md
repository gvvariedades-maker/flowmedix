# Revisão de guidelines — Onda 10 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, Leis federais).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA9_2026-08.md`](GUIDELINE_REVIEW_ONDA9_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `promocaoSaude.ts` | Snapshot PNPS consolidada (**PRC 2/2017** Anexo I); temas prioritários; URL BVS | [PRC 2/2017](https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prc0002_03_10_2017.html) · Portaria 2.446/2014 · Lei 8.080 |
| `parasitariasZoonoses.ts` | Dengue **grupos A–D** + sinais de alarme (6ª ed.); raiva **leve/grave** + PEP 0/3/7/14 (NT 8/2022) | [Dengue 6ª ed.](https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/dengue/dengue-diagnostico-e-manejo-clinico-adulto-e-crianca) · [Fluxograma raiva](https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/raiva/fluxograma-da-profilaxia-da-raiva-humana-cartaz) |

## exam_vs_current

| Tema | Vigente | Prova antiga |
|------|---------|--------------|
| Exposição raiva | leve / grave (fluxograma MS) | categorias OMS I–III |
| Dengue | estadiamento A–B–C–D 6ª ed. | “DHF / DSS” clássico WHO antigo |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Princípios SUS / Ottawa | Estáveis na legislação e na Carta |
| Vetores (Aedes × Anopheles × flebotomíneo) | Consistentes com GVS |

## Onda 11

Concluída em [`GUIDELINE_REVIEW_ONDA11_2026-08.md`](GUIDELINE_REVIEW_ONDA11_2026-08.md) (mobilização + LPP 30° / NT 05/2023).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
