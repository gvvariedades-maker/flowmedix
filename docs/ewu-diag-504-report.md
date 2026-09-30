# EWU-SCALE-1K-READINESS-001-DIAG-504

Relatório canônico do diagnóstico pós clean-50 FAIL.

**Artefatos:** `artifacts/scale-harness-pool-probe-sequential.json` · `artifacts/ewu-diag-504-log-evidence.json` (tentativas Vercel/Supabase sanitizadas) · relatório sanitizado FAIL clean-50: `artifacts/scale-harness-baseline-50-conservative-clean-37e26915.v1.json` (versionado como evidência negativa, sem secrets).

## Veredito Work Unit

| Item | Status |
|------|--------|
| Diagnostic instrumentation | PASS |
| Window/drain telemetry | PASS |
| Evidence accounting (measured vs setup) | PASS |
| Sequential staging probe | PASS |
| CI `17646d42` (workflow 36589159675) | **PASS** (incl. `test-e2e`, `perf-smoke`) |
| CI `a04ffc1e` (workflow 36591743613) | **FAIL** — `test-unit`: contrato `phaseTimer` em `questao.test.ts` |
| CI `b1067bb5` (workflow 36593902930) | **PASS** |
| CI `766d9a66` (workflow 36608660030) | **PASS** (incl. `test-e2e`, `perf-smoke`) |
| CI `0035d702` (workflow 36610661842) | **PASS** |
| CI `f335ad97` (workflow 36618458905) | **PASS** (incl. `test-e2e`, `perf-smoke`) — **último SHA de código/CI registrado aqui** |
| Doc-only `8e04fafc` (workflow 36621980388) | 1ª exec.: **FAIL** só `build` (`next/font`/Turbopack); rerun do job `build` no mesmo SHA → **SUCCESS** (falha tratada como transitória). CI detalhado só no GitHub; não usar `CURRENT_SHA_CI` neste doc |
| Phase timing (emit imediato + `request_id`) | **SHIPPED** (`a04ffc1e`); log em **WARN** no preview (`766d9a66`) |
| Staging diagnostic deploy | **DONE** — ver § STAGING_DIAGNOSTIC_DEPLOY |
| Runtime phase correlation (pós-deploy) | **PASS** (amostra `request_id` nos Runtime Logs) |
| `VERCEL_RUNTIME_LOG_EVIDENCE` (janela clean-50 2026-09-28) | **BLOCKED_BY_LOG_ACCESS** / billing na consulta histórica |
| Supabase interval evidence | INSUFFICIENT |
| Upstream root cause | **OPEN** |
| `CONSERVATIVE_CAPACITY` | UNSTABLE / ROOT_CAUSE_PENDING |
| `LOAD_TEST_AUTHORIZATION` | NOT_GRANTED (consumida no clean-50) |

## Métricas do clean-50 (baseline FAIL versionado)

| Campo | Valor |
|-------|--------|
| measured_elapsed_ms | 698953 (~99s drain além de 600000 ms autorizados) |
| http_requests_sent | 566 |
| achieved_mean_rps (legado) | ~0,81 |
| setup_failures | 0 |
| measured ops request sum | 566 |

**Leitura de RPS:** o executor é **sequencial por VU** (espera a request terminar antes da próxima). Requests ~300 s bloqueiam o VU; com dezenas de 504, o `achieved_mean_rps` legado (completions / wall-clock incluindo drain) **não** é a métrica principal — usar `window_telemetry`: `request_start_rate_rps`, `completion_rate_during_window_rps`, `in_flight_at_window_end`, `drain_elapsed_ms`.

## Root cause (linguagem precisa)

| Afirmação | Status |
|-----------|--------|
| 504 com latência ~300 s no run | **PROVEN** |
| Degradação sob concorrência (50 CCU) | **PROVEN** |
| Timeout de Function (~300 s) como mecanismo final do 504 | **STRONG_HYPOTHESIS** |
| Causa upstream (Supabase/PostgREST/pool/query) | **UNKNOWN** |

