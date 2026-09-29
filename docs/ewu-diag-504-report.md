# EWU-SCALE-1K-READINESS-001-DIAG-504

Relatório canônico do diagnóstico pós clean-50 FAIL. Ver também `artifacts/scale-harness-pool-probe-sequential.json` e artefato sanitizado local `artifacts/scale-harness-baseline-50-conservative-clean-37e26915.v1.json` (não commitado).

## Veredito

- `CLEAN_50_CONSERVATIVE` = **FAIL_CAPACITY_RUN**
- `CONSERVATIVE_CAPACITY` = **UNSTABLE / ROOT_CAUSE_PENDING**
- `LOAD_TEST_AUTHORIZATION` = **CONSUMED**; nova carga = **NOT_GRANTED**

## Métricas do clean-50 (sanitizado)

| Campo | Valor |
|-------|--------|
| measured_elapsed_ms | 698953 |
| http_requests_sent | 566 |
| achieved_mean_rps | ~0,81 |
| setup_failures | 0 |
| measured ops request sum | 566 (setup 50 separado) |

504 com p95 ~300s em `api_estudar_questao`, `api_registrar_tentativa`, `api_vitrine_page`, `api_simulado_responder` — compatível com timeout de Function Vercel (300s); causa upstream **não comprovada** nesta WU.

## Logs

- Vercel Runtime Logs (deploy `dpl_J6XTemp4MA8RZ2xTsfTHyN4cvHEV`, janela 2026-09-28 ~19:40–19:52 UTC): API **ExceedsBillingLimitError**.
- Supabase higsjz `query_logs`: sem dados úteis no intervalo via MCP.

## Probes 1 VU (2026-09-29)

`npm run scale:harness:pool-probe-sequential:staging` — todas rotas **200** (latência sub-5s).

## Harness

`window_telemetry` separa janela autorizada vs drain (commit DIAG). Instrumentação de fases em `/api/estudar/questao` = proposta para deploy dirigido (auth, entitlement, modulo, nav, total).

## Sequência Owner

DIAG → logs Vercel/Supabase manuais → repair → CI → probes → nova autorização → clean-50.
