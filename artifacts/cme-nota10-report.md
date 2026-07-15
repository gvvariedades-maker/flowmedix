# Enfermagem em Central de Material e Esterilização (CME) — onda nota-10 paridade Adolescente (2026-07-14)

Onda pedagógica pós-`production_ready` (2026-06-30): A4-mínimo substantivo, L3 briefs, ramos L2.5, spoiler v2, Playwright dedicado, apply onda 2.

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **35/35** · vendável |
| `pedagogical_branch` | **35/35** patched · **5/5** ramos com ≥1 slug |
| A4-mínimo STAMPED | **35/35** (26 agente + 9 `handcraft-qc`) |
| Readiness strict-v2 | **35/35** `[READY]` |
| golden_rule spoiler v2 | **35/35** reparados |
| Apply Supabase onda 2 | g01–g05 **35/35** |
| L6 checklist | g01–g05 **pass** · `audit:anchor-review --record-pass` |
| L3 visual | **11/11** Playwright PASS · `summary.json` prefix `cme` |
| Health / promote | **PASS** L1–L6 |

## Paridade Adolescente × CME

| Critério | Saúde do Adolescente | CME | Paridade |
|----------|----------------------|-----|----------|
| Slugs handcraft applied | 16/16 | **35/35** | ✅ |
| `production_ready` | sim | sim | ✅ |
| Ramos L3 com ≥1 slug | 6/6 | **5/5** | ✅ |
| Brief INDEX + por ramo | sim | **sim** · [`l3-brief-cme-INDEX.md`](l3-brief-cme-INDEX.md) | ✅ |
| visual-anchors 1/ramo | 6 | **5** · catálogo CME | ✅ |
| Playwright L3 PASS | 13/13 | **11/11** | ✅ |
| A4 100% stamped | 16/16 | **35/35** | ✅ |
| A4 humano substantivo (sem quota fake) | 3 + amostra | **9** (8 blockers + 1 amostra medio) | ✅ |
| Player PNG = slugs handcraft-qc | piloto | captures_dir âncoras g01–g05 | ✅ |
| L6 + captures | g01+g02 | **g01–g05** agent pass + 5 âncoras visuais | ✅ |
| Branch reconcile 0 mismatch | sim | **0 mismatch** (patch inicial) | ✅ |
| Apply Supabase 100% | 16/16 | **35/35** onda 2 | ✅ |
| Relatório nota-10 | sim | **este arquivo** | ✅ |

## Ramos L3 cobertos

| Ramo | Slugs |
|------|-------|
| `cme_autoclave_metodos` | 14 |
| `cme_generico` | 8 |
| `cme_vf_ce` | 8 |
| `cme_preparo_limpeza` | 4 |
| `cme_processamento_conceito` | 1 |

Briefs: [`artifacts/l3-brief-cme-INDEX.md`](l3-brief-cme-INDEX.md)

## A4 humano (9 — protocolo substantivo)

| Slug | Motivo |
|------|--------|
| `ameosc-…1580-0` | `unmatched_sensitive` |
| `avancasp-…4111-7` | `unmatched_sensitive` |
| `fenix-…6202-3` | `unmatched_sensitive` |
| `fenix-…7061-1` | `unmatched_sensitive` |
| `idecan-…1105-6` | `unmatched_sensitive` |
| `igecap-…3191-5` | `unmatched_sensitive` |
| `instituto-iacp-…3454-7` | `unmatched_sensitive` |
| `instituto-iacp-…9182-4` | `exam_vs_current_divergence` |
| `fcpc-…6875-6` | amostra 20% medio |

**Não** aplicada quota artificial 20% do total (7 slugs).

## Reparos desta onda

| Item | Ação |
|------|------|
| `pedagogical_branch` ausente | `catalog:patch-pedagogical-branch` cme-completo + g01–g05 |
| Spoiler v2 | `repair:cme-golden-spoiler` — 35 golden_rule + concept_map |
| A4-mínimo | `lib/catalogMigration/cmeA4Minimo.ts` + `auto_approval` registry |
| Protocolo A4 | `docs/PROTOCOLO_A4_MINIMO_CME.md` |
| L3 briefs | `artifacts/l3-brief-cme-INDEX.md` + 5 ramos |
| visual-anchors | 5 âncoras catálogo CME em `visual-anchors.json` |
| Playwright | bloco dedicado CME em `e2e/visual-mold-regression.spec.ts` |
| numeric A2b | `ameosc-…1580-2` — removido "2%" sem fonte na guideline |

## L6 humano (escala média — 1 âncora/ramo)

| Ramo | Âncora visual | Lote |
|------|---------------|------|
| `cme_generico` | `idecan-…1105-2` | g01 |
| `cme_autoclave_metodos` | `ameosc-…1580-2` | g04 |
| `cme_vf_ce` | `ameosc-…1580-0` | g02 |
| `cme_preparo_limpeza` | `fcpc-…6875-6` | g04 |
| `cme_processamento_conceito` | `cpcon-uepb-…8364-3` | g01 |

## Dívida residual (aceitável)

- Segmento URL legado (`processo-de-enfermagem` no slug) — meta `subtopico` canônico OK
- `summary.json` único (último pacote Playwright) — gate L3 lê `pacote_prefix=cme` após regressão CME
- Checklist humano L6 item-a-item opcional — automated pass + âncoras visuais cobrem escala média

## Comandos de referência

```bash
npm run handcraft:brief -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
npm run catalog:export-lote -- --lote=cme-completo --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
npm run catalog:patch-pedagogical-branch -- --lote=cme-completo --apply
npm run repair:cme-golden-spoiler -- --lote=cme-completo --write
npm run stamp:a4-minimo -- --lote=cme-completo
npx tsx scripts/stamp-cme-a4-humano-qc.ts
npm run audit:questao-readiness -- --lote=cme-completo --strict-v2-pedagogy
npm run audit:anchor-review -- --lote=cme-g01 --record-pass
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Enfermagem em Central de Material"
npm run catalog:apply-lote -- --lote=cme-g01 --apply
npm run audit:subtopico-quality -- --subtopico="Enfermagem em Central de Material e Esterilização (CME)"
```