**Não** aumentar `maxDuration` para mascarar.

## Evidência de logs

### Vercel Runtime Logs

- Janela **histórica** do clean-50 (`dpl_J6XTemp4MA8RZ2xTsfTHyN4cvHEV`, **2026-09-28 ~19:40–19:52 UTC**): consulta MCP falhou com `ExceedsBillingLimitError` / acesso team **403** — **não** confundir com erro dentro das Functions no load test.
- **Pós-deploy diagnóstico** (`dpl_BF6oQcTmbjF8SgjbNSq8rm5g69e4`): eventos `study_api_phase` visíveis em WARN no `GET /api/estudar/questao` com `request_id` correlacionável (amostra na § STAGING_DIAGNOSTIC_DEPLOY).

### Supabase higsjz

`query_logs` via MCP: **insuficiente** no intervalo (sem correlação Postgres/PostgREST). Production `ozgouen`: não consultado.

## STAGING_DIAGNOSTIC_DEPLOY

| Campo | Valor |
|-------|--------|
| Initial diagnostic SHA | `b1067bb5303a6105ef8e4458dcb033d56da638cf` |
| Operational hotfix SHA | `766d9a66936c45764d4388e2e7596541e49f9713` |
| Hotfix reason | `logger.info` suprimido no Preview com `NODE_ENV=production`; phase timing passou a `logger.warn` para observabilidade diagnóstica |
| Active deploy | `dpl_BF6oQcTmbjF8SgjbNSq8rm5g69e4` |
| Alias | `flowmedix-git-staging-gvvariedades-makers-projects.vercel.app` |
| Phase timing flag | `SCALE_STUDY_API_PHASE_TIMING=1` (Preview, branch `staging`) |
| 1 VU probe | **5/5 HTTP 200** (após `pool-refresh-sessions` quando JWT expirado) |
| Sample `request_id` | `08e25d1e-54b6-4b94-90c5-184c2fd3aa45` |
| auth | 122 ms |
| entitlement | 238 ms |
| modulo_fetch | 107 ms |
| nav_catalog | 388 ms |
| payload | 0 ms |
| Runtime phase correlation | **PASS** |

## Probes 1 VU (2026-09-29)

Probe sequencial pós-deploy diagnóstico: **5/5 HTTP 200**. Confirma staging funcional em carga unitária com instrumentação ativa; **não** explica falha concorrente do clean-50.

## Instrumentação por fases (código)

- Flag operacional: `SCALE_STUDY_API_PHASE_TIMING=1` (allowlist em `check-architecture-patterns`; não entra em `lib/env.ts`).
- Correlação: `request_id` (UUID) comum a todos os eventos da invocação.
- Eventos imediatos: `study_api_phase` com `phase` (`auth` | `entitlement` | `modulo_fetch` | `nav_catalog` | `payload`), `boundary` (`start` | `end`), `elapsed_ms` no `end`.
- Falha: `study_api_phase_failure` com `last_completed_phase`, `route_total_ms`, `error_class` (sem user id / token / cookie).
- Deploy staging com flag **concluído** (`766d9a66` no alias acima). Eventos em **WARN** no Runtime Logs do preview; útil para localizar hang (ex.: `nav_catalog` `start` sem `end` correspondente).

## Próxima ordem (sem load test)

1. Restabelecer consulta Runtime Logs na janela histórica clean-50 `2026-09-28T19:40–19:52Z` (billing/team), se ainda necessário para 504 do ensaio.
2. Supabase: ampliar fontes (`postgres_logs`, pool) no intervalo do clean-50 ou dashboard quando MCP retornar vazio.
3. Decisão Owner para novo clean-50 (`LOAD_TEST_AUTHORIZATION`) — instrumentação staging pronta; correlacionar `request_id` / fases quando a request degradar (~300 s).
