# Vias de Administração — onda nota-10 (2026-07-14)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **208/208** · vendável |
| A4-mínimo | **208/208** assinados (`a4_reviewed`) |
| A4 humano `handcraft-qc` | **42/208** (20,2%) com `a4_human_notes` |
| Ramos L2.5 com slug real | **3/3** (`via_vf_absorcao` 98 · `via_tecnica_admin` 85 · `via_generico` 24) |
| Briefs L3 INDEX | [`l3-brief-vias-de-administracao-INDEX.md`](l3-brief-vias-de-administracao-INDEX.md) |
| visual-anchors.json | 3/3 ramos em `data/catalog-migration/visual-anchors.json` |
| Playwright L3 | **8/8 PASS** · [`summary-vias-de-administracao.json`](visual-mold-regression/summary-vias-de-administracao.json) |
| L6 anchor-review | **26/26 pass** · `captures_dir` preenchido (PNG questao-review) |
| Apply Supabase | **26/26 lotes** dry-run OK + `--apply` OK (g01–g26) |
| `audit:subtopico-quality --promote` | **PASS** L1–L6 · `artifacts/subtopico-quality/vias-de-administracao.json` |

## Tabela de paridade — Saúde do Adolescente × Vias

| Critério nota-10 | Saúde do Adolescente | Vias de Administração | Paridade |
|------------------|----------------------|------------------------|----------|
| Slugs handcraft applied | 16/16 | 208/208 | ✅ |
| `production_ready` | sim | sim | ✅ |
| A4-mínimo 100% stamped | 16/16 | 208/208 | ✅ |
| A4 humano ≥20% | 3/16 (18,8%) | 42/208 (20,2%) | ✅ |
| Ramos L3 no mapa | 6 | 3 | ✅ (escopo do pacote) |
| ≥1 slug real por ramo | 6/6 | 3/3 | ✅ |
| Brief L3 INDEX + por ramo | INDEX + 6 briefs | INDEX + 3 briefs | ✅ |
| visual-anchors 1/ramo | 6 | 3 | ✅ |
| Playwright dedicado + summary | 13 testes · `summary-saude-adolescente.json` | 8 testes · `summary-vias-de-administracao.json` | ✅ |
| L6 `record-pass` + captures PNG | g01+g02 · 15 checklist | g01–g26 · 26 checklist | ✅ |
| Apply Supabase 100% | 16/16 | 208/208 (26 lotes) | ✅ |
| Relatório nota-10 | `saude-adolescente-nota10-report.md` | este arquivo | ✅ |

## A4 humano — amostra (42 slugs)

Política: `shouldSampleForHumanReview` (tier médio 20%) + quota determinística até 20% do pacote. Revisor: `handcraft-qc` + `a4_human_notes`.

Script: `npm run stamp:vias-a4-nota10` → `scripts/stamp-vias-a4-nota10-batch.ts`

Slugs com `family=calc` ou blockers A4 → humano obrigatório (subset dos 42).

## L3 ramos cobertos

`via_vf_absorcao` (bespoke React: speed-rail · reference-board · vf-juggle · route-trap) · `via_tecnica_admin` (genérico premium) · `via_generico` (genérico premium)

Briefs 4/4 por ramo: [`l3-brief-vias-de-administracao-INDEX.md`](l3-brief-vias-de-administracao-INDEX.md)

## Comandos de evidência (onda 2026-07-14)

```bash
npm run handcraft:brief -- --subtopico="Vias de Administração"
npm run cluster:vias-de-administracao
npm run stamp:vias-a4-nota10
npm run test:e2e:visual-molds -- --grep "Vias de Administração"
npm run catalog:apply-lote -- --lote=vias-de-administracao-g01 --dry-run   # ×26 OK
npm run catalog:apply-lote -- --lote=vias-de-administracao-g01 --apply       # ×26 OK
npm run audit:subtopico-quality -- --subtopico="Vias de Administração" --promote
```

## Dívida residual (aceitável)

- `via_tecnica_admin` permanece molde genérico (decisão P1 documentada no INDEX) — bespoke só se drift visual futuro
- Cluster report legado: 235 slugs no relatório vs 208 handcraft (manifest filtrado)
- Capture questao-review pode ser flaky sem dev server na porta 3000

## Artefatos-chave

| Artefato | Path |
|----------|------|
| Handcraft brief | `artifacts/handcraft-brief-Vias-de-Administracao.md` |
| L3 INDEX | `artifacts/l3-brief-vias-de-administracao-INDEX.md` |
| Playwright summary | `artifacts/visual-mold-regression/summary-vias-de-administracao.json` |
| Quality gate | `artifacts/subtopico-quality/vias-de-administracao.json` |
| Registry | `data/catalog-migration/handcraft-registry.json` § Vias de Administração |
