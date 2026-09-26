# EWU-SCALE-1K-READINESS-001

Diagnóstico. Sem mudança de código de produto. Sem teste de carga em Production.

## Preflight

| Campo | Valor |
| --- | --- |
| Repositório | `gvvariedades-maker/flowmedix` |
| Candidato de capacidade | `origin/main` `d1fe4a28d39b4ec193c7914e54e593ad5522d613` |
| Commit | `fix(dr): pooler IPv4 para restore CAS no GitHub Actions (#139)` |
| CI | [36241740321](https://github.com/gvvariedades-maker/flowmedix/actions/runs/36241740321) success |
| Clone local | `0657a810` à frente de `origin/main` em 1 commit (só `.gitignore` do relatório DR). Não entra no candidato. |
| Branch protection `main` | `architecture-check`, `security-audit`, `typecheck`, `test-unit`, `build`, `lint` |
| Não exigidos na protection | `smoke-rls`, `test-e2e`, `perf-smoke` |

Jobs do run `36241740321` (todos success): `security-audit`, `test-unit`, `lint`, `smoke-rls`, `build`, `typecheck`, `test-e2e`, `perf-smoke`, `architecture-check`.

## Alvo

Pergunta original: cerca de **1.000 usuários ativos no dia**.

**Envelope proposto (v1):** [`SCALE_1K_WORKLOAD_ENVELOPE.md`](./SCALE_1K_WORKLOAD_ENVELOPE.md) · [`scale-1k-workload-envelope.v1.json`](./scale-1k-workload-envelope.v1.json)

| Parâmetro | Conservative | Nominal | Stress |
| --- | ---: | ---: | ---: |
| DAU | 1.000 | 1.000 | 1.000 |
| CCU no pico (19h–22h BRT) | 50 | **100** | 150 |
| RPS médio no pico | ~5 | **~10** | ~15 |
| Rajada ~30s | ~12 | **~25** | ~40 |

DAU = usuário autenticado com ≥1 ação de estudo no dia. Mix jornada 70 / 12 / 10 / 5 / 3; **`application_data_operation_ratio` ~76 / 24** (data plane do produto, não razão GET/POST HTTP — ver JSON v1.0.2).

Taxa **6 req/min/usuário ativo** = alvo conservador do **gerador de carga** (`conservative_capacity_test_target`, **não** medido em uso real; **não** derivado de `session_model`).

`CAPACITY_1K_READINESS = PENDING_EVIDENCE` (envelope **DEFINED**, reparo documental v1.0.3; medição não executada)

**Owner sign-off:** pendente (`owner_signoff_required: true`).

### Reparo documental (após checkpoint `99f7ac7e`)

| Item | Correção |
| --- | --- |
| Rota de escrita | `POST /api/registrar-tentativa` (não `/api/aluno/...`) |
| journey_mix ↔ operations | `journey_to_http_expansion` + `request_weight` somando 1.0 |
| read/write | 76% / 24% derivados; removido 82/18 não derivável |
| NeuroSlides | `embedded_payload`; fora do mix HTTP |
| Auth | APIs Bearer; RSC cookie/session |
| Data plane | PostgREST no app; pooler só DR tooling |

### Reparo final v1.0.2 (após `6d37df60`)

| Item | Correção |
| --- | --- |
| 6 req/min | `load_generator.generator_target_requests_per_active_user_per_minute`; hipótese conservadora, não média observada |
| Simulado | `POST /api/simulado/sessions` em **setup** (fixtures); steady-state medido = GET sessions/questão + POST responder |
| 76/24 | `application_data_operation_ratio`; refresh Auth pode ser POST HTTP e ainda `kind: read` |

**v1.0.3 (após `7c078c0f`):** chave `api_simulado_sessions` consistente no JSON; `POST /api/registrar-tentativa` descrito como escrita server-side pós-auth (não RLS na persistência).

`ENVELOPE_V1` após reparo final: aguarda verificação independente → sign-off Owner (`READY_FOR_OWNER_SIGNOFF` esperado).

Não existe gate canônico `G-CAPACITY-1K`. Limiares de erro e p95 não foram inventados neste ciclo.

## O que o harness mede

`scripts/perf-smoke.ts` no CI (`PERF_CONCURRENCY=20`, `PERF_DURATION_MS=20000`, app local `127.0.0.1:3000`):

| Cenário | O que prova |
| --- | --- |
| `api_*_unauth` (vitrine, questão, simulado, responder) | Latência de **401** sem sessão |
| `api_health` | No CI está com `PERF_SKIP_API_HEALTH=1` (health consulta o banco) |
| `api_metrics` | 200 com secret de métricas |
| `synthetic_10k_pipeline` | CPU local: filtrar 10.000 módulos sintéticos. Não fala com Supabase |

Subir concorrência desse smoke não mede o caminho de 1.000 DAU: Auth, RLS, leitura de questão, gravação de histórico, próxima questão.

## Evidência já ligada a um SHA

| Item | Estado |
| --- | --- |
| CI do candidato `d1fe4a28` | PASS no run 36241740321, inclusive `smoke-rls`, `test-e2e`, `perf-smoke`, `security-audit` |
| Supply-chain high/critical | PASS nesse run. `docs/SECURITY_SCORECARD.md` ainda descreve julho/2026 e está desatualizado |
| RPC `refresh_subtopico_guideline_counts` | No Git: `REVOKE` de `PUBLIC`, `GRANT` só para `service_role`. Drift no banco live não foi medido |
| G-DR-RESTORE | PASS no run 36213261055, SHA `7f9ae0b9`, `PRODUCTION_MUTATION: 0`. Não transferido para `d1fe4a28` porque `lib/backup/drRestoreDb.ts` mudou depois |

## Pendente (não medido neste ciclo)

| Item | Classificação |
| --- | --- |
| Workload que representa 1.000 DAU | **DEFINED v1** — aguarda sign-off Owner |
| Harness autenticado (k6 / extensão perf) | PENDING implementação |
| Caminho autenticado sob carga (staging) | PENDING |
| `scale:health` no banco real | Não executado |
| Upstash / Sentry / MFA admin em Production | CURRENT PASS não comprovado neste ciclo |
| G-DR-RESTORE no SHA `d1fe4a28` | Reexecutar o drill |
| Protection exigindo `smoke-rls`, `test-e2e`, `perf-smoke` | Ausente |

Nenhum gargalo arquitetural foi provado. Nenhum rewrite é indicado por esta evidência.

## Plano de medição (ainda sem executar carga)

1. Owner aprova ou edita o envelope v1 (tiers 50 / 100 / 150 CCU).
2. Ler limites do plano Supabase (conexões, CPU) sem teste de carga.
3. Implementar e rodar cenário autenticado em staging conforme `authenticated_operations` no JSON — não aumentar só o `PERF_CONCURRENCY` dos 401.
4. Corrigir só falha medida.
5. Validação em Production, se ainda for necessária, só com autorização explícita do Owner.

## Fora deste ciclo

- Load test em `avant.enf.br`
- Alteração de código de produto
- Novos limiares numéricos de p95/erro
