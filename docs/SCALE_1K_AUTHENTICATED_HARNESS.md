# Harness autenticado — EWU-SCALE-1K-READINESS-001

Envelope aprovado: v1.0.3, SHA `0bfe0479f79954115d50451c005301b27df61cd5`.

## Estado (honesto)

| Componente | Status |
| --- | --- |
| `ENVELOPE_V1` | **APPROVED** |
| `HARNESS_VALIDATOR` | **IMPLEMENTED** (`--validate`) |
| `HARNESS_PLANNER` | **IMPLEMENTED** (`--plan`, materialização, scheduler) |
| `HARNESS_HTTP_EXECUTOR` | **IMPLEMENTED_BLOCKED_BY_POLICY** (código existe; `--execute` + env) |
| `HARNESS_AUTHENTICATED` | **IMPLEMENTATION_IN_PROGRESS** (revisão independente pendente) |
| `CAPACITY_1K_READINESS` | `PENDING_EVIDENCE` |
| `LOAD_TEST_AUTHORIZATION` | `NOT_GRANTED` |
| `PRODUCTION_AUTHORIZATION` | `NOT_GRANTED` |

## Pool de usuários (baseline)

- `pool.users.length >= peak_concurrent_users` do tier (50 / 100 / 150).
- `pool_id` único; `access_token` único por usuário (sem reuso no baseline).
- Rotas RSC: `cookie_header` obrigatório.
- Player/API questão: `default_questao_slug` + `default_opcao_id` para escrita.
- Simulado responder: `default_opcao_id`; `simulado_session_id` pré-preenchido **ou** setup `POST /api/simulado/sessions` no harness.
- Auth refresh: `supabase_url`, `supabase_anon_key`, `supabase_refresh_token` por usuário.

## Target (allowlist)

- `target_environment` deve ser `"staging"`.
- `base_url` deve ter host listado em `allowed_hosts[]`.
- Production não tem caminho executável sem mudança de política + Owner.

## Secrets

Pools reais somente em paths gitignored:

- `scale-harness-private/`
- `artifacts/scale-harness-private/`
- `*.scale-harness-pool.local.json`

Exemplo versionado (placeholders): `examples/scale-harness-pool.example.json`  
Plano local sem segredos: `examples/scale-harness-plan-pool.placeholder.json` (50 VUs fictícios).

## Scheduling

- **6 req/min/VU** → intervalo médio **10 s** entre requests por VU.
- Seleção **weighted_random** nos `request_weight` das operações measured.
- **Setup** (criação de simulado) uma vez por VU antes da janela measured (quando `--execute` autorizado).

## Comandos (sem carga)

```bash
npm run scale:harness -- --validate
npm run scale:harness -- --plan --tier=conservative --pool=examples/scale-harness-plan-pool.placeholder.json
```

Execução HTTP: `--execute` + `SCALE_HARNESS_EXECUTE=1` + `SCALE_HARNESS_LOAD_TEST_AUTHORIZED=1` — **não usar** até revisão + autorização Owner para staging.

## Código

- `lib/scale/authenticatedHarness/*`
- `scripts/scale-authenticated-harness.ts`
