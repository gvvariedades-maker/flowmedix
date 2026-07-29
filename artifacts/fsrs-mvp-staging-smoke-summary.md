# FSRS MVP — staging smoke (scrubbed)

**Data:** 2026-07-29  
**Branch código:** `fix/fsrs-staging-beta-loop`  
**synthetic:** true  
**Go/no-go:** `artifacts/fsrs-mvp-staging-beta-gonogo.md` → **GO staging beta** / **NO-GO default-on**

## Resultado

| Gate | Status |
|------|--------|
| Seed due via `fsrs_persist_review` (nunca INSERT) | PASS |
| 1 log / `attempt_id` + retry idempotente | PASS |
| revision 1 → 2 na jornada `scheduled_review` | PASS |
| `due_at` avança após revisão | PASS |
| Inventário real (`meta.subtopico`) | PASS (fallback ADR) |
| Deploy alias `staging` com build atual | **BLOCKED** — Vercel OOM (8 GB) |
| Ops live (sintéticos excluídos das métricas de negócio) | DONE — gross 1 card / 2 logs; negócio 0/0 |

## Contagens pós-smoke (staging DB)

- Bruto: 1 card revision=2, reps=2, lapses=0, 2 logs (seed + journey) — **sintético**
- Negócio (ops): 0 cards / 0 logs após exclusão
- Produção: FSRS flags ausentes (off)

## Comandos

```bash
npm run fsrs:staging-smoke -- --dry-run
npm run fsrs:staging-smoke -- --cleanup --user-id=<uuid>
npm run fsrs:ops-report -- --production-off
```

## Rollback

`FSRS_MVP_ENABLED=false` (Preview staging) — Production já off.

## Veredito permitido

**FSRS MVP 100% funcional no staging beta** (persistência RPC + jornada card/log/revision/due_at + ops com sintéticos excluídos).  
UI no host `flowmedix-git-staging` ainda aponta deploy antigo até resolver OOM de build Vercel.  
**Default-on global:** NO-GO (`insufficient_window` D+7/D+14).
