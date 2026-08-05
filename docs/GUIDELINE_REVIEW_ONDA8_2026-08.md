# Revisão de guidelines — Onda 8 (2026-08)

**Política:** só alterar com fonte oficial verificada (Anvisa, MS, NPIAP).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA7_2026-08.md`](GUIDELINE_REVIEW_ONDA7_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `sondas.ts` | Protocolo Anvisa **ITU-AC 2025**; definição ITU-AC (>2 dias); bundle indicação/assépsia/sistema fechado/retirada | [Protocolo 3 ITU](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/Protocolo3PrevenodeITUFINAL.pdf) · NT 11/2025 |
| `curativos.ts` | Anvisa **NT 05/2023** LPP; nomenclatura lesão por pressão; LPP por dispositivo | NT GVIMS 05/2023 · NPIAP 2019 · Protocolo PNSP |
| `epidemiologia.ts` | Lista Nacional **2026** (Portarias 10.175 e 11.211); anomalias congênitas, caxumba, Oropouche | [Notificação compulsória MS](https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria) |
| `pniCalendario.ts` | VSR gestante ≥28 sem / cada gestação; menACWY aos **11 anos** (atraso até 14a11m29d) | Calendário Técnico Gestante/Adolescente **2026** |

## exam_vs_current

| Tema | Vigente | Prova antiga |
|------|---------|--------------|
| UPP × LPP | Lesão por pressão | Úlcera por pressão |
| Covid na lista NC | Item reorganizado (síndrome gripal/SRAG) | Covid-19 como linha isolada |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Estágios LPP I–IV / Braden ≤18 | Consistentes com NPIAP e protocolo PNSP |
| Técnica SNG NEX / RX confirmação | Estável na prática TE |
| Conceitos incidência/prevalência/surto | Estáveis no Guia de Vigilância |

## Onda 9

Concluída em [`GUIDELINE_REVIEW_ONDA9_2026-08.md`](GUIDELINE_REVIEW_ONDA9_2026-08.md) (Cirurgia segura/ISC 90 d, queimaduras MS >20%, RDC 222 coleta).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
