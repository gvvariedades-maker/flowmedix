# Harness autenticado — EWU-SCALE-1K-READINESS-001

Instrumento para **revisão independente** antes de qualquer execução de carga. Envelope aprovado: v1.0.3, SHA `0bfe0479f79954115d50451c005301b27df61cd5`.

## Estado

| Flag | Valor |
| --- | --- |
| `ENVELOPE_V1` | **APPROVED** |
| `HARNESS_AUTHENTICATED` | **IMPLEMENTED** (validação + plano; executor HTTP após revisão) |
| `CAPACITY_1K_READINESS` | `PENDING_EVIDENCE` |
| `LOAD_TEST_AUTHORIZATION` | **NOT_GRANTED** |
| `PRODUCTION_AUTHORIZATION` | **NOT_GRANTED** |

## O que o harness cobre

- Pool de usuários sintéticos (`examples/scale-harness-pool.example.json`)
- **Bearer** nas APIs do envelope
- **Cookie/session** nas rotas RSC (`/estudar/{slug}`, `/desempenho`, `/cadernos`)
- **Setup** `POST /api/simulado/sessions` fora da janela medida
- Mix **70 / 12 / 10 / 5 / 3** via `authenticated_operations.request_weight`
- Tiers **50 / 100 / 150** CCU (`--tier=conservative|nominal|stress`)

## Comandos (sem carga)

```bash
# Checagens mecânicas do envelope + sign-off
npm run scale:harness -- --validate

# Plano JSON (requer pool local; nunca commitar tokens)
npm run scale:harness -- --plan --tier=conservative --pool=path/to/pool.json --out=artifacts/scale-harness-plan.json
```

## Execução de carga

**Proibida** até:

1. Revisão independente do harness
2. Autorização explícita do Owner para load test em staging
3. `SCALE_HARNESS_EXECUTE=1` e `SCALE_HARNESS_LOAD_TEST_AUTHORIZED=1` + `--execute`

`base_url` do pool **não** pode apontar para `avant.enf.br` sem autorização Production.

## Código

- `lib/scale/workloadEnvelope.ts`
- `lib/scale/authenticatedHarness/*`
- `scripts/scale-authenticated-harness.ts`
