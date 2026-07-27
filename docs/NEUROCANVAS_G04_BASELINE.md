# NeuroCanvas G0.4 — Baseline da fila editorial (pós-materialização)

> **Escopo deste documento:** alinhar as contagens do validador da fila editorial ao estado de `main` limpo após o PR #55.  
> **Não** fecha o gate editorial completo. **Não** autoriza Fase 0B, UI, renderer, piloto, Supabase nem `production_ready`.

## Relação com o #55

O PR [#55](https://github.com/gvvariedades-maker/flowmedix/pull/55) fechou o **subgate de reprodutibilidade/materialização G0.4** (aplicador versionado + 4 candidatos + autoridade).  
Este PR de baseline apenas torna a auditoria **consistente** com esse estado.

## Como medir (ambiente limpo)

```bash
git checkout main   # tip com merge 7633118b+
npm run neurocanvas:g04-apply-local   # idempotente se já aplicado
npm run neurocanvas:g04-repro
npm run audit:neurocanvas-blockers
npm run audit:neurocanvas-editorial-queue
```

## Contagens confirmadas (2026-07-27, main @ `7633118b`)

| Métrica | Baseline G0.3A (histórica) | Baseline G0.4 (atual) |
|---------|---------------------------:|----------------------:|
| unresolved / total_cases | 676 | **347** |
| clusters | 301 | **111** |
| official lane | 122 | **18** |
| manifest conflict lane | 6 | **6** |

Código canônico das contagens: [`lib/neurocanvas/editorialQueueBaselineG04.ts`](../lib/neurocanvas/editorialQueueBaselineG04.ts) · consumido por `validateEditorialQueueReport`.

## Invariantes explícitos (não negociáveis neste PR)

```json
{
  "editorial_readiness": "NOT_READY",
  "unresolved": 347,
  "phase_0b_ready": false
}
```

| Item | Estado |
|------|--------|
| AMEOSC | materializado; **A4 produção aprovada** (`production_approved: true`) — ver `artifacts/a4-production-ameosc-educa/` |
| EDUCA | materializado; item defeituoso; **A4 produção bloqueada** (D×B sem isolamento mastery/FSRS) — ver `artifacts/a4-production-ameosc-educa/` |
| Fênix / Noções de Anatomia | autoridade bootstrapped; `production_status: none` |
| IDECAN ×2 | `defer_official_provenance_pending` — sem promoção |

## Ordem depois desta baseline

Aprovação de produção e resolução editorial da fila são **gates diferentes**. O #56 alinha a medição; ainda não conclui o gate editorial completo.

1. **A4 de produção** AMEOSC/EDUCA — **parcial (2026-07-27):** AMEOSC aprovado; EDUCA bloqueado. Não reduz os 347 unresolved.  
2. **Fontes oficiais** dos dois IDECAN — aplicar/materializar; reduz **no máximo 2** unresolved.  
3. **Processar todos os demais casos** ainda presentes nas lanes official, pedagogical, metadata e residual.  
4. **Reexecutar a auditoria** até `unresolved = 0`.  
5. **Gerar baseline final** de fechamento editorial.  
6. **Só então** reavaliar e autorizar **explicitamente** a Fase 0B. 

## Explicitamente fora

UI · renderer · piloto · apply Supabase · promote `production_ready` · Fase 0B.
