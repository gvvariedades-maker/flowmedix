# História da Enfermagem — onda nota-10 + paridade L3 Adolescente (2026-07-14)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **20/20** · vendável |
| `pedagogical_branch` | **20/20** (4 ramos L2.5) |
| A4-mínimo | **20/20** (16 agente + **4 humano** `handcraft-qc`) |
| Apply Supabase | `historia-enfermagem-completo` — aplicado nesta onda |
| L6 checklist | g01–g04 **pass** |
| L3 visual | **9/9** Playwright PASS · 4 ramos · `summary.json` |
| Briefs L3 | **4/4** + INDEX |
| Health | **PASS** (gates L1–L6) |

## A4 humano (4 — amostra 20%)

| Slug | Ramo | Motivo |
|------|------|--------|
| `funcepe-…5950-4` | `historia_comunicacao_etica` | Âncora ética/comunicação |
| `idecan-…2855-0` | `historia_nightingale` | Marcos SUS / Revolta da Vacina |
| `instituto-consulpam-…9428-2` | `historia_humanizacao` | V/F humanização I–IV |
| `idib-…3952-1` | `historia_generico` | Teorias administrativas |

## L3 ramos (distribuição)

| Ramo | Slugs |
|------|-------|
| `historia_humanizacao` | 8 |
| `historia_comunicacao_etica` | 5 |
| `historia_nightingale` | 4 |
| `historia_generico` | 3 |

Briefs: [`l3-brief-historia-enfermagem-INDEX.md`](l3-brief-historia-enfermagem-INDEX.md)

## Paridade com Saúde do Adolescente

| Dimensão | História |
|----------|----------|
| `pedagogicalBranch.ts` + inferência | sim |
| Briefs L3 INDEX 4/4 | sim |
| `handcraft-meta.json` + cluster report | sim |
| Playwright 4 ramos + summary | sim (9/9) |
| A4 humano 20% | sim (4/20) |
| Moldes React bespoke | não (pacote premium genérico — adequado ao volume) |

## Comandos de referência

```bash
npm run catalog:patch-pedagogical-branch -- --lote=historia-enfermagem-completo --reconcile-branch --apply
npm run stamp:a4-minimo -- --lote=historia-enfermagem-completo
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "História"
npm run audit:subtopico-quality -- --subtopico="História da Enfermagem"
npm run catalog:apply-lote -- --lote=historia-enfermagem-completo --apply
```
