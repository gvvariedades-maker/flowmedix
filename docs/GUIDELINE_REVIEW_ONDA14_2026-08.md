# Revisão de guidelines — Onda 14 (2026-08)

**Política:** só alterar com fonte oficial verificada (MTE/NR-32, IFAA).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA13_2026-08.md`](GUIDELINE_REVIEW_ONDA13_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `enfermagemTrabalho.ts` | Corrige Anexo I (classes 1–4); PPRA×PGR; dispositivos de segurança perfurocortantes | [NR-32 MTE](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadoras/norma-regulamentadora-no-32-nr-32) (atualizada 03/01/2025; texto Portaria MTP 4.219/2022) |
| `anatomiaBasica.ts` | Snapshot Terminologia Anatômica IFAA (conceitos estáveis) | Terminologia Anatômica |

## Mantido (já alinhado)

| Tema | Motivo |
|------|--------|
| NR-32 imunização hepatite B / PGR / CAT | Já citava Portaria MTP e página MTE 2025 |
| Terminologia anatômica pares | Conceitos estáveis |

## Recap ondas 8–14 (esta sequência)

| Onda | Foco |
|------|------|
| 8 | ITU-AC, LPP, Lista NC 2026, VSR/menACWY |
| 9 | Cirurgia segura / ISC 90 d, queimaduras >20%, RDC 222 |
| 10 | PNPS, dengue A–D, raiva leve/grave |
| 11 | Mobilização LPP 30° |
| 12 | 5 momentos HM |
| 13 | PCDT DPOC/Asma + escolas enfermagem COFEN |
| 14 | NR-32 Anexos/PGR + anatomia snapshot |

## Onda 15

Concluída em [`GUIDELINE_REVIEW_ONDA15_2026-08.md`](GUIDELINE_REVIEW_ONDA15_2026-08.md) · índice em [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
