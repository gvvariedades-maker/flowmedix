# FSRS MVP — baseline seguro (2026-07-29)

**Branch de trabalho:** `fix/fsrs-staging-beta-loop` (criada a partir de `origin/main`)  
**Não versionar:** `fsrs-apply-query.txt`, `fsrs-mvp-apply-payload.json`, ops live, checklists Fase G com refs de projeto.

## Refs

| Ref | SHA | Nota |
|-----|-----|------|
| `origin/main` | `f88ed5d4` | Merge PR #71 (R5 ops) |
| `origin/staging` | `f88ed5d4` | **igual a main** |

PRs FSRS mergeados em main: **#68** (R2), **#69** (R3), **#70** (R4), **#71** (R5). Sem reabrir/reescrever essa pilha.

## Migration

| Item | Status |
|------|--------|
| Arquivo em main | `supabase/migrations/20260728040000_spaced_review_fsrs_mvp.sql` |
| Remoto (`schema_migrations`) | `20260728040000` presente |
| Tabelas | `spaced_review_cards`, `spaced_review_logs` |
| RLS | ON; 5 policies |
| RPC `fsrs_persist_review` | existe; EXECUTE: anon=false, authenticated=false, service_role=true |

## Contagens (staging / Preview DB)

| Métrica | Valor |
|---------|-------|
| Cards | **0** |
| Logs | **0** |

## Flags Vercel (`flowmedix`)

| Variável | Preview (`staging`) | Production |
|----------|---------------------|------------|
| `FSRS_MVP_ENABLED` | presente (branch `staging`) | **ausente → off** |
| `FSRS_MVP_BETA_EMAILS` | presente (branch `staging`) | **ausente → off** |

Produção permanece default-off. Sem default-on global.

## CI — job `fsrs-rpc-integration`

| Contexto | Run | Resultado |
|----------|-----|-----------|
| PR #71 (R5) | [30418581270](https://github.com/gvvariedades-maker/flowmedix/actions/runs/30418581270) | **success** (~2m27s) |
| Push main pós-#71 | [30419071156](https://github.com/gvvariedades-maker/flowmedix/actions/runs/30419071156) | **success** (falha do workflow = `perf-smoke` pré-existente; FSRS passou) |

Job permanece no workflow sem `skip`; apply só da migration FSRS em stack local.

## Artefatos locais sensíveis — escopo

| Arquivo | Achado |
|---------|--------|
| `artifacts/fsrs-apply-query.txt` | **ausente** (não encontrado) |
| `artifacts/fsrs-mvp-apply-payload.json` | **ausente** (não encontrado) |
| `artifacts/fsrs-mvp-ops-20260729.md` | live 0/0; sem e-mail/JWT/UUID pessoal — **gitignored** |
| `artifacts/fsrs-mvp-ops-20260729-dry-run.md` | dry-run; já coberto por `*dry-run*` |
| `artifacts/fsrs-mvp-fase-g-*.md` | checklist/go-no-go local — **gitignored** (podem citar ref de projeto) |

`.gitignore` atualizado para bloquear payloads apply + ops/fase-g FSRS.

## Veredito baseline

- main === staging em `f88ed5d4`
- Migration FSRS aplicada; inventário vazio (0/0)
- Preview beta flags on; Production off
- `fsrs-rpc-integration` verde no PR #71 e no push main
- Pronto para o follow-up de código na branch `fix/fsrs-staging-beta-loop` (sem migration nova)
