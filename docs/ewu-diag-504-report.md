# EWU-SCALE-1K-READINESS-001-DIAG-504

Relatório canônico do diagnóstico pós clean-50 FAIL.

**Artefatos:** `artifacts/scale-harness-pool-probe-sequential.json` · `artifacts/ewu-diag-504-log-evidence.json` (tentativas Vercel/Supabase sanitizadas) · relatórios sanitizados FAIL clean-50: `artifacts/scale-harness-baseline-50-conservative-clean-37e26915.v1.json` (2026-09-28) · `artifacts/scale-harness-baseline-50-conservative-clean-8685261c.v1.json` (2026-10-01, staging `8685261c`).

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
| `VERCEL_RUNTIME_LOG_EVIDENCE` (clean-50 `8685261c`, 2026-10-01) | **PASS** (group_by status/route; 504 alinhado ao harness) |
| `study_api_phase` correlável no clean-50 `8685261c` | **INCONCLUSIVE** (full-text timeout; 504 sem `study_api_phase_failure`) |
| Supabase interval evidence | **PARTIAL** (volume por source; sem linha ERROR/pgbouncer wait no filtro usado) |
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

## Clean-50 pós-DIAG (2026-10-01, staging `8685261c`)

| Campo | Valor |
|-------|--------|
| Deploy | `dpl_CRSzarWfjWtLKSmKq3Bno6ojWUck` |
| App SHA | `8685261c30f466985c18b7bb8ab9fa907073280d` |
| Janela UTC (approx.) | `2026-10-01T12:58–13:14` |
| Artefato harness | `artifacts/scale-harness-baseline-50-conservative-clean-8685261c.v1.json` |
| achieved_mean_rps | ~0,63 (alvo 5) |
| 504 measured (harness) | `api_estudar_questao` 10 · `api_vitrine_page` 6 · `api_simulado_responder` 3 |

### Correlação Vercel Runtime Logs (MCP, mesma janela)

| Agrupamento | Resultado |
|-------------|-----------|
| `statusCode` | 200×536 · **504×19** · 403×1 |
| `route` (só 504) | `/api/estudar/questao` **10** · `/api/vitrine` **6** · `/api/simulado/responder` **3** |

**Leitura:** contagem **1:1** com o relatório sanitizado do harness — confirma 504 na borda Vercel, não artefato do executor.

### `study_api_phase` / `request_id`

- Flag `SCALE_STUDY_API_PHASE_TIMING=1` ativa no Preview branch `staging` (Vercel).
- Busca full-text `study_api_phase` / `request_id` na janela do ensaio: **timeout** na API de logs (volume alto); `study_api_phase_failure` sem linhas retornadas.
- **Hipótese:** invocações que viram 504 (~300 s) são cortadas pela plataforma **sem** `logRouteFailure` no app; diagnóstico fino exige amostra manual no dashboard (filtrar WARN + rota) ou reduzir concorrência para capturar `start` sem `end` da última fase.

### Supabase higsjz (ClickHouse, mesma janela)

- Volume: `edge_logs` ~5,7k · `postgrest_logs` ~533 · `postgres_logs` ~165 · `pgbouncer_logs` ~128.
- Linhas com ERROR explícito em `postgres_logs` / wait-timeout em `pgbouncer_logs`: **0** na query usada.
- **Causa upstream em DB:** ainda **NOT_DETERMINED** (não prova ausência de contenção; só que o sinal não apareceu nesses filtros).

Detalhe sanitizado: `artifacts/ewu-diag-504-log-evidence.json` → `latest_run`.

## Clean-50 após corte de invalidação (`9138e617`)

Tentativa deixa de revalidar `historico` global e `user-{id}` (vitrine/nav). Staging `dpl_2wGUkQvWTXHiTcD1FkkrWxwSWWbK`. Artefato: `artifacts/scale-harness-baseline-50-conservative-clean-9138e617.v1.json`. Probe 1 VU antes do ensaio: 5/5 HTTP 200.

| Métrica | `8685261c` | `9138e617` |
|---------|------------|------------|
| HTTP measured | 520 | 875 |
| request_start_rate_rps | 0,87 | 1,46 |
| achieved_mean_rps | 0,63 | 0,98 |
| `api_vitrine_page` p50 | 29,9 s | **3,6 s** |
| 504 vitrine / estudar / registrar / responder | 6 / 10 / 0 / 3 | 4 / 4 / 9 / 4 |

