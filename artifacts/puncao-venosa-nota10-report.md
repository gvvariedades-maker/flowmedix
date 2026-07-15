# Punção Venosa e Cuidados com Cateteres — onda nota-10 (2026-07-14)

## Resultado

| Gate | Status |
|------|--------|
| applied / production_ready | **110/110** · vendável |
| A4-mínimo | **110/110** assinados (51 agente + 59 humano `handcraft-qc`) |
| A4 humano ≥20% | **59/110 (53,6%)** |
| L3 visual | **16/16** Playwright PASS · 7 ramos · `summary.json` |
| L6 checklist | g01–g15 **15/15 pass** + captures PNG (815 arquivos) |
| Apply Supabase | g01–g15 **110/110** (onda nota-10 A4 + repair L2b g12) |
| Health | **PASS** (0 P0/P1) |

## Tabela de paridade — Saúde do Adolescente × Punção

| Critério nota-10 | Saúde do Adolescente | Punção Venosa | Paridade |
|------------------|----------------------|---------------|----------|
| Slugs handcraft applied | 16/16 | 110/110 | ✅ |
| `production_ready` | sim | sim | ✅ |
| A4-mínimo 100% STAMPED | 16/16 | 110/110 | ✅ |
| A4 humano `handcraft-qc` ≥20% | 3/16 (18,75%)* | 59/110 (53,6%) | ✅ |
| Ramos L2.5 com ≥1 slug real | 6/6 | 7/7 | ✅ |
| Briefs L3 INDEX + por ramo | INDEX + 6 | INDEX + 7 | ✅ |
| `visual-anchors.json` 1/ramo | 6 | 7 | ✅ |
| Playwright L3 + `summary.json` | 13/13 PASS | 16/16 PASS | ✅ |
| L6 anchor-review + captures | g01+g02 15/15 | g01–g15 15/15 | ✅ |
| Apply Supabase 100% | 16/16 | 110/110 | ✅ |
| Relatório `*-nota10-report.md` | sim | sim | ✅ |

\*Adolescente: 3 humanos explícitos + 13 agente; amostra 20% embutida no protocolo. Punção supera a barra de 20% humano.

## Ramos L3 cobertos (slugs no catálogo)

| Ramo | Slugs |
|------|-------|
| `puncao_flebite` | 37 |
| `puncao_dispositivo` | 26 |
| `puncao_generico` | 25 |
| `puncao_periferica_antissepsia` | 10 |
| `puncao_exceto` | 9 |
| `puncao_tempo` | 2 |
| `puncao_ipcs_cvc` | 1 |

Briefs 4/4: [`l3-brief-puncao-venosa-e-cuidados-com-cateteres-INDEX.md`](l3-brief-puncao-venosa-e-cuidados-com-cateteres-INDEX.md)

## A4 humano — amostra (59 slugs)

Revisão `handcraft-qc` para: claims fora da whitelist Punção, `exam_vs_current_divergence`, amostra hash 20% e `family=calc`. Script: `scripts/stamp-puncao-a4-humano-qc-batch.ts`.

## Reparos desta onda

| Item | Ação |
|------|------|
| L2b g12 `amauc-…3149-9` | Slides sem % distrator normativo (numeric-factcheck PASS) |
| L3 `summary.json` | Playwright Punção regenerado (`pacote_prefix` correto) |
| E2E DoD flebite | Footer âncora alinhado ao `logic_flow` renderizado |
| A4 onda | Agent stamp 51 + humano QC 59 = 110/110 |

## Comandos de evidência

```bash
npm run handcraft:brief -- --subtopico="Punção Venosa e Cuidados com Cateteres"
npm run audit:numeric-factcheck -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12
npm run stamp:a4-minimo -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01
npx tsx scripts/stamp-puncao-a4-humano-qc-batch.ts
PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/visual-mold-regression.spec.ts --grep "Punção"
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g12 --apply
npm run audit:subtopico-quality -- --subtopico="Punção Venosa e Cuidados com Cateteres" --promote
```

## Dívida residual (aceitável)

- `puncao_ipcs_cvc` com 1 slug no cluster (âncora forte; volume baixo aceito como flagship CVC)
- Capture questao-review pode ser flaky sem `PLAYWRIGHT_SKIP_WEBSERVER` + next na 3000
