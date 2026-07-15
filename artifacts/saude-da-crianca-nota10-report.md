# Saúde da Criança — onda nota-10 (2026-07-15)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **62/62** · vendável |
| Manifest ↔ registry | **62/62** (`reconcile:handcraft-manifest` OK) |
| Cluster | **drift=0** |
| A4-mínimo | stamp 62/62 + 6 humano `handcraft-qc` |
| Apply Supabase | g01–g08 **62/62** aplicados |
| L6 checklist | **8/8 lotes** anchor pass |
| L3 visual | **7/7 branches** · Playwright **16/16** PASS |
| Health | **PASS** (L1–L6) |

## L3 ramos bespoke (7)

`crianca_aleitamento_nutricao` · `crianca_triagem_neonatal` · `crianca_generico` · `crianca_desidratacao` · `crianca_aps_puericultura` · `crianca_neonatologia` · `crianca_desenvolvimento`

Briefs: [`l3-brief-saude-da-crianca-INDEX.md`](l3-brief-saude-da-crianca-INDEX.md)

## Paridade com Saúde do Adolescente

| Dimensão | Adolescente | Saúde da Criança |
|----------|-------------|------------------|
| Slugs | 16 | 62 |
| Lotes gNN | 2 | 8 |
| A4-mínimo | sim | sim |
| Guideline TS | sim | sim |
| L3 bespoke ramos | 6 | 7 |
| L3 Playwright | sim | sim |
| L6 all lotes | sim | sim |

## Comandos de referência

```bash
npm run plan:saude-da-crianca-lote-meta
npm run apply:saude-da-crianca-ready-batch
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Saúde da Criança"
npm run audit:subtopico-quality -- --subtopico="Saúde da Criança" --promote
```
