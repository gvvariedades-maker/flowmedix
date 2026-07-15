# Protocolo A4-mínimo — Doenças Bacterianas e Fúngicas (Onda paridade Adolescente)

Risco clínico **médio**: TB (BAAR, aerossóis, TDO), tétano, hanseníase, candidíase.

**Código:** [`lib/catalogMigration/bacterianasA4Minimo.ts`](../lib/catalogMigration/bacterianasA4Minimo.ts)  
**Guideline:** [`lib/guidelines/tuberculose.ts`](../lib/guidelines/tuberculose.ts) (`TUBERCULOSE_MS`)  
**Modelo:** [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

---

## Decisão

1. Claims sensíveis (notificação TB, BAAR, aerossóis, TDO, PPD, tétano, PQT hanseníase) → whitelist.
2. Fonte tier A: Manual MS TB (`tuberculose-ms`) + diretrizes hanseníase quando aplicável.
3. Agente: `agent:bacterianas-a4-minimo-v1`.
4. Amostra humana **~20% do tier `medio`** (`shouldSampleForHumanReview`).

## Eixos

| Eixo | Exemplos |
|------|----------|
| tb_vigilancia | Notificação compulsória, BAAR, contactantes, PPD |
| tb_transmissao | Aerossóis, bacilífero, máscara |
| tb_tratamento | TDO/DOT, 6 meses, esquema básico |
| tetano | dT/dTpa, profilaxia pós-exposição |
| hanseniase | PQT, paucibacilar, dermatoneurológico |
| candidiase | Candida oportunista — não confundir com TB |
| pegadinha | Contato pele, BCG×PPD, dispensar aerossóis |

## CLI

```bash
npm run stamp:a4-minimo -- --lote=doencas-bacterianas-g01
npm run stamp:a4-minimo -- --lote=doencas-bacterianas-g02
npm run stamp:a4-minimo -- --lote=doencas-bacterianas-g03
npm run stamp:a4-minimo -- --lote=doencas-bacterianas-g04
npm run stamp:a4-minimo -- --lote=doencas-bacterianas-g05
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Doenças Bacterianas"
npm run audit:subtopico-quality -- --subtopico="Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)"
```

> Use lotes `g01…g05` (handcraft). O manifest `doencas-bacterianas-completo` inclui slugs legados de outros subtópicos — **não** usar para stamp em massa.

## Escala L6 humano (37 slugs)

- L6 agent em lotes `g01…g05`.
- **1 âncora visual por ramo forte** — `data/catalog-migration/visual-anchors.json` (`bacterianas_tuberculose`, `bacterianas_agente_etiologico`, `bacterianas_generico`).

## Expandir whitelist

1. Entry em `TUBERCULOSE_MS` (ou guideline dedicado)
2. Claim em `BACTERIANAS_CLAIM_WHITELIST`
3. Teste Jest em `bacterianasA4Minimo.test.ts`
4. Revisão humana do claim novo
