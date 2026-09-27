# Harness autenticado — EWU-SCALE-1K-READINESS-001

Envelope aprovado: v1.0.3, SHA `0bfe0479f79954115d50451c005301b27df61cd5`.

## Estado

| Componente | Status |
| --- | --- |
| `HARNESS_VALIDATOR` / `HARNESS_PLANNER` | **IMPLEMENTED** |
| `HARNESS_HTTP_EXECUTOR` | **IMPLEMENTED_BLOCKED_BY_POLICY** |
| `HARNESS_AUTHENTICATED` | **IMPLEMENTATION_IN_PROGRESS** (revisão pós-repair executor) |
| `LOAD_TEST_AUTHORIZATION` | **NOT_GRANTED** |

## Target binding (independente do pool)

Fonte canônica: [`data/scale-harness/staging-target.allowlist.json`](../data/scale-harness/staging-target.allowlist.json).

O pool **não** pode autodeclarar Production: `base_url` e `supabase_url` devem bater com hosts da allowlist versionada. Opcional no CLI: `SCALE_HARNESS_APPROVED_STAGING_HOSTS` (somente no script).

## RSC baseline

HTTP SSR com `cookie_header` pré-provisionado; `redirect: manual` — redirect/login **não** conta como sucesso. Não substitui navegação browser completa (Playwright = cenário futuro).

## Setup simulado

`POST /api/simulado/sessions` fora da janela measured; parse de `session.id` + `questoes[0].modulo_slug`; fail-fast em não-2xx.

## Scheduling

Start-to-start ~6 req/min/VU, stagger inicial entre VUs, relógio measured **após** setup completo.

## Métricas (quando `--execute` autorizado)

Por `operation_id`: requests, successes, failures, status, latências, p50/p95/p99/max; global: achieved vs target RPS, `setup_elapsed_ms` vs `measured_elapsed_ms`. Artefatos sempre redigidos.

## Comandos (sem carga)

```bash
npm run scale:harness -- --validate
npm run scale:harness -- --plan --tier=conservative --pool=examples/scale-harness-plan-pool.placeholder.json
```

Pools reais: `scale-harness-private/` ou `*.scale-harness-pool.local.json` (gitignored).
