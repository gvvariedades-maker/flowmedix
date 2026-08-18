# Índice — revisão de guidelines (agosto 2026)

Política: alterar só com fonte oficial (MS, Anvisa, COFEN, CONITEC, MTE, SBC…).  
IDs estáveis (`sourceId`); divergências de prova em `exam_vs_current` no `detail`.

| Onda | Relatório | Pacotes / correções-chave |
|------|-----------|---------------------------|
| 1 | [ONDA1](GUIDELINE_REVIEW_ONDA1_2026-08.md) | Urgências AHA/ILCOR 2025; PNI; CME RDC |
| 2 | [ONDA2](GUIDELINE_REVIEW_ONDA2_2026-08.md) | Mulher DNA-HPV; SV DBHA; Vias COFEN 801; Punção |
| 3 | [ONDA3](GUIDELINE_REVIEW_ONDA3_2026-08.md) | RDC 222 A–E; HPV dose única; adolescente/criança |
| 4 | [ONDA4](GUIDELINE_REVIEW_ONDA4_2026-08.md) | PNSP; TB; Saúde Mental |
| 5 | [ONDA5](GUIDELINE_REVIEW_ONDA5_2026-08.md) | Virais; ISTs PrEP |
| 6 | [ONDA6](GUIDELINE_REVIEW_ONDA6_2026-08.md) | Gestante ≥7 consultas; VPC20; VIP; CME; NR-32 |
| 7 | [ONDA7](GUIDELINE_REVIEW_ONDA7_2026-08.md) | COFEN 736/2024; PNAB; O₂ CONITEC |
| 8 | [ONDA8](GUIDELINE_REVIEW_ONDA8_2026-08.md) | ITU-AC; LPP NT 05/2023; Lista NC 2026; VSR/menACWY |
| 9 | [ONDA9](GUIDELINE_REVIEW_ONDA9_2026-08.md) | ISC 30/90 d; portes COFEN; queimadura >20%; RDC 222 |
| 10 | [ONDA10](GUIDELINE_REVIEW_ONDA10_2026-08.md) | PNPS; dengue A–D; raiva leve/grave |
| 11 | [ONDA11](GUIDELINE_REVIEW_ONDA11_2026-08.md) | Mobilização LPP 30° |
| 12 | [ONDA12](GUIDELINE_REVIEW_ONDA12_2026-08.md) | 5 momentos HM |
| 13 | [ONDA13](GUIDELINE_REVIEW_ONDA13_2026-08.md) | PCDT DPOC/Asma; escolas COFEN (1890≠1923) |
| 14 | [ONDA14](GUIDELINE_REVIEW_ONDA14_2026-08.md) | NR-32 Anexo I / PGR |
| 15 | [ONDA15](GUIDELINE_REVIEW_ONDA15_2026-08.md) | Cálculo KCl ISMP/Anvisa + índice |
| 16 | [ONDA16](GUIDELINE_REVIEW_ONDA16_2026-08.md) | Caderneta 6ª ed.; pezinho 48h–5d; TRM-TB; COFEN 801 URL |
| 17 | [ONDA17](GUIDELINE_REVIEW_ONDA17_2026-08.md) | Spot-check residual → **modo delta** |
| 18 | [ONDA18](GUIDELINE_REVIEW_ONDA18_2026-08.md) | IST: PrEP 55/2024 (≥15a/35kg, 2+1+1); PEP 14/2024 (72h/28d) |
| 19 | [ONDA19](GUIDELINE_REVIEW_ONDA19_2026-08.md) | CNV 2026: SCR/varicela, menACWY 12m, covid 3d; raiva leve/grave; Lei 10.216 |
| 20 | [ONDA20](GUIDELINE_REVIEW_ONDA20_2026-08.md) | Influenza 2026 (janela/Norte); COFEN 801 Art. 3º elementos |

## Gates canônicos

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```

Último audit desta sequência: **55** tabelas · **1569** entries · 0 sem guideline (`audit:guideline-coverage`).
