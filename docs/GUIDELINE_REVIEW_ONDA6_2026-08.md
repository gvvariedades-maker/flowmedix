# Revisão de guidelines — Onda 6 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, Anvisa, MTE).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA5_2026-08.md`](GUIDELINE_REVIEW_ONDA5_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `saudeMulher.ts` | Pré-natal **≥7 consultas** + odontologia; início ≤12 sem; sem alta até puerpério; pegadinha 4/6 vs 7 | [Caderneta Brasileira da Gestante](https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_brasileira_gestante.pdf) (MS 2026) |
| `pniCalendario.ts` | Esquema infantil **VPC20→VPC10→VPC20**; VIP reforços 15 m + **4 anos**; entry DNG4 | IN CNV 2026 · Guia Técnico VPC20 · Calendário criança/adolescente |
| `cme.ts` | URL RDC 15; IB diário + químico 5/6; Classe I/II; NT 105/2026 ainda cita RDC 15 | RDC Anvisa 15/2012 · NT conjunta 105/2026 |
| `enfermagemTrabalho.ts` | NR-32 consolidada 2022 / página 2025; PGR; imunização gratuita; RSS A–E | MTE NR-32 · Portaria MTP 4.219/2022 |

## exam_vs_current (prova antiga)

| Tema | Vigente | Prova antiga comum |
|------|---------|-------------------|
| Consultas pré-natal | ≥7 (Caderneta 2026) | 6 (AB 32) ou 4 (PHPN) |
| Pneumo infantil | VPC20 / VPC10 sequencial | 3× VPC10 (2-4-12) |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Periodicidade mensal/quinzenal/semanal pré-natal | Ainda alinhada ao Caderno AB 32 / cadernetas anteriores |
| RDC 15/2012 no CME hospitalar | Ainda vigente e citada em NT 2026; RDC 1002/2025 = odontologia |
| Autoclave 121 °C / 15 min (prova) | Parâmetro clássico; ciclos institucionais podem variar |

## Onda 7

Concluída em [`GUIDELINE_REVIEW_ONDA7_2026-08.md`](GUIDELINE_REVIEW_ONDA7_2026-08.md) (COFEN 736/2024, PNAB, oxigenoterapia).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
