# Harness autenticado — EWU-SCALE-1K-READINESS-001

Envelope aprovado: v1.0.3, SHA `0bfe0479f79954115d50451c005301b27df61cd5`.

## Estado

| Componente | Status |
| --- | --- |
| `HARNESS_VALIDATOR` / `HARNESS_PLANNER` | **IMPLEMENTED** |
| `HARNESS_HTTP_EXECUTOR` | **IMPLEMENTED_BLOCKED_BY_POLICY** |
| `HARNESS_AUTHENTICATED` | **HARDENING** (escopo + defesa em profundidade) |
| `LOAD_TEST_AUTHORIZATION` | **NOT_GRANTED** |

## Target binding (independente do pool)

Fonte canônica e **única** autoridade de hosts: [`data/scale-harness/staging-target.allowlist.json`](../data/scale-harness/staging-target.allowlist.json).

Não há expansão de `app_hosts` via variável de ambiente. O pool deve usar `base_url` / `supabase_url` cujos hosts estejam na allowlist versionada (decisão do Owner).

## Autorização de load test (escopo, não booleano)

Além de `--execute`, `SCALE_HARNESS_EXECUTE=1` e `SCALE_HARNESS_LOAD_TEST_AUTHORIZED=1`, a execução exige escopo **idêntico** ao autorizado:

| Variável | Exemplo |
| --- | --- |
| `SCALE_HARNESS_AUTHORIZED_GIT_SHA` | SHA do commit autorizado |
| `SCALE_HARNESS_AUTHORIZED_TIER` | `conservative` \| `nominal` \| `stress` |
| `SCALE_HARNESS_AUTHORIZED_APP_HOST` | host do `base_url` do pool |
| `SCALE_HARNESS_AUTHORIZED_SUPABASE_HOST` | host do `supabase_url` (se usado) |
| `SCALE_HARNESS_AUTHORIZED_DURATION_MS` | duração da janela measured |

Qualquer divergência (tier, host, duração maior/diferente, SHA) **rejeita** a execução. Autorização para 50 CCU / conservative não habilita stress ou 150 CCU.

Entrypoint HTTP: `runHarnessMeasuredWindowAuthorized` — valida target + escopo antes do executor interno.

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
