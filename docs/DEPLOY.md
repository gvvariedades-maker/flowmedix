# Guia de deploy — AVANT

**Última atualização:** 2026-07-23

Este guia é o ponto de entrada operacional: checklist, Vercel, variáveis e verificação pós-deploy. Para o inventário técnico (o que já existe no código vs. melhorias opcionais), use [`AUDITORIA_DEPLOY.md`](./AUDITORIA_DEPLOY.md).  
**Hub segurança eng:** [`SECURITY_ENG_AVANT.md`](./SECURITY_ENG_AVANT.md) (Trilho B — ops / produção). Barra: [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md) · IR: [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md).

---

## O que significa “deploy de qualidade” neste projeto

1. **Build de produção verde** — `npm run build` passa com as mesmas variáveis que o ambiente de produção usará (ou equivalentes).
2. **Dados e auth** — Supabase com migrações aplicadas, RLS revisado para o que for exposto ao cliente.
3. **Smoke test** — login, rota principal do aluno e uma API crítica respondendo após o deploy.
4. **Observabilidade mínima** — health check + logs no host; **Sentry em Production = scorecard #8** (PASS humano; não bloqueia build local sem DSN).

Performance (LCP, INP, CLS) depende de medir em produção (Vercel Analytics, Web Vitals, ou ferramentas similares), não só de Lighthouse local.

---

## Checklist pré-deploy

