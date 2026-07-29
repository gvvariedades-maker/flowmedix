# FSRS MVP — staging beta go/no-go (scrubbed)

**Data:** 2026-07-29T19:58Z  
**Branch:** `fix/fsrs-staging-beta-loop`  
**PR:** [#73](https://github.com/gvvariedades-maker/flowmedix/pull/73)

## Veredito

| Escopo | Decisão |
|--------|---------|
| **Staging beta** | **GO** — FSRS MVP 100% funcional no staging beta |
| **Default-on global** | **NO-GO** |
| **Production** | permanece `FSRS_MVP_ENABLED` off |

Não declarar "globalmente em produção".

## Evidências

### CI (PR #73)

[Workflow run](https://github.com/gvvariedades-maker/flowmedix/actions/runs/30479911722)

| Job | Resultado |
|-----|-----------|
| `fsrs-rpc-integration` | SUCCESS |
| `test-unit` / `test-e2e` / `typecheck` / `architecture-check` / `build` | SUCCESS |
| `perf-smoke` | FAILURE (pré-existente / fora do escopo FSRS) |
| Vercel Preview build | FAILURE — OOM SIGKILL (8 GB); UI host staging ainda em deploy antigo |

### Smoke staging (RPC → card/log/revision/due_at)

Fonte scrubbed: `artifacts/fsrs-mvp-staging-smoke-summary.md`  
Detalhe local (gitignored): `artifacts/fsrs-mvp-staging-smoke-report.md` (`synthetic: true`)

| Gate | Status |
|------|--------|
| Seed via `fsrs_persist_review` (nunca INSERT) | PASS |
| 1 log / `attempt_id` + retry idempotente | PASS |
| revision 1 → 2 | PASS |
| `due_at` avança | PASS |
| Inventário real | PASS |

### Ops live (`npm run fsrs:ops-report`)

Artefato local (gitignored): `artifacts/fsrs-mvp-ops-<YYYYMMDD>.md`

| Métrica | Valor |
|---------|-------|
| Cards brutos | 1 |
| Logs brutos | 2 |
| Cards/logs sintéticos | 1 / 2 |
| Cards/logs negócio (sintéticos excluídos) | **0 / 0** |
| Acerto D+7 | `insufficient_window` |
| Acerto D+14 | `insufficient_window` |
| Volume negócio ≥ 50 | unknown (0) |

Sintéticos identificáveis (`fsrs_mvp_synthetic_smoke` / sidecar / e-mail smoke) e **excluídos** das métricas de negócio.

## Por que default-on = NO-GO

- D+7/D+14 sem janela madura → `insufficient_window` (não é sucesso).
- Volume de negócio < 50 reviews elegíveis.
- Isso **não** bloqueia funcionalidade técnica do beta; bloqueia ligar default-on.

## Rollback

```bash
# Preview staging e/ou Production
FSRS_MVP_ENABLED=false
```

Production já está off (flags ausentes).

## Caveat UI

Deploy alias `staging` no Vercel ainda aponta build pré-FSRS (OOM no `next build`).  
**GO cobre:** banco staging + código na branch (RPC, freemium, fila, Playwright FSRS, ops).  
**Fora deste GO:** UI no host `flowmedix-git-staging` até build machine maior / pipeline prebuilt.

## Comandos

```bash
npm run fsrs:ops-report -- --production-off
npm run fsrs:staging-smoke -- --dry-run
npm test -- --testPathPattern=opsReport
```
