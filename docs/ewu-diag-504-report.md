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
| CI | PASS |
| `VERCEL_RUNTIME_LOG_EVIDENCE` | **BLOCKED_BY_LOG_ACCESS** |
| Supabase interval evidence | INSUFFICIENT |
| Upstream root cause | **OPEN** |
| `CONSERVATIVE_CAPACITY` | UNSTABLE / ROOT_CAUSE_PENDING |
| `LOAD_TEST_AUTHORIZATION` | NOT_GRANTED (consumida no clean-50) |

## Métricas do clean-50 (sanitizado local)

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

- Tentativa via API MCP no DIAG: falha na **obtenção** dos logs (`ExceedsBillingLimitError` na API de consulta) — **não** evidência de que `ExceedsBillingLimitError` ocorreu dentro das Functions durante o load test.
- Verificação Owner via conector: **403 Not authorized** para o team — `VERCEL_RUNTIME_LOG_EVIDENCE = BLOCKED_BY_LOG_ACCESS`.
- Janela alvo: deploy `dpl_J6XTemp4MA8RZ2xTsfTHyN4cvHEV`, **2026-09-28 ~19:40–19:52 UTC**. Correlacionar 504 por route, duration, request/invocation id, `FUNCTION_INVOCATION_TIMEOUT` quando o acesso for restabelecido.

### Supabase higsjz

`query_logs` via MCP: **insuficiente** no intervalo (sem correlação Postgres/PostgREST). Production `ozgouen`: não consultado.

## Probes 1 VU (2026-09-29)

Todas **200** (health ~3,2s; vitrine ~2,7s; estudar ~1,3s; registrar ~0,6s; simulado ~0,9s — rerun pós instrumentação). Confirma staging funcional em carga unitária; **não** explica falha concorrente.

## Instrumentação por fases (código)

- Flag operacional: `SCALE_STUDY_API_PHASE_TIMING=1` (allowlist em `check-architecture-patterns`; não entra em `lib/env.ts`).
- Eventos: `study_api_route_timing` (`auth_ms`, `payload_build_ms`, `route_total_ms`) e `study_api_phase_timing` (`entitlement_ms`, `modulo_fetch_ms`, `nav_catalog_ms`, `payload_build_total_ms`).
- **Requer deploy staging** com a flag para aparecer em Runtime Logs.

## Próxima ordem (sem load test)

1. Restabelecer acesso Runtime Logs Vercel (billing/team) + repetir consulta na janela `2026-09-28T19:40–19:52Z`.
2. Supabase: ampliar fontes (`postgres_logs`, pool) no mesmo intervalo ou usar dashboard quando MCP retornar vazio.
3. Deploy staging com `SCALE_STUDY_API_PHASE_TIMING=1` e amostra manual 1 VU sob carga leve.
4. Decisão Owner para novo clean-50 (`LOAD_TEST_AUTHORIZATION`).
