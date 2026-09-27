# Pool sintético — provisionamento (EWU-SCALE-1K)

Runbook para montar o arquivo **gitignored** usado por `npm run scale:harness -- --plan` (e futuro `--execute` **somente** com autorização Owner). **Não** é load test.

## Pré-requisitos

| Item | Verificação |
| --- | --- |
| Alvo Supabase | `higsjzfigprqvldpxfwj.supabase.co` (CAS). **Nunca** `ozgouenqrofnvgrlgfwd`. |
| App staging | `https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app` (alias Vercel branch `staging`). |
| Deploy drift | Antes do ensaio: alias → deploy `dpl_J6XTemp4MA8RZ2xTsfTHyN4cvHEV` / app SHA `d1fe4a28` (ou o SHA autorizado na env de escopo). |
| Catálogo | Pelo menos 1 `slug` em `modulos_estudo` no CAS (script distribui slugs entre VUs). |
| Env local | `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY` apontando para **higsjz**. |
| Staging app URL | `.env.staging.local` com `PERF_BASE_URL` (ou `NEXT_PUBLIC_APP_URL`) = alias Vercel staging. |
| Vercel bypass | `VERCEL_AUTOMATION_BYPASS_SECRET` no shell — **não** vai no JSON do pool (só runtime do harness). |
| Autorização | `LOAD_TEST_AUTHORIZATION` = NOT_GRANTED até Owner; este doc não autoriza `--execute`. |

Referência de hosts: [`SCALE_HARNESS_STAGING_TARGET_BINDING.md`](./SCALE_HARNESS_STAGING_TARGET_BINDING.md).

## O que cada VU precisa (tier conservative / envelope v1.0.3)

| Campo | Uso |
| --- | --- |
| `pool_id` | Identificador único (`harness-u001` …). |
| `access_token` | JWT Supabase → `Authorization: Bearer` em `/api/*`. |
| `supabase_refresh_token` | Operação `auth_session_refresh` no mix measured. |
| `cookie_header` | Cookie SSR Supabase (`sb-higsjzfigprqvldpxfwj-auth-token=…`) → rotas RSC (`/estudar/{slug}`, `/desempenho`, `/cadernos`). |
| `default_questao_slug` | Slug real do catálogo (tentativa, questão API, simulado). |
| `default_opcao_id` | Ex.: `A` para `api_registrar_tentativa` / simulado responder. |

**Simulado:** `api_simulado_sessions_create` roda no **setup** do harness; não é obrigatório pré-gravar `simulado_session_id` no pool.

**Validade:** tokens/cookies devem cobrir **setup + janela measured** inteira. O harness **não** reescreve cookie SSR após refresh (ver [`SCALE_1K_AUTHENTICATED_HARNESS.md`](./SCALE_1K_AUTHENTICATED_HARNESS.md)).

## Checklist manual (Owner / ops)

1. Confirmar projeto Supabase no dashboard = **higsjz** (não Production).
2. Confirmar Vercel Preview branch `staging` com envs Supabase do higsjz + `SUPABASE_SERVICE_ROLE_KEY`.
3. **Matrícula obrigatória (app d1fe4a28):** sem `concurso_matriculas` ativa, `getAccessibleModulosForUser` → `[]` e `/api/registrar-tentativa` → 403. Fixture staging: concurso canônico **`geral`**, `origem=invite`, `status=ativo` (Pro-like, sem Stripe falso). Preflight: `npm run scale:harness:pool-preflight:staging`.
4. Rodar provisionamento (abaixo) → arquivo em `scale-harness-private/`.
5. Validar plano sem HTTP de carga:
   ```bash
   npm run scale:harness -- --plan --tier=conservative --pool=scale-harness-private/staging-conservative-50.scale-harness-pool.local.json
   ```
6. Smoke opcional (1 VU, manual): `GET /api/vitrine` com Bearer + bypass Vercel; `GET /estudar/{slug}` com `Cookie` + bypass, `redirect: manual`, esperar 200 (não 302 login).
7. Guardar pool **fora do Git**; rotacionar usuários `scale.harness.*` se vazamento.

## Script automatizado (Auth + cookie SSR)

```bash
# Env Vercel (preview + branch staging) — gitignored
npx vercel env pull scale-harness-private/.env.harness-pool.local --environment=preview --git-branch=staging -y

# Plano apenas (sem Auth)
npm run scale:harness:provision-pool -- --dry-run --count=50 --target=staging

# Criar 50 usuários no Auth higsjz + escrever pool (service role via Supabase CLI logado)
npm run scale:harness:provision-pool:staging -- --count=50 --tier=conservative \
  --out=scale-harness-private/staging-conservative-50.scale-harness-pool.local.json \
  --batch=20260927 --throttle-ms=700
```

| Flag | Descrição |
| --- | --- |
| `--count` | Número de VUs (default 50; máx. 200). |
| `--tier` | `conservative` \| `nominal` \| `stress` — valida cardinalidade via `buildHarnessExecutionPlan`. |
| `--batch` | Sufixo de e-mail (`scale.harness.<batch>.001@…`). |
| `--email-domain` | Domínio sintético (default `scale-harness.invalid` ou `SCALE_HARNESS_POOL_EMAIL_DOMAIN`). |
| `--dry-run` | Só imprime plano; sem Auth/ arquivo. |
| `--env-file` | Dotenv extra (ex.: `scale-harness-private/.env.harness-pool.local`). |
| `--supabase-project-ref` | Se `SUPABASE_SERVICE_ROLE_KEY` vazio, busca `service_role` via `supabase projects api-keys` (CLI autenticada). |
| `--throttle-ms` | Pausa entre VUs (recomendado **700+** — GoTrue rate limit). |
| `--target=staging` | Carrega `.env.staging.local` (mesmo padrão `perf:baseline:staging`). |

E-mails: `scale.harness.<batch>.NNN@<domain>`. Senhas geradas **não** são salvas no pool (só JWT + cookie).

## Formato de exemplo

[`examples/scale-harness-pool.example.json`](../examples/scale-harness-pool.example.json) — substituir placeholders; cookie SSR **não** é `sb-access-token` legado; use o output do script ou `buildSupabaseSsrCookieHeader` em `lib/scale/authenticatedHarness/provisionSession.ts`.

## Limpeza pós-ensaio

- Remover usuários Auth `scale.harness.*` no projeto higsjz (dashboard ou script admin).
- Apagar arquivo local do pool.
- Não reutilizar tokens em commits, tickets ou métricas exportadas.
