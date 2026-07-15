# Infecções no Contexto da Biossegurança — onda nota-10 (2026-07-15)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **25/25** vendável |
| Apply Supabase | **25/25** (g01–g04, dry-run 100% OK antes de cada --apply) |
| L3 bespoke ramos fortes | **biosseg_generico** 4/4 implementado (molde_inedito) |
| L3 ITU (cauda) | **biosseg_iras_itu_cateter** 4/4 (itu-*, pré-existente) |
| Fase 0b gate | **0 pendências** em ramos fortes |
| Numeric L2b | **PASS** (guideline +70% HH, SF 0,9%) |
| L6 anchor-review | g01–g04 **pass** |
| Playwright | **12 passed** (chromium + Mobile Chrome); summary.json `pass: true` |

## Paridade com Saúde do Adolescente

| Dimensão | Adolescente nota-10 | Biossegurança nota-10 |
|----------|---------------------|------------------------|
| Slugs | 16 | 25 |
| Ramos L3 bespoke | 6 | 2 (1 ramo forte + 1 ITU) |
| Handcraft golden-v1 | 100% | 100% |
| L6 anchor-review | todos g* | g01–g04 |
| Playwright bloco dedicado | sim | sim |
| Relatório paridade | sim | este arquivo |

## Checklist paridade (+ L3 bespoke)

| applied | bespoke 4/4 ramos fortes | ok_generico 3/3 | A4 substantivo | Playwright | L6 | apply | production_ready | paridade | blockers |
|---------|--------------------------|-----------------|----------------|------------|-----|-------|------------------|----------|----------|
| 25/25 | 1/1 biosseg_generico | N/A (ramo forte) | piloto opcional | PASS | pass | 25/25 | sim | **100%** | **0** |

## Moldes L3

| Ramo | concept | golden | logic | danger | decisão |
|------|---------|--------|-------|--------|---------|
| biosseg_generico (23 slugs) | biosseg-precaution-deck | biosseg-reference-board | biosseg-vf-juggle-tap | biosseg-trap-chips | molde_inedito |
| biosseg_iras_itu_cateter (2) | itu-closed-system-rail | itu-bundle-letter-board | itu-exceto-tap | itu-catheter-trap | ok_existente |

Briefs: `artifacts/l3-brief-infeccoes-biosseguranca-INDEX.md`

## Reparo pós-ship (g03)

- **Slug:** `objetiva-concursos-enfermagem-infeccoes-no-contexto-da-biosseguranca-1777102719125-1`
- **Causa:** `biosseg-vf-juggle-tap` bloqueava `family: legis` (Portaria 2.616/1998) antes do guard `onHome`.
- **Fix:** remover `legis` de `blockFamilies` em `moldAffinity.ts` (IRAS cita portarias com frequência).
- **Preflight g03:** 8/8 → apply 8/8.

## Comandos de verificação

```bash
npm run audit:subtopico-quality -- --subtopico="Infecções no Contexto da Biossegurança"
npm run audit:l3-mold-gap -- --subtopico="Infecções no Contexto da Biossegurança"
PLAYWRIGHT_SKIP_WEBSERVER=true BASE_URL=http://localhost:3000 npx playwright test e2e/visual-mold-regression.spec.ts --grep "Infecções no Contexto da Biossegurança"
```
