# Revisão de guidelines — Onda 9 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, Anvisa, COFEN; SBPC/ML tier B).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA8_2026-08.md`](GUIDELINE_REVIEW_ONDA8_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `perioperatorio.ts` | Snapshot 2026; URL Protocolo Cirurgia Segura; Sign Out = sair da **sala**; ISC **30 d / 90 d com implante**; portes COFEN 1–4; ATB ≤60 min; vedação ato cirúrgico (NT COFEN 779/2025) | [Protocolo Cirurgia Segura](https://www.gov.br/saude/pt-br/composicao/saes/seguranca-do-paciente/protocolos-de-seguranca-do-paciente/protocolo-cirurgia-segura.pdf) · [Protocolo ISC](https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/Protocolo2PreveodeISCFINAL.pdf) · NT GVIMS 03/2026 · Parecer COFEN 1/2024 |
| `feridasQueimaduras.ts` | Cartilha MS **2012** (BVS); grave adulto **>20%** SCQ; palma ≈1%; critérios de gravidade | [Cartilha queimaduras](https://bvsms.saude.gov.br/bvs/publicacoes/cartilha_tratamento_emergencia_queimaduras.pdf) |
| `coletaExames.ts` | Perfurocortantes → **RDC 222/2018 grupo E** (corrige “RDC 30/04”); SBPC/ML 2ª ed. mantida (sem edição nacional mais nova) | RDC 222/2018 · SBPC/ML 2010 |

## exam_vs_current

| Tema | Vigente | Prova antiga |
|------|---------|--------------|
| ISC com implante | até **90 dias** | 1 ano (CDC legado) |
| Porte III | **4–6 h** (COFEN) | faixas “3–6 h” |
| Grande queimado adulto | 2º grau **>20%** SCQ | “>26%” em alguns gabaritos |

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Ordem de tubos SBPC/ML | 2ª ed. 2010 ainda é a referência nacional citada; alinhada a CLSI |
| Regra dos 9 / graus 1–3 | Consistentes com cartilha MS |
| Aldrete / jejum 8 h–2 h | Estáveis na prática perioperatória TE |

## Onda 10

Concluída em [`GUIDELINE_REVIEW_ONDA10_2026-08.md`](GUIDELINE_REVIEW_ONDA10_2026-08.md) (PNPS consolidada + dengue A–D + raiva leve/grave).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
