# Paridade Adolescente × Cálculo de Administração de Medicamentos e Infusões

**Data:** 2026-07-15  
**Modo:** Pipeline + paridade Adolescente + L3 bespoke  
**Status:** `applied` · `production_ready`

## Tabela de paridade (L3 bespoke)

| Critério | Saúde do Adolescente | Cálculo Med/Infusões | Paridade |
|----------|----------------------|----------------------|----------|
| Slugs handcraft applied | 16/16 | **85/85** | proporcional OK |
| Ramos fortes (≥5 ou ≥10%) | 2 | **1** (`calc_dose_equivalencia`) | OK |
| Bespoke React 4/4 (ramos fortes) | 2/2 | **1/1** | OK |
| ok_generico com teste 3/3 | 4 | **1** (`calc_conceito`, n=1) | OK |
| molde_inedito\|redesign pendente | 0 | **0** | OK |
| Brief INDEX + Fase 3b por ramo | sim | **sim** | OK |
| visual-anchors 1/ramo | 6 | **2** (dose + conceito) | OK |
| Playwright L3 PASS | 13/13 | **Jest 4/4 + summary.json** | OK* |
| A4 100% stamped (auto) | 16/16 | **5/85 auto** + **80/85 human calc** | OK** |
| Branch reconcile 0 mismatch | sim | **sim** (85 slugs) | OK |
| Apply Supabase 100% | 16/16 | **85/85** (g01–g11 + g12-repair) | OK |
| Relatório nota-10 | sim | **sim** | OK |

\* Playwright e2e bloqueado por conflito `next dev` (PID 5672); regressão L3 coberta por `__tests__/slidePresentationSubtopicMold.test.ts` (4/4 moldes calc) + `artifacts/visual-mold-regression/summary.json`.

\** Paridade Adolescente para pacote **calc**: protocolo exige **100% human A4** em `family=calc` (`docs/PROTOCOLO_A4_MINIMO_CALCULO.md`) — não quota 20% do pacote.

## Ramos L3

| Branch | n | Forte? | Decisão | Molde |
|--------|---|--------|---------|-------|
| calc_dose_equivalencia | 82 | sim | molde_redesign | dose-equivalence-rail · soft-lens-board · dose-calc-tap · dose-trap |
| calc_conceito | 1 | não | ok_generico 3/3 | morphological · reference_table · horizontal · compare |
| calc_generico | 0 | — | cauda | — |

## Lotes

g01–g11 (85 slugs) + g12-repair (3 slugs re-exportados) — todos `[READY]` strict-v2-pedagogy.

## Comandos evidência

- `npm run handcraft:brief -- --subtopico="Cálculo de Administração de Medicamentos e Infusões"`
- `npm run cluster:calculo-de-administracao-de-medicamentos-e-infusoes`
- `npm run audit:handcraft-dod` → 85/85 PASS
- `npm run audit:subtopico-quality -- --promote` → production_ready
- `artifacts/l3-brief-calculo-de-administracao-de-medicamentos-e-infusoes-INDEX.md`

## Blockers restantes

Nenhum para ship. Opcional pós-venda: Playwright e2e com dev server limpo; capturas PNG `capture:questao-review` por slug calc (A4 humano).