### 1. Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Ambiente | Obrigatória |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | **Obrigatória** (cache, webhooks, RLS bypass server-side) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Production | **Scorecard #7** — rate limit distribuído; sem isso, fallback in-memory + warn (`validate:env`). Aceita alias `KV_REST_API_*` (Vercel Marketplace). |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Production | **Scorecard #8** — observabilidade. Ausente → warn + `/api/client-error`; **não** falha build. Preferir `SENTRY_DSN` no server; público só se necessário no browser. |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | CI (build) | Opcional — upload de source maps; sem isso stack traces minificados. |
| `ADMIN_EMAIL` | Production | **Obrigatório** (`ADMIN_EMAIL` ou `ADMIN_EMAILS`). Preview na Vercel **não** bloqueia o build se ausente (`VERCEL_ENV=preview`); recomenda-se definir em Preview (todas as branches) para testar admin. **Scorecard #11:** MFA nessas contas (Supabase Auth). |
| `GOOGLE_API_KEY` | Production | Opcional (recursos de IA) |
| `SUPABASE_WEBHOOK_SECRET` | Production | Webhooks Supabase (cache + auth); ver [Webhooks Supabase](#webhooks-supabase) |
| `WEBHOOK_SECRET` | Production | Legado — fallback em `/api/cache/revalidate`; preferir `SUPABASE_WEBHOOK_SECRET` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Production | E-mail transacional (boas-vindas, convites) |
| `METRICS_SECRET` | Production | Se usar endpoint de métricas protegido |
| `NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE` | Preview (staging) → Production após QA | Opcional (`1` = modal questão sobre vitrine no mobile). **Preview primeiro** — matriz em [`MOBILE_BOTTOM_NAV_QA.md`](./MOBILE_BOTTOM_NAV_QA.md#fase-5--rollout-modal-next_public_estudar_modal_route1). E2E: `npm run test:e2e:modal:staging`. |

**Não** commite segredos. `NEXT_PUBLIC_*` são expostas ao browser — apenas chaves públicas.

O projeto valida env no startup (`lib/env.ts`) e roda `validate:env` antes do build (`package.json` → script `build`).

### 2. Validação local (recomendado antes de merge na branch de produção)

```bash
npm run validate:env
npm run build
npm run test
npm run lint
```

Testes E2E (opcional antes de cada deploy, útil em releases maiores):

```bash
npm run test:e2e
```

### 3. Banco de dados (Supabase)

1. Schema base: `supabase/schema.sql` (se aplicável ao seu fluxo).
2. Migrações incrementais em `supabase/migrations/` — aplicar na ordem correta no SQL Editor ou via CLI do Supabase, conforme o seu processo.
3. **Auth (Dashboard):** ativar [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) no projeto — passo a passo em [`SUPABASE_MAINTENANCE.md`](./SUPABASE_MAINTENANCE.md#auth-leaked-password-protection).

Consulte `supabase/migrations/README.md` se existir.

### 4. Painel Supabase (produção)

- **Authentication → URL configuration:** Site URL e redirect URLs alinhados ao domínio real (Vercel preview vs. produção).
- **Authentication → MFA:** TOTP nas contas `ADMIN_EMAIL` / `ADMIN_EMAILS` (scorecard #11 — [Ops produção](#ops-produção-scorecard-pass-humano)).
- **Database → Backups:** confirmar plano + anotar RTO/RPO no [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md).
- **RLS:** políticas revisadas para tabelas usadas pelo app.
- **Webhooks:** configurar antes de remover o envio client-side de boas-vindas (ver abaixo).

### Webhooks Supabase

Dois endpoints server-side compartilham o mesmo secret (`SUPABASE_WEBHOOK_SECRET` na Vercel):

| Evento | Endpoint | Header |
|--------|----------|--------|
| INSERT em tabelas públicas (cache) | `POST /api/cache/revalidate` | `Authorization: Bearer <secret>` |
| INSERT em `auth.users` (boas-vindas) | `POST /api/webhooks/auth` | `x-webhook-secret: <secret>` |

**Boas-vindas no cadastro:** no Dashboard Supabase → **Database → Webhooks** (ou Database Webhooks), crie um webhook na tabela **`auth.users`**, evento **INSERT**, URL `https://SEU-DOMINIO/api/webhooks/auth`, header `x-webhook-secret` com o mesmo valor de `SUPABASE_WEBHOOK_SECRET`. Com confirmação por e-mail ativa, o cliente **não** chama mais `/api/auth/welcome-email` sem sessão — o webhook dispara o e-mail assim que o usuário é criado.

Signup com sessão imediata continua usando `POST /api/auth/welcome-email` (requer cookie de sessão).

**Produção (automático):** migration `20260607140000_auth_users_welcome_webhook.sql` — trigger `auth_users_welcome_webhook` em `auth.users` INSERT → `/api/webhooks/auth` via `pg_net` (usa `private.cache_webhook_config`). Não é necessário webhook manual no Dashboard se a migration estiver aplicada.

Detalhes e SQL de cache: [`WEBHOOK_SETUP.md`](./WEBHOOK_SETUP.md).

**Checklist Vercel Production:** sem variáveis `E2E_*` nem `NEXT_PUBLIC_E2E_DASHBOARD_BYPASS`; Upstash + Sentry conforme [Ops produção](#ops-produção-scorecard-pass-humano); `npm run smoke:rls` após `db:push` com migration RLS de `modulos_estudo`.

---

## Ops produção (scorecard PASS humano)

Itens **#7 Upstash**, **#8 Sentry**, **#11 MFA admin**, **backup**, **#12 paper drill**, **#13 pentest** — executáveis por humano; **não** falham `npm run build` / clone se DSN ou Upstash ausentes. Barra e coluna “Feito em”: [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md) § Checklist ops (produção). Rituais: [`SECURITY_RITUAIS.md`](./SECURITY_RITUAIS.md). Inventário técnico: [`AUDITORIA_DEPLOY.md`](./AUDITORIA_DEPLOY.md).

### 1. Sentry (scorecard #8)

1. Criar projeto no [Sentry](https://sentry.io) (Next.js).
2. Vercel → Settings → Environment Variables → **Production**:
   - `SENTRY_DSN` (server; preferido) e/ou `NEXT_PUBLIC_SENTRY_DSN` (client se precisar).
3. Opcional no CI/build: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (source maps).
4. Redeploy Production. Confirmar: `validate:env` sem “Sentry desativado”; gerar erro de teste e ver no painel.
5. Código já wired: `instrumentation.ts` / `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.

Marcar #8 PASS no scorecard com data (screenshot env list **sem** valor do DSN).

### 2. Upstash / rate limit (scorecard #7)

1. Vercel Marketplace → Upstash Redis (ou KV) no projeto, **ou** colar `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` em Production.
2. Redeploy. `validate:env` sem warn “Upstash incompleto”.
3. Smoke: 11º `POST /api/pagamentos/criar-sessao` no mesmo IP/min → **429** (matriz pós-deploy abaixo).

Marcar #7 PASS no scorecard.

### 3. Admin MFA (scorecard #11 — parte ops)

1. Confirmar `ADMIN_EMAIL` / `ADMIN_EMAILS` em Production.
2. Supabase Dashboard → **Authentication** → MFA / fatores: ativar TOTP para **cada** e-mail admin (App Authenticator).
3. Login admin em `/admin` exige segundo fator.

Parte código (`requireAdminApi`) já coberta por testes/CI; MFA no provedor é evidência humana → #11 PASS quando ambos ok.

### 4. Backup Supabase (suporte a IR)

1. Dashboard → **Settings → Database / Backups**: confirmar backups automáticos do plano.
2. Anotar RTO/RPO e quem restaura em [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md) § Backup.
3. Mensal: olhada rápida junto com [`SUPABASE_MAINTENANCE.md`](./SUPABASE_MAINTENANCE.md).

### 5. Paper drill (scorecard #12)

1. Escolher cenário (ex.: leak hipotético de `STRIPE_WEBHOOK_SECRET`).
2. Percorrer checklist de [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md) **sem** rotacionar secrets reais (ou rotacionar só em staging).
3. Preencher tabela § Paper drill + marcar #12 PASS no scorecard.

### 6. Rituais contínuos + pentest (scorecard #13)

Cadência mensal (1 domínio + `smoke:rls`), trimestral (threat model) e pentest focado: [`SECURITY_RITUAIS.md`](./SECURITY_RITUAIS.md). #13 PASS só após remediação P0/P1 — não falha build local.

---

## Deploy na Vercel

1. Importar o repositório e escolher o framework **Next.js**.
2. **Build Command:** `npm run build` (já inclui validação de env).
3. **Install:** `npm ci` ou `npm install` (CI costuma usar `npm ci`).
4. Configurar variáveis de ambiente para **Production** e, se desejado, **Preview**.
5. Após o deploy, executar as [verificações pós-deploy](#verificações-pós-deploy).

### Domínio e HTTPS

A Vercel fornece HTTPS. Após apontar domínio customizado, atualize `NEXT_PUBLIC_BASE_URL` e as URLs no Supabase.

---

## CI/CD (GitHub Actions)

O workflow em [`.github/workflows/test.yml`](../.github/workflows/test.yml) inclui:

| Job | O que faz | Quando bloqueia |
|-----|-----------|-----------------|
| `build` | `npm ci` + `npm run build` (placeholders Supabase) | Sempre |
| `test-unit` | Jest (inclui `__tests__/security/` — IDOR / admin 403 / contrato anon RLS) | Sempre |
| `typecheck` / `architecture-check` | Ship gates | Push sempre; PR se paths `ship` |
| `security-audit` | `npm audit --omit=dev --audit-level=high` | Sempre (só high/critical) |
| `smoke-rls` | `npm run smoke:rls` (anon: módulos, histórico, **matrículas**; service vs sellable) | Só se secrets `SMOKE_*` existirem; senão **skip + aviso** |
| `fsrs-rpc-integration` | Supabase CLI local (`start` + `db reset`) + gen types `--local` (assert FSRS) + `scripts/fsrs-mvp-rls-matrix.sql` + Jest `__tests__/lib/fsrs` com `FSRS_RPC_INTEGRATION=1` | Paths `lib/fsrs/**`, `supabase/migrations/**`, `__tests__/lib/fsrs/**` |
| `test-e2e` / `perf-smoke` | Playwright / perf | Condicional por paths |

Dependabot: [`.github/dependabot.yml`](../.github/dependabot.yml) — npm semanal (agrupa patch/minor) + github-actions mensal.

### CI secrets (`smoke-rls`)

Configure em **GitHub → Settings → Secrets and variables → Actions** (staging ou prod de leitura; nunca commit):

| Secret | Mapeado no job para | Uso |
|--------|---------------------|-----|
| `SMOKE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase alvo do smoke |
| `SMOKE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (RLS anon) |
| `SMOKE_SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Comparação service vs anon |

Sem os três secrets, o job `smoke-rls` emite warning e **não falha** o workflow (clone/fork sem secrets continua verde). Com secrets, falha se o smoke detectar leak RLS.

SQL companion (opcional, SQL Editor): [`supabase/scripts/rls_performance_smoke.sql`](../supabase/scripts/rls_performance_smoke.sql).

### Branch protection (`main`) — checklist ops

Em **Settings → Branches → Branch protection rule** para `main` (e `develop` se aplicável):

- [ ] Require a pull request before merging
- [ ] Require status checks to pass: **`architecture-check`**, **`security-audit`**
- [ ] Incluir **`smoke-rls`** na lista obrigatória **somente depois** de configurar os secrets `SMOKE_*` (senão PRs ficam bloqueados em skip não-obrigatório — o job passa com warning, mas preferir exigir só quando o smoke de fato roda)
- [ ] Preferir também `build` + `test-unit` se a equipe aceitar o tempo de CI

Marcar evidência no [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md) (itens 1, 2, 9).

### Secret scanning + push protection — checklist ops

Em **Settings → Code security and analysis** (ou Security):

- [ ] Secret scanning — Enabled
- [ ] Push protection — Enabled

Não é arquivo de código; evidência no scorecard (notas de promoção).

---

## Verificações pós-deploy

- [ ] `GET /api/health` retorna `200` com `database: ok` (ou diagnóstico esperado).
- [ ] Página inicial e login funcionam.
- [ ] Fluxo principal do aluno (ex.: vitrine / estudar) carrega.
- [ ] Logs do deployment na Vercel sem erros de runtime óbvios.

Exemplo (substitua pela URL do projeto):

```bash
curl -sS "https://SEU-DOMINIO.vercel.app/api/health"
```

### Matriz de verificação (infra / segurança)

| Check | Como validar |
|-------|----------------|
| Guest checkout | Stripe test mode → `/concursos/[slug]/comprar` → matrícula criada |
| Pro checkout | Assinatura → acesso imediato (cache de entitlements invalidado) |
| RLS `modulos_estudo` | Anon key + PostgREST `modulos_estudo` → 0 rows sem matrícula ativa |
| Auth revogada | Ban user → dashboard redireciona em &lt;1 request |
| `validate-question` | `POST` sem admin → 401/403; com admin → 200 |
| `welcome-email` | `POST` sem sessão → 401; webhook `auth.users` INSERT envia e-mail |
| Outage DB | `/estudar/[slug]` → error boundary, não 404 em massa |
| Rate limit | 11º `POST /api/pagamentos/criar-sessao` no mesmo IP/min → 429 |
| Env produção | `npm run validate:env` passa; `npm run smoke:rls` ok após `db:push` |
| Cron / manutenção | `Authorization: Bearer <CRON_SECRET>` em rotas `/api/admin/manutencao/*` |
| Cache revalidate | `GET` ou `POST /api/cache/revalidate` sem Bearer → 401 |

---

## Monitoramento e rollback

- **Logs:** Vercel → Deployments → deployment → Logs.
- **Health:** monitorar `/api/health` (UptimeRobot, cron, etc.) se fizer sentido.
- **Sentry:** scorecard #8 — ver [Ops produção](#ops-produção-scorecard-pass-humano); inventário em [`AUDITORIA_DEPLOY.md`](./AUDITORIA_DEPLOY.md).
- **Analytics / Web Vitals:** opcionais (produto), não fazem parte do scorecard de segurança.

**Rollback:** Vercel → Deployments → deployment anterior estável → **Promote to Production**.

**Incidente:** [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md) · barra: [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md).

---

## Troubleshooting

| Sintoma | O que verificar |
|--------|------------------|
| Build falha na Vercel | Rodar `npm run build` localmente; logs de build na Vercel; variáveis ausentes. |
| “Missing required environment variables” | Todas as obrigatórias no painel da Vercel para o ambiente correto. |
| Erro de banco / RLS | URL e anon key; políticas RLS; tabelas existentes. |
| Cookies / login em produção | Domínio e URLs no Supabase; HTTPS. |

---

## Documentação relacionada

- [`AUDITORIA_DEPLOY.md`](./AUDITORIA_DEPLOY.md) — inventário técnico e lacunas.
- [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md) — barra PASS/FAIL (incl. ops produção + #13 pentest).
- [`SECURITY_RITUAIS.md`](./SECURITY_RITUAIS.md) — mensal / trimestral / pentest focado.
- [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md) — IR + paper drill + RTO/RPO.
- [`SECURITY_ENG_AVANT.md`](./SECURITY_ENG_AVANT.md) — hub Trilho B (ops).
- [`.env.example`](../.env.example) — lista de variáveis com comentários.

---

*Deploy contínuo: você pode publicar uma versão estável e seguir desenvolvendo; cada merge pode gerar um novo deploy quando o pipeline e a Vercel estiverem configurados.*
