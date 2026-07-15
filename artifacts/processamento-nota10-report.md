# Processamento de Artigos e Produtos de Saúde — onda nota-10 (2026-07-14)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **18/18** · vendável |
| Manifest ↔ registry | **18/18** alinhado (`reconcile:handcraft-manifest` OK) |
| Cluster | **5 ramos** · `artifacts/processamento-topic-cluster-report.json` |
| A4-mínimo | **18/18** assinados (11 agente + 7 humano `handcraft-qc`) |
| Apply Supabase | g01 **8/8** + g02 **10/10** aplicados (2026-07-14) |
| L6 checklist | g01+g02 **pass** · captures PNG preenchidos |
| L3 visual | **11/11** Playwright PASS · 5 ramos · `summary.json` |
| Health | **PASS** (gates L1–L6) |

## A4 humano (7 — amostra 39%)

| Slug | Motivo |
|------|--------|
| `idecan-…3076-7` | Spaulding / criticidade — amostra 20% |
| `cotec-fadenor-…9285-7` | VF assertivas — amostra 20% |
| `avancasp-…1246-7` | Finalidade material estéril — amostra 20% |
| `quadrix-…1546-8` | VF I–III — amostra 20% |
| `amauc-…3305-0` | OPA × glutaraldeído (alto risco numérico) |
| `ameosc-…1798-9` | Certo/errado CME |
| `cotec-fadenor-…9285-8` | Autoclave 121 °C/15 min |

## Reparos desta onda

| Item | Ação |
|------|------|
| `pedagogical_branch` ausente | Mapa L2.5 + `catalog:patch-pedagogical-branch` + cobertura 5 ramos |
| Spoiler v2 | `repair:processamento-concept-spoiler` — concept_map + golden_rule |
| A4-mínimo | `lib/catalogMigration/processamentoA4Minimo.ts` + `auto_approval` no registry |
| L3 briefs | `artifacts/l3-brief-processamento-INDEX.md` + 5 ramos |
| visual-anchors | 5 âncoras catálogo real em `visual-anchors.json` |
| Export local | `processamento-completo/questions/` 18 JSONs (base nota-10) |

## L3 ramos cobertos

`cme_processamento_conceito` (4) · `cme_preparo_limpeza` (2) · `cme_autoclave_metodos` (1) · `cme_vf_ce` (10) · `cme_generico` (1)

Briefs: [`l3-brief-processamento-INDEX.md`](l3-brief-processamento-INDEX.md)

## Paridade com Saúde do Adolescente

| Dimensão | Adolescente nota-10 | Processamento nota-10 |
|----------|---------------------|------------------------|
| Slugs | 16 | 18 |
| A4-mínimo onda | sim | sim |
| Protocolo A4 | `PROTOCOLO_A4_MINIMO_ADOLESCENTE.md` | `PROTOCOLO_A4_MINIMO_PROCESSAMENTO.md` |
| Guideline TS | `saudeAdolescente.ts` | `cme.ts` |
| auto_approval registry | sim | sim |
| L3 briefs INDEX + ramos | 6/6 | 5/5 |
| Ramos com ≥1 slug catálogo | 6/6 | 5/5 |
| Playwright PNG + summary | sim | sim |
| L6 captures PNG | sim | sim |
| Relatório nota-10 | `saude-adolescente-nota10-report.md` | este arquivo |

## Dívida residual (aceitável)

- Segmento URL legado (`processo-de-enfermagem` no slug) — meta `subtopico` canônico OK
- DoD 375px footer em mold-review omitido (10 regressões desktop+mobile por ramo cobrem L3)

## Comandos de referência

```bash
npm run handcraft:brief -- --subtopico="Processamento de Artigos e Produtos de Saúde"
npm run cluster:processamento
npm run repair:processamento-concept-spoiler -- --lote=processamento-completo --write
npm run catalog:patch-pedagogical-branch -- --lote=processamento-completo --apply
npm run stamp:a4-minimo -- --lote=processamento-completo
npx tsx scripts/stamp-processamento-a4-humano-qc.ts
npm run audit:anchor-review -- --lote=processamento-g01 --record-pass
npm run audit:anchor-review -- --lote=processamento-g02 --record-pass
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Processamento de Artigos"
npm run catalog:apply-lote -- --lote=processamento-g01 --apply
npm run catalog:apply-lote -- --lote=processamento-g02 --apply
npm run audit:subtopico-quality -- --subtopico="Processamento de Artigos e Produtos de Saúde"
```
