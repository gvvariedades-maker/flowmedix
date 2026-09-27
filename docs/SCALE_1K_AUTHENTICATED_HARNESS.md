# Harness autenticado — EWU-SCALE-1K-READINESS-001

Envelope aprovado: v1.0.3, SHA `0bfe0479f79954115d50451c005301b27df61cd5`.

## Estado

| Componente | Status |
| --- | --- |
| `HARNESS_VALIDATOR` / `HARNESS_PLANNER` | **IMPLEMENTED** |
| `HARNESS_HTTP_EXECUTOR` | **IMPLEMENTED_BLOCKED_BY_POLICY** |
| `HARNESS_AUTHENTICATED` | **READY_FOR_STAGING_TARGET_BINDING** (hosts versionados; load test ainda não autorizado) |
| `LOAD_TEST_AUTHORIZATION` | **NOT_GRANTED** |

## Target binding (independente do pool)

Fonte canônica e **única** autoridade de hosts: [`data/scale-harness/staging-target.allowlist.json`](../data/scale-harness/staging-target.allowlist.json). Binding staging (2026-09-27): [`SCALE_HARNESS_STAGING_TARGET_BINDING.md`](./SCALE_HARNESS_STAGING_TARGET_BINDING.md).

Não há expansão de `app_hosts` via variável de ambiente. O pool deve usar `base_url` / `supabase_url` cujos hosts estejam na allowlist versionada (decisão do Owner).

## Autorização de load test (escopo, não booleano)

Além de `--execute`, `SCALE_HARNESS_EXECUTE=1` e `SCALE_HARNESS_LOAD_TEST_AUTHORIZED=1`, a execução exige escopo **idêntico** ao autorizado:

| Variável | Exemplo |
| --- | --- |
| `SCALE_HARNESS_AUTHORIZED_GIT_SHA` | SHA do commit autorizado (= `git rev-parse HEAD`, worktree limpo) |
| `SCALE_HARNESS_AUTHORIZED_TIER` | `conservative` \| `nominal` \| `stress` |
| `SCALE_HARNESS_AUTHORIZED_APP_HOST` | host do `base_url` do pool |
| `SCALE_HARNESS_AUTHORIZED_SUPABASE_HOST` | host do `supabase_url` (se usado) |
| `SCALE_HARNESS_AUTHORIZED_DURATION_MS` | duração da janela measured |
| `SCALE_HARNESS_AUTHORIZED_ENVELOPE_VERSION` | ex.: `1.0.3` |
| `SCALE_HARNESS_AUTHORIZED_ENVELOPE_SHA256` | digest do arquivo canônico do envelope |
| `SCALE_HARNESS_AUTHORIZED_ALLOWLIST_SHA256` | digest da allowlist versionada |
| `SCALE_HARNESS_AUTHORIZED_PEAK_CCU` | CCU do tier (ex. 50 conservative) |
| `SCALE_HARNESS_AUTHORIZED_TARGET_MEAN_RPS` | RPS médio derivado do envelope |

Com `--execute`: **proibido** `--envelope` ou `--staging-allowlist` customizados; somente `docs/scale-1k-workload-envelope.v1.json` e `data/scale-harness/staging-target.allowlist.json`. Sem fallback `SCALE_HARNESS_RUNTIME_GIT_SHA`.

Entrypoint HTTP público: `runHarnessMeasuredWindowAuthorized` (implementação HTTP não exportada).

## RSC baseline (PARTIAL vs browser)

HTTP SSR com `cookie_header` **pré-provisionado e estático**; `redirect: manual` — redirect/login **não** conta como sucesso.

Após `auth_session_refresh`, o harness atualiza `access_token` / `refresh_token` em memória no VU, mas **não** reconstitui cookies SSR. Para ensaios curtos, provisionar tokens/cookies com validade cobrindo toda a janela. Playwright completo = cenário futuro.

## Setup simulado

`POST /api/simulado/sessions` fora da janela measured; parse de `session.id` + `questoes[0].modulo_slug`. HTTP 2xx com contrato inválido = **setup logical failure** (métricas + abort).

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
