# Protocolo A4-mínimo — Saúde Mental (Onda paridade Adolescente)

Risco clínico **médio**: RAPS/CAPS, risco suicida, crise/de-escalada, dependência, contenção.

**Código:** [`lib/catalogMigration/saudeMentalA4Minimo.ts`](../lib/catalogMigration/saudeMentalA4Minimo.ts)  
**Guideline:** [`lib/guidelines/saudeMental.ts`](../lib/guidelines/saudeMental.ts)  
**Modelo:** [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

---

## Decisão

1. Claims sensíveis (CAPS, suicídio, contenção, Lei 10.216, PNCT) → whitelist.
2. Fonte tier A com `covers` (`saude-mental-ms`, Portaria 3.088/2011).
3. Agente: `agent:saude-mental-a4-minimo-v1`.
4. Amostra humana **~20% do tier `medio`** (`shouldSampleForHumanReview`) — **sem** quota artificial de 20% do pacote.

## Eixos

| Eixo | Exemplos |
|------|----------|
| raps | Reforma Psiquiátrica, RAPS, SRT |
| caps | TM graves → CAPS, dispositivo territorial |
| suicidio | Ideação, CVV 188, avaliação de risco |
| crise | De-escalada, agitação, contenção proporcional |
| dependencia | CAPS AD, PNCT, redução de danos |
| acolhimento | Biopsicossocial, escuta, depressão/PHQ |
| pegadinha | Hospital rotina, contenção 1ª linha, “perguntar induz” |

## CLI

```bash
npm run enrich:saude-mental-guideline-meta -- --lote=saude-mental-completo --write
npm run stamp:a4-minimo -- --lote=saude-mental-completo
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Saúde Mental"
npm run audit:subtopico-quality -- --subtopico="Saúde Mental"
```

## Escala L6 humano (37 slugs — pacote médio)

- L6 agent em todos os lotes `micro-01…07`.
- **1 âncora visual humana por ramo** forte (6 ramos) — ver `data/catalog-migration/visual-anchors.json`.

## Expandir whitelist

1. Entry em `SAUDE_MENTAL_MS`
2. Claim em `SAUDE_MENTAL_CLAIM_WHITELIST`
3. Teste Jest em `saudeMentalA4Minimo.test.ts`
4. Revisão humana do claim novo
