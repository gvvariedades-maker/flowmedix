# NeuroCanvas G0.4 — Baseline da fila editorial (pós-IDECAN)

> **Escopo:** alinhar contagens do validador ao estado de `main` após proveniência oficial IDECAN (PR #59).  
> **Não** fecha o gate editorial completo. **Não** autoriza Fase 0B, UI, renderer, piloto, Supabase nem `production_ready`.

## Relação com PRs anteriores

| PR | Marco |
|----|--------|
| [#55](https://github.com/gvvariedades-maker/flowmedix/pull/55) | Subgate reprodutibilidade/materialização G0.4 — baseline **347/111/18/6** |
| [#59](https://github.com/gvvariedades-maker/flowmedix/pull/59) | Proveniência oficial IDECAN UFBA 2022 — 2 slugs coleta materializados |
| Este PR | Baseline **345/110/16/6** + `idecan_status: official_provenance_confirmed` |

## Como medir (ambiente limpo)

```bash
git checkout main   # tip @ 11561b7b+
npm run neurocanvas:g04-apply-local   # idempotente se já aplicado
npm run neurocanvas:g04-repro
npm run audit:neurocanvas-blockers
npm run audit:neurocanvas-editorial-queue
```

Catálogo completo em `data/catalog-migration/` (gitignored) — worktree com export local necessário.

## Contagens confirmadas (2026-07-27, main @ `11561b7b`)

| Métrica | G0.3A (hist.) | G0.4 pré-IDECAN | G0.4 atual |
|---------|-------------:|----------------:|-----------:|
| unresolved / total_cases | 676 | 347 | **345** |
| clusters | 301 | 111 | **110** |
| official lane | 122 | 18 | **16** |
| manifest conflict lane | 6 | 6 | **6** |

Código canônico: [`lib/neurocanvas/editorialQueueBaselineG04.ts`](../lib/neurocanvas/editorialQueueBaselineG04.ts).

## Invariantes explícitos (não negociáveis neste PR)

```json
{
  "editorial_readiness": "NOT_READY",
  "unresolved": 345,
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

## Ordem depois desta baseline

1. **Processar casos restantes** nas lanes official (16), pedagogical, metadata e residual.  
2. **Reexecutar auditoria** até `unresolved = 0`.  
3. **Gerar baseline final** de fechamento editorial.  
4. **Só então** reavaliar e autorizar **explicitamente** a Fase 0B.

## Explicitamente fora

UI · renderer · piloto · apply Supabase · promote `production_ready` · Fase 0B.
