# NeuroCanvas G0.4 — Baseline da fila editorial (pós-manifest L1)

> **Escopo:** alinhar contagens do validador ao estado de `main` após manifest conflict L1 (PR #61).  
> **Não** fecha o gate editorial completo. **Não** autoriza Fase 0B, UI, renderer, piloto, Supabase nem `production_ready`.

## Relação com PRs anteriores

| PR | Marco |
|----|--------|
| [#55](https://github.com/gvvariedades-maker/flowmedix/pull/55) | Subgate reprodutibilidade/materialização G0.4 — baseline **347/111/18/6** |
| [#59](https://github.com/gvvariedades-maker/flowmedix/pull/59) | Proveniência oficial IDECAN UFBA 2022 — 2 slugs coleta materializados |
| [#60](https://github.com/gvvariedades-maker/flowmedix/pull/60) | Baseline **345/110/16/6** + `idecan_status: official_provenance_confirmed` |
| [#61](https://github.com/gvvariedades-maker/flowmedix/pull/61) | Manifest conflict L1 — 6 casos reconciliados |
| Este PR | Baseline **339/104/11/0** |

## Como medir (ambiente limpo)

```bash
git checkout main   # tip @ cf840997+
npm run neurocanvas:g04-manifest-l1   # idempotente se já aplicado
npm run neurocanvas:g04-repro
npm run audit:neurocanvas-blockers
npm run audit:neurocanvas-editorial-queue
```

Catálogo completo em `data/catalog-migration/` (gitignored) — worktree com export local necessário.

## Contagens confirmadas (2026-07-27, main @ `cf840997`)

| Métrica | G0.3A (hist.) | G0.4 pré-IDECAN | G0.4 pós-IDECAN | G0.4 atual |
|---------|-------------:|----------------:|----------------:|-----------:|
| unresolved / total_cases | 676 | 347 | 345 | **339** |
| clusters | 301 | 111 | 110 | **104** |
| official lane | 122 | 18 | 16 | **11** |
| manifest conflict lane | 6 | 6 | 6 | **0** |

Código canônico: [`lib/neurocanvas/editorialQueueBaselineG04.ts`](../lib/neurocanvas/editorialQueueBaselineG04.ts).

## Partição exaustiva dos 339 unresolved

Lanes de revisão **sobrepostas** (official + pedagogical + metadata) não somam ao total. Partição **mutuamente exclusiva** por severidade e trilho:

| Bucket | Contagem | Descrição |
|--------|----------|-----------|
| `official_lane` | 11 | S3 ou divergência de gabarito — fonte oficial |
| `manifest_conflict` | 0 | Encerrado no L1 |
| `pedagogical_s2_slide` | 84 | S2 com diff em slides, sem official |
| `s2_non_slide_residual` | 170 | S2 sem lane pedagogical (metadados/taxonomia) |
| `metadata_s1` | 74 | S1 apenas |
| **Total** | **339** | |

Gerado por `npm run neurocanvas:g04-unresolved-partition` → `artifacts/neurocanvas-unresolved-partition.json`.

## Invariantes explícitos (não negociáveis neste PR)

```json
{
  "editorial_readiness": "NOT_READY",
  "unresolved": 339,
  "phase_0b_ready": false,
  "idecan_status": "official_provenance_confirmed"
}
```

| Item | Estado |
|------|--------|
| AMEOSC | materializado; **A4 produção aprovada** |
| EDUCA | materializado; item defeituoso; **A4 produção bloqueada** |
| Fênix / Noções de Anatomia | autoridade bootstrapped; `production_status: none` |
| IDECAN ×2 (coleta UFBA 2022) | **proveniência oficial confirmada** — encerrado |
| Manifest conflict L1 | **6 casos reconciliados** — lane zerada |

## Ordem depois desta baseline

1. **Official lane (11)** — proveniência por banca (sem materialização sem autorização).  
2. **s2_non_slide_residual (170)** — trilho de reconciliação metadata/taxonomia.  
3. **pedagogical_s2_slide (84)** + **metadata_s1 (74)**.  
4. **Reexecutar auditoria** até `unresolved = 0`.  
5. **Baseline final** de fechamento editorial → **só então** Fase 0B.

## Explicitamente fora

UI · renderer · piloto · apply Supabase · promote `production_ready` · Fase 0B.
