# Feridas e Queimaduras — onda nota-10 paridade Adolescente (2026-07-14)

Onda pedagógica pós-`production_ready` inicial: ramos L2.5/L3, A4-mínimo, ordem slides v2, guideline SCQ expandida, Playwright dedicado.

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **8/8** · vendável |
| `pedagogical_branch` | **8/8** (8 ramos L2.5) |
| A4-mínimo STAMPED | **8/8** (4 agente + **4 humano** `handcraft-qc`) |
| A4 humano substantivo | calc 100% + tier B alto + 1 amostra medio |
| Apply Supabase g01 | **8/8** aplicado |
| L6 checklist | g01 **pass** `handcraft-qc` + capture âncora ICECE |
| L3 visual | **18/18** Playwright PASS · 8 ramos · `summary.json` |
| Branch reconcile | **0 mismatch** |
| Health | **PASS** L1–L6 |

## A4 humano (4 — protocolar)

| Slug | Ramo | Motivo |
|------|------|--------|
| `idib-…6220-2` | `feridas_scq_calculo` | `family=calc` — SCQ 45% Wallace |
| `idecan-…3432-7` | `feridas_classificacao` | tier B + alto — ferida contaminada |
| `idecan-…3432-8` | `feridas_cicatrizacao` | tier B + alto — fases cicatrização |
| `idecan-…3432-9` | `feridas_curativo_tipo` | amostra 20% medio — bioativos |

## L3 ramos (distribuição no catálogo)

| Ramo | Slugs | Molde L3 |
|------|-------|----------|
| `feridas_grau_profundidade` | 1 | burn-depth-layer-deck + vertical |
| `feridas_scq_calculo` | 1 | burn-rule-nine-board |
| `feridas_scq_regra9` | 1 | burn-rule-nine-board |
| `feridas_grande_queimado` | 1 | burn-rule-nine-board |
| `feridas_atendimento_inicial` | 1 | burn-triage-tap-flow |
| `feridas_classificacao` | 1 | morphological + reference_table |
| `feridas_cicatrizacao` | 1 | morphological + reference_table |
| `feridas_curativo_tipo` | 1 | morphological + reference_table |

Briefs: [`l3-brief-feridas-e-queimaduras-INDEX.md`](l3-brief-feridas-e-queimaduras-INDEX.md)

## Paridade × Saúde do Adolescente

| Critério | Adolescente | Feridas e Queimaduras | Paridade |
|----------|-------------|----------------------|----------|
| Slugs handcraft applied | 16/16 | **8/8** | ✅ proporcional |
| `production_ready` | sim | sim | ✅ |
| Ramos L3 com ≥1 slug | 6/6 | **8/8** | ✅ |
| Brief INDEX + por ramo | sim | sim | ✅ |
| visual-anchors 1/ramo | 6 | **8** | ✅ |
| Playwright L3 PASS | 13/13 | **18/18** | ✅ |
| A4 100% stamped | 16/16 | **8/8** | ✅ |
| A4 humano substantivo | 3 | **4** (calc + alto + amostra) | ✅ |
| L6 + captures | g01+g02 | **g01** `handcraft-qc` | ✅ (pacote ≤20) |
| Branch reconcile 0 mismatch | sim | sim | ✅ |
| Apply Supabase 100% | 16/16 | **8/8** | ✅ |
| Relatório nota-10 | sim | sim | ✅ |

## Correções pedagógicas (onda)

- Ordem slides **v2**: concept_map → logic_flow → golden_rule → danger_zone
- Removido spoiler gabarito em `concept_map` / `golden_rule`
- Guideline MS expandida: SCQ distractors, grande queimado >26%, pegadinhas %
- `inferFeridasBranch()` + `BRANCH_DESIGN_MAP` em `pedagogicalBranch.ts`
- A4: `lib/catalogMigration/feridasA4Minimo.ts` + `PROTOCOLO_A4_MINIMO_FERIDAS.md`

## Comandos de referência

```bash
npx tsx scripts/patch-feridas-paridade-onda.ts
npx tsx scripts/stamp-feridas-a4-humano-qc.ts
npm run stamp:a4-minimo -- --lote=feridas-e-queimaduras-g01
npm run audit:anchor-review -- --lote=feridas-e-queimaduras-g01 --record-pass --reviewer=handcraft-qc --method=both
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Feridas e Queimaduras — moldes L3"
npm run catalog:apply-lote -- --lote=feridas-e-queimaduras-g01 --apply
npm run audit:subtopico-quality -- --subtopico="Feridas e Queimaduras" --promote
```

## Dívida residual (aceitável)

- URL legada `processo-de-enfermagem` em 4 slugs — `meta.subtopico` canônico OK
- `idecan-…3432-9` tem overlap temático com Curativos — mantido como ramo `feridas_curativo_tipo`
- Captures player completos nos 4 `handcraft-qc`: âncora L6 ICECE capturada; demais opcionais operacionais
