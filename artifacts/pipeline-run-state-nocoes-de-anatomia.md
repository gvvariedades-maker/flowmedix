# Pipeline run-state — Noções de Anatomia

| Campo | Valor |
|-------|-------|
| pacote_prefix | `nocoes-de-anatomia` |
| mode | full |
| applied | 0/48 |
| production_status | none |
| next_unit | `l3_map:briefs` |
| Cap desta conversa | **0 — bootstrap DNA** (DONE) |
| blockers | — |
| updated_at | 2026-08-02T17:08:50.359Z |

## Cap 0 entregue

- Playbook + registry (`lote_size: 8`) + pacote completo 48 slugs
- Âncora FEPESE **[READY]** strict-v2 (`anatomia_terminologia`)
- `npm run cluster:nocoes-de-anatomia` (exige `questions/` exportado)

## Bloqueio operacional (não é `blockers[]` do run-state)

Cloud Agent sem `SUPABASE_*` reais → não exporta enunciados → não clusteriza → não fecha L3 INDEX.

## Próxima conversa (copiar)

```text
Continuar programa: Noções de Anatomia
@artifacts/pipeline-run-state-nocoes-de-anatomia.json

PRÉ-REQ: .env.local (ou Environment Cursor) com
NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY

OBJETIVO: Cap 1 — taxonomy gate + export + cluster + Mapeamento L3 Fase 3b
→ artifacts/l3-brief-nocoes-de-anatomia-INDEX.md
(1 gNN por conversa depois — pacote 48 ≥41)
```

## Completed

- bootstrap:dna-2026-08-02

⛔ Após concluir a unidade: atualizar este run-state e **não** iniciar a próxima no mesmo contexto.
