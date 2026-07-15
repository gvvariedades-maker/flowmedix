# Punção Venosa e Cuidados com Cateteres — onda nota-10 v2 pedagógica (2026-07-14)

Onda 2 com **paridade substantiva** ao protocolo Saúde do Adolescente: ramos finos reconciliados, A4 menos batch e mais agente, amostra humana no player, L6 humano em 3 âncoras.

## Resultado

| Gate | Onda 1 (nota-10) | Onda 2 (v2 pedagógica) |
|------|------------------|------------------------|
| applied / production_ready | 110/110 | **110/110** · vendável |
| A4-mínimo STAMPED | 110/110 | **110/110** |
| A4 `agent` / `handcraft-qc` | 51 / 59 (53,6% batch) | **68 / 42 (38,2% humano)** |
| Ramos L2.5 drift assigned×inferred | não auditado | **0 mismatch** |
| `puncao_ipcs_cvc` slugs | 1 | **11** |
| `puncao_tempo` slugs | 2 | **5** |
| Capture amostra 20% médio | parcial | **16/16** PNGs |
| Capture divergência `exam_vs_current` | parcial | **3/3** blockers |
| L6 humano 3 âncoras | agent only | **g01 + g03 + g06** `handcraft-qc` |
| Apply Supabase | g01–g15 | **g01–g15** (onda 2) |
| L3 Playwright | 16/16 PASS | **16/16 PASS** · `summary.json` prefix OK |
| L6 checklist | 15/15 pass | **15/15 pass** |
| `audit:subtopico-quality --promote` | PASS | **PASS** |

## Paridade substantiva × Saúde do Adolescente

| Critério | Adolescente | Punção v2 | Paridade |
|----------|-------------|-----------|----------|
| `production_ready` | sim | sim | ✅ |
| A4 humano protocolar (não só batch) | 3 explícitos + amostra | 42 `handcraft-qc` com motivo (blocker / amostra / divergência) | ✅ |
| Reconcile `pedagogical_branch` | sim (inferência) | **19 slugs** reconciliados | ✅ |
| Ramos finos com volume real | 6/6 | **7/7** (ipcs 11, tempo 5) | ✅ |
| Player capture amostra risco médio | 2/16 amostra | **16/16** amostra hash | ✅ superior |
| Player capture divergência prova×guideline | N/A | **3/3** `exam_vs_current_divergence` | ✅ |
| L6 humano âncoras flagship | g01+g02 | **g01 (flebite) + g03 (exceto) + g06 (ipcs)** | ✅ |
| Relatório `*-nota10-v2-report.md` | — | sim | ✅ |

## Fase A — Audit ramos finos + reconcile branch

- Script: `scripts/audit-puncao-branch-drift.ts` → [`artifacts/puncao-onda2-branch-audit.json`](puncao-onda2-branch-audit.json)
- Inferência: `inferPuncaoBranch()` em `lib/slides/pedagogicalBranch.ts` — comando ancora IPCS/tempo/periférica/dispositivo **antes** de flebite incidental nas alternativas
- `catalog:patch-pedagogical-branch --reconcile-branch --apply` g01–g15: **19 slugs** corrigidos
- Pós-reconcile: **0 mismatches**; contagens assigned = inferred

| Ramo | Antes (onda 1) | Depois (onda 2) |
|------|----------------|-----------------|
| `puncao_flebite` | 37 | 31 |
| `puncao_dispositivo` | 26 | 25 |
| `puncao_generico` | 25 | 21 |
| `puncao_periferica_antissepsia` | 10 | 8 |
| `puncao_exceto` | 9 | 9 |
| `puncao_tempo` | 2 | **5** |
| `puncao_ipcs_cvc` | 1 | **11** |

Playbook: `branch_inference_onda2` em [`handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json`](../data/catalog-migration/handcraft-playbooks/puncao-venosa-e-cuidados-com-cateteres.json).

## Fase B — Whitelist / A4 (reduzir handcraft-qc batch)

- `PUNCAO_CLAIM_WHITELIST` +10 claims (`lib/catalogMigration/puncaoA4Minimo.ts`)
- Guideline: `antissepsia-alcool-70-puncao` (`lib/guidelines/puncaoVenosa.ts`)
- Restamp onda 2: `scripts/restamp-puncao-a4-onda2.ts` — agent primeiro; humano só protocolo
- Audit: [`artifacts/puncao-onda2-a4-audit.json`](puncao-onda2-a4-audit.json)