**Leitura:** a fila de catálogo aliviou (mais requests na janela; p50 da vitrine caiu uma ordem de grandeza). A cauda ~300 s **permanece** (21×504 + 500s novos). Alvo de 5 RPS **não** foi atingido. `CONSERVATIVE_CAPACITY` segue UNSTABLE.

## Clean-50 com `get_vitrine_page` sem detoast (app `9138e617` + SQL CAS)

Coluna gerada `modulos_estudo.neuroslide_count` e função `get_vitrine_page` reescrita no CAS `higsjz` (sem ler `conteudo_json` só para contar slides). O binário Vercel **não** mudou: alias ainda `dpl_2wGUkQvWTXHiTcD1FkkrWxwSWWbK` / `9138e617`. Harness local `6291bfb7`. Artefato: `artifacts/scale-harness-baseline-50-conservative-clean-9138e617-sql-neuroslide.v1.json`.

Chamada isolada da RPC (usuário harness 001): **3429 ms → 297 ms**. Payload da página continua ~436 KB.

| Métrica | `9138e617` (antes do SQL) | mesmo app + SQL |
|---------|---------------------------|-----------------|
| HTTP measured | 875 | **2140** |
| request_start_rate_rps | 1,46 | **3,57** |
| achieved_mean_rps | 0,98 | **2,85** |
| drain_elapsed_ms | ~294000 | **150216** |
| `api_vitrine_page` | p50 3,6 s; 504×4 | **264/264 HTTP 200**; p50 **384 ms**; p95 **6,2 s** |
| `api_estudar_questao` | p50 ~30 s; 504×4 | **548/548 HTTP 200**; p50 **605 ms**; p95 **56 s** |
| `api_registrar_tentativa` | p95 ~300 s; 504×9 | **456/456 HTTP 200**; p50 **581 ms**; p95 **122 s**; max **223 s** |
| 504 measured | 21 | **0** |

**Leitura:** o custo da RPC era o detonador dos 504. Sob 50 CCU a vitrine fica na casa de segundos no p95. O POST de tentativa não estoura mais a função, mas a cauda (p95 122 s) ainda segura o VU e o start rate fica em 3,57 contra o alvo 5. `api_simulado_responder`: 8×403 (não 504), p95 ainda alto. `CONSERVATIVE_CAPACITY` segue UNSTABLE. **Não** aumentar `maxDuration`.

## Clean-50 após cache no POST de tentativa (`b227418a`)

`registrar-tentativa` lê `conteudo_json` por `getQuestaoBySlugCached` e não reconta cota quando o gate já devolve `isPro: true`. Staging `dpl_5y5Emjqy7oaudX7CoxST9DovyGdi`. Artefato: `artifacts/scale-harness-baseline-50-conservative-clean-b227418a.v1.json`. SQL da vitrine continua o do ensaio anterior.

| Métrica | app `9138e617` + SQL | `b227418a` |
|---------|----------------------|------------|
| HTTP measured | 2140 | 2165 |
| request_start_rate_rps | 3,57 | 3,61 |
| achieved_mean_rps | 2,85 | 2,95 |
| drain_elapsed_ms | 150216 | 134118 |
| `api_registrar_tentativa` | 456×200; p50 581 ms; p95 **122 s** | **438×200**; p50 585 ms; p95 **65 s**; max 142 s |
| `api_estudar_questao` | p95 56 s | p95 **47 s**; 533×200 |
| `api_vitrine_page` | p50 384 ms; p95 6,2 s | p50 367 ms; p95 7,7 s; 246×200 |
| 504 measured | 0 | **0** |

**Leitura:** a mediana do POST já estava saudável; o cache cortou o p95 pela metade e não moveu o start rate (3,6 contra alvo 5). A cauda restante está espalhada (estudar p95 ~47 s, simulado p95 ~85 s, máximo da vitrine ainda >2 min em outlier). `CONSERVATIVE_CAPACITY` segue UNSTABLE. **Não** aumentar `maxDuration`.

## Próxima ordem (engenharia, sem mascarar timeout)

1. Cauda compartilhada sob 50 CCU (estudar, simulado, outlier da vitrine) — não é mais o detoast da RPC nem o JSON por tentativa.
2. 403 residuais de `api_simulado_responder` (3 neste ensaio).
3. **Não** merge de capacidade nem aumento de `maxDuration` até o start rate chegar perto de 5; PR #140 permanece decisão Owner explícita.
