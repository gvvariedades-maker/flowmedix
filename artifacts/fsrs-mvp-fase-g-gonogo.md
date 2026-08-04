# FSRS MVP — Fase G staging go/no-go (atualizado pós-smoke + ops live)

**Data:** 2026-07-29T19:58Z  
**Projeto DB:** `[REDACTED_PROJECT_REF]` (Preview/staging compartilha o mesmo Postgres)

## Veredito

| Escopo | Decisão |
|--------|---------|
| **Staging beta** | **GO** — FSRS MVP 100% funcional no staging beta |
| **Default-on global** | **NO-GO** (D+7/D+14 `insufficient_window`; volume negócio 0) |
| Production flags | **off** |

## Fase F (merge série) — DONE

| PR | Título | Merged |
|----|--------|--------|
| #68 | R2 persistência atômica | 2026-07-29T02:32:54Z |
| #69 | R3 attempt_id + scheduling | 2026-07-29T02:47:24Z |
| #70 | R4 revisões-hoje beta | 2026-07-29T03:01:37Z |
| #71 | R5 ops report | 2026-07-29T03:15:08Z |

Follow-up: PR [#73](https://github.com/gvvariedades-maker/flowmedix/pull/73) (`fix/fsrs-staging-beta-loop`).

## Fase G — checklist

| Item | Status |
|------|--------|
| Apply remoto FSRS (migration spaced_review_fsrs_mvp) | DONE |
| `FSRS_MVP_ENABLED=true` Preview staging | DONE |
| Production flags | omitidas / off |
| Ops dry-run | `artifacts/fsrs-mvp-ops-<YYYYMMDD>-dry-run.md` |
| Ops live (pós-smoke, sintéticos excluídos) | `artifacts/fsrs-mvp-ops-<YYYYMMDD>.md` — gross 1/2; negócio 0/0; D+7/D+14 `insufficient_window` |
| Smoke RPC + jornada | PASS — `artifacts/fsrs-mvp-staging-smoke-report.md` |
| CI FSRS PR #73 | `fsrs-rpc-integration` + unit/e2e SUCCESS ([workflow](https://github.com/gvvariedades-maker/flowmedix/actions/runs/30479911722)) |
| UI host staging redeploy | **BLOCKED** — Vercel OOM |

## Rollback

`FSRS_MVP_ENABLED=false` (Preview e Production).

## Artefato scrubbed versionável

Ver `artifacts/fsrs-mvp-staging-beta-gonogo.md`.