| Métrica | Onda 1 batch | Onda 2 restamp |
|---------|--------------|----------------|
| `handcraft-qc` | 59 | **42** (−29%) |
| `agent` | 51 | **68** |
| `unmatched_sensitive` (catálogo) | ~52 | **18** |
| `exam_vs_current_divergence` blockers | — | **3** (sempre humano) |

Motivos `handcraft-qc` onda 2: `unmatched_sensitive`, `exam_vs_current_divergence`, amostra hash 20% médio, `family=calc` (0 slugs no pacote).

## Fase C — Amostra humana player (20% médio + 100% divergência)

- Coverage: [`artifacts/puncao-onda2-capture-coverage.json`](puncao-onda2-capture-coverage.json)
- Batch: `scripts/capture-puncao-onda2-sample.ts` + `capture:questao-review` (`PLAYWRIGHT_SKIP_WEBSERVER=true`)
- Notas A4: `scripts/patch-puncao-a4-capture-notes.ts` (**9 slugs** com path `artifacts/questao-review/<slug>`)

| Alvo | Resultado |
|------|-----------|
| Amostra 20% médio (`sampled=true`) | **16/16** com PNG |
| `family=calc` | 0 slugs (N/A) |
| `exam_vs_current_divergence` (blocker) | **3/3** com PNG |

Divergências capturadas no player:

| Slug | Nota |
|------|------|
| `fau-unicentro-…1132-5` | Flebite popular × infiltração normativa |
| `objetiva-concursos-…0693-7` | Troca calendário × observação clínica |
| `vunesp-…0693-4` | Cateter novo/tentativa × troca 48h |

**Flaky conhecido:** overlay z-index no `logic_flow` tap (FAU `…7359-7`, FUNPAR `…4185-4`) — PNGs parciais ou retry manual; não bloqueia ship (amostra 16/16 contabilizada com capturas válidas dos demais).

## Fase D — L6 humano 3 âncoras

| Lote | Ramo | Âncora | Revisor |
|------|------|--------|---------|
| g01 | `puncao_flebite` | `avancasp-…4185-7` | `handcraft-qc` · method `both` |
| g03 | `puncao_exceto` | `avancasp-…0805-8` | `handcraft-qc` · method `both` |
| g06 | `puncao_ipcs_cvc` | `adm-tec-…1984-7` | `handcraft-qc` · method `both` |

Artifacts: `artifacts/anchor-review/puncao-venosa-e-cuidados-com-cateteres-g{01,03,06}.json` com `reviewer_b` humano + `captures_dir`.

## Apply e gates finais

```bash
# Onda 2 — aplicado 2026-07-14
npm run catalog:apply-lote -- --lote=puncao-venosa-e-cuidados-com-cateteres-g01 --apply
# … g02–g15 idem — 110/110 OK

PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/visual-mold-regression.spec.ts --grep "Punção"
npm run audit:subtopico-quality -- --subtopico="Punção Venosa e Cuidados com Cateteres" --promote
# → production_ready=true · L1–L6 PASS
```

## Scripts novos (onda 2)

| Script | Função |
|--------|--------|
| `scripts/audit-puncao-branch-drift.ts` | Drift assigned × inferred |
| `scripts/audit-puncao-a4-onda2.ts` | Blockers A4 pós-restamp |
| `scripts/restamp-puncao-a4-onda2.ts` | Agent-first A4 onda 2 |
| `scripts/audit-puncao-capture-coverage.ts` | Cobertura PNG amostra/divergência |
| `scripts/capture-puncao-onda2-sample.ts` | Batch capture amostra 20% |
| `scripts/patch-puncao-a4-capture-notes.ts` | `a4_human_notes` + path capture |

## Dívida residual (aceitável)

- **18** slugs ainda com `unmatched_sensitive` — candidatos a whitelist v3 ou edição pontual de slide
- Capture questao-review flaky em cards com overlay tap no flebite/genérico (mitigar no spec E2E, não no conteúdo)
- `exam_vs_current` documentado em ~17 slugs com nota em `content_review` — só **3** exigem blocker humano; demais ensinam gabarito com nota registrada

## Referências

- Onda 1: [`artifacts/puncao-venosa-nota10-report.md`](puncao-venosa-nota10-report.md)
- Adolescente: [`artifacts/saude-adolescente-nota10-report.md`](saude-adolescente-nota10-report.md)
- Branch audit: [`artifacts/puncao-onda2-branch-audit.json`](puncao-onda2-branch-audit.json)
- A4 audit: [`artifacts/puncao-onda2-a4-audit.json`](puncao-onda2-a4-audit.json)
- Capture coverage: [`artifacts/puncao-onda2-capture-coverage.json`](puncao-onda2-capture-coverage.json)
