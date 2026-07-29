# Decisão — `types/database.ts` no R2 FSRS MVP

**Status:** confirmada (PR #68 / `feat/fsrs-mvp-r2-persistence`)  
**Spec:** [`R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md`](R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md) §13.2  
**Data:** 2026-07-28

## Decisão

Neste PR R2 **não** versionamos tipos gerados das tabelas/RPC FSRS:

| Artefato | Ação no R2 |
|----------|------------|
| `types/database.ts` | **Intocado** — continua hand-curated (legado); **proibido** editar à mão para FSRS |
| `types/database.supabase.snapshot.ts` | **Intocado** — snapshot canônico via `npm run check:db-types -- --update` (`supabase gen types typescript --linked`) exige projeto **remoto linkado** |
| Snapshot forjado | **Proibido** — sem apply remoto da migration (§14), não inventar diff |

## Por quê

1. O gate canônico de drift (`scripts/check-database-types-drift.ts`) gera types com `--linked` (remoto), não `--local`.
2. R2 **não** aplica a migration no projeto remoto — só local/CI (`supabase db reset --local`).
3. Forjar o snapshot localmente criaria drift falso contra o remoto ainda sem FSRS.
4. Diff amplo em `types/database.ts` / snapshot alheio ao FSRS deve ser PR separado (§13.2 item 5).

## Gate de presença no CI (sem versionar)

O job `fsrs-rpc-integration` gera types **locais** após `db reset` e falha se faltarem os símbolos FSRS:

```bash
npx supabase gen types typescript --local | tee /tmp/fsrs-db-types.ts
grep -q spaced_review_cards /tmp/fsrs-db-types.ts
grep -q spaced_review_logs /tmp/fsrs-db-types.ts
grep -q fsrs_persist_review /tmp/fsrs-db-types.ts
```

Isso prova que a migration local expõe o schema; **não** substitui o snapshot remoto.

## Quando atualizar o snapshot

Após autorização explícita de **apply remoto** da migration FSRS (staging/produção):

```bash
npm run check:db-types -- --update
```

Revisar o diff; se houver drift alheio ao FSRS, separar PR.
