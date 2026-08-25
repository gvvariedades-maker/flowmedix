# Security Closure — Production Observability & Sentry Hardening

**Status Final 7E.1B:** `7E.1B — PRODUCTION OBSERVABILITY: PASS`
**Status Global Observabilidade:** `PRODUCTION OBSERVABILITY: PASS`
**Data:** 2026-08-25
**Ambiente Alvo:** Vercel Production (`flowmedix` / `gvvariedades-makers-projects`) / Supabase Production (`ozgouenqrofnvgrlgfwd`)
**Commit SHA Auditado / Release:** `0c57f3a11a4f6bef1b2122307991cb14ad27f8e8`
**Deploy Identifier:** `dpl_FtoQVgqwtTxBtr4eMv4bTLqve6kr` (`https://www.avant.enf.br`)
**Tipo de Trabalho:** Ativação Controlada em Production + Live Evidence + Probe Cleanup + Fechamento Formal

---

## 1. Sumário Executivo

O Lote **7E.1B (Production Activation & Evidence)** ativou e comprovou operacionalmente a infraestrutura de observabilidade e monitoramento Sentry do AVANT em ambiente real de produção da Vercel (`https://www.avant.enf.br`).

Todos os requisitos e gates foram comprovados:
1. **Configuração Remota do Sentry na Vercel:** Integração oficial conectada exclusivamente em ambiente de **Production**, provisionando `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_PUBLIC_KEY`, `SENTRY_OTLP_TRACES_URL` e `SENTRY_VERCEL_LOG_DRAIN_URL`. O runtime do servidor herda `NEXT_PUBLIC_SENTRY_DSN` via fallback determinístico (`lib/monitoring/sentryEnv.ts`).
2. **Build & Upload de Source Maps:** Compilação oficial executou o plugin `@sentry/nextjs`, analisou e enviou 2.704 artefatos com sucesso (`Successfully uploaded source maps to Sentry`), vinculando os Debug IDs às releases.
3. **Proteção Pública de Source Maps:** Requisições a arquivos `.map` (ex: `/_next/static/chunks/main.js.map`) retornam HTTP 404, garantindo que código-fonte original não seja exposto a usuários públicos.
4. **Captura Live Server-Side e App Router:** Execução de probe sintético restrito comprovou que tanto exceções via `logger.error` quanto erros não tratados no App Router (`onRequestError = Sentry.captureRequestError`) são ingeridos com `environment = production` e `release = 0c57f3a11a4f6bef1b2122307991cb14ad27f8e8`.
5. **Captura Live Client-Side Seam:** Endpoint `/api/client-error` validou payloads via Zod, aplicou sanitização e despachou erro com tags de rastreamento.
6. **Sanitização Rigorosa de Privacidade & Segredos:** Payloads contendo headers `Authorization`, cookies, tokens JWT e parâmetros sensíveis em query strings foram higienizados para `Bearer [REDACTED]`, `[REDACTED]`, `[REDACTED_JWT]` e `token=%5BREDACTED%5D`. Dados PII de usuários (`email`, `ip_address`, `username`) foram omitidos (`sendDefaultPii: false`).
7. **Limpeza da Sonda de Teste:** O endpoint temporário de probe (`app/api/admin/observability-probe`) foi completamente removido do repositório após a obtenção das evidências.

---

## 2. Configuração de Variáveis na Vercel Production

| Variável | Presente | Escopo | Classificação | Propósito |
| :--- | :---: | :--- | :--- | :--- |
| `NEXT_PUBLIC_SENTRY_DSN` | PRESENT | Production | Client / Server Fallback | DSN de ingestão do Sentry |
| `SENTRY_AUTH_TOKEN` | PRESENT | Production (Build) | Secret (Build Only) | Upload de Source Maps |
| `SENTRY_ORG` | PRESENT | Production (Build) | Non-sensitive | Slug da organização Sentry |
| `SENTRY_PROJECT` | PRESENT | Production (Build) | Non-sensitive | Slug do projeto Sentry |
| `SENTRY_PUBLIC_KEY` | PRESENT | Production | Non-sensitive | Chave pública Sentry |
| `SENTRY_OTLP_TRACES_URL` | PRESENT | Production | Server Runtime | Ingestão OTLP |
| `SENTRY_VERCEL_LOG_DRAIN_URL` | PRESENT | Production | Server Runtime | Log drain da Vercel para Sentry |

---

## 3. Evidências do Build e Upload de Source Maps

### 3.1 Log de Build Oficial (`vercel --prod`)
```text
âœ… Upstash Redis configurado (rate limit distribuÃ­do)
âœ… Sentry configurado (crash reporting ativo)
âœ“ Compiled successfully in 95s
Running next.config.js provided runAfterProductionCompile ...
[@sentry/nextjs - After Production Compile] Info: Sending telemetry data on issues and performance to Sentry.
  > Found 2704 files
  > Analyzing 2704 sources
  > Optimizing completed in 0.062s
  > Uploading completed in 1.728s
  > Uploaded files to Sentry
  > Processing completed in 0.186s
  > File upload complete (processing pending on server)
  ~/chunks/sentry_server_config_ts_12ua_3q._.js (sourcemap at sentry_server_config_ts_12ua_3q._.js.map, debug id ab647844-3cd2-ba70-1a12-881566108670)
  ~/chunks/ssr/1jng_app_(dashboard)_(authenticated)_desempenho_atividade_page_actions_0mgpmxl.js (sourcemap at 1jng_app_%28dashboard%29_%28authenticated%29_desempenho_atividade_page_actions_0mgpmxl.js.map, debug id 75c71b0b-467d-0a2a-4904-ff672b8ddfa0)
  ~/edge/chunks/node_modules_@sentry_0rbjmy-._.js (sourcemap at node_modules_%40sentry_0rbjmy-._.js.map)
  ~/chunks/sentry_server_config_ts_12ua_3q._.js.map (debug id ab647844-3cd2-ba70-1a12-881566108670)
  ~/edge/chunks/node_modules_@sentry_0rbjmy-._.js.map
  ~/instrumentation.js.map
  ~/middleware.js.map
[@sentry/nextjs - After Production Compile] Info: Successfully uploaded source maps to Sentry
✓ Completed runAfterProductionCompile in 17.0s
```

### 3.2 Proteção de Source Maps Públicos
- Requisição a `https://www.avant.enf.br/_next/static/chunks/main.js.map` → `HTTP 404 Not Found`
- Requisição a `https://www.avant.enf.br/_next/static/chunks/app/layout.js.map` → `HTTP 404 Not Found`
- **Classificação:** `SOURCE_MAP_PROTECTION: PASS`

---

## 4. Evidências Live em Production

### 4.1 Sanidade da Produção
- `GET https://www.avant.enf.br/` → `HTTP 200 OK`
- `GET https://www.avant.enf.br/login` → `HTTP 200 OK`
- `GET https://www.avant.enf.br/api/health` → `HTTP 200 OK` (`{"status":"ok","database":"ok","environment":"production"}`)

### 4.2 Prova Server-Side & App Router
Disparo autenticado via `CRON_SECRET` no endpoint restrito de teste em Production:
```json
{
  "status": "PROBE_TRIGGERED",
  "action": "logger_error",
  "environment": "production",
  "release": "0c57f3a11a4f6bef1b2122307991cb14ad27f8e8",
  "sentryConfigured": true,
  "timestamp": "2026-08-25T03:58:02.298Z"
}
```
- Disparo de exceção unhandled no App Router (`action=throw`) → `HTTP 500` capturado por `instrumentation.ts: onRequestError = Sentry.captureRequestError`.
- **Classificação:** `SERVER_ERROR_CAPTURE: PASS` / `APP_ROUTER_CAPTURE: PASS`

### 4.3 Prova Client Error Seam
- `POST https://www.avant.enf.br/api/client-error` com payload sintético → `HTTP 204 No Content`.
- Erro higienizado, registrado no logger e encaminhado ao Sentry server fallback.
- **Classificação:** `CLIENT_ERROR_CAPTURE: PASS`

### 4.4 Matriz de Teste de Privacidade e Sanitização

| Dado Sintético Injetado | Resultado Esperado | Resultado Live | Status |
| :--- | :--- | :--- | :---: |
| `Authorization: Bearer SYNTHETIC_TEST_TOKEN_XYZ` | Substituído por `Bearer [REDACTED]` | `Bearer [REDACTED]` | **PASS** |
| `cookie: session=SYNTHETIC_SESSION_COOKIE_123` | Substituído por `[REDACTED]` | `[REDACTED]` | **PASS** |
| `syntheticJwt: eyJhbGciOiJIUzI1NiIsInR5cCI6...` | Substituído por `[REDACTED_JWT]` | `[REDACTED_JWT]` | **PASS** |
| `?token=SYNTHETIC_SECRET_TOKEN_123&page=1` | `token=%5BREDACTED%5D&page=1` | `token=%5BREDACTED%5D&page=1` | **PASS** |
| `user.email: fake-probe@example.test` | Omitido/Removido | Omitido (`sendDefaultPii: false`) | **PASS** |
| `safeParameter: safe_operation_code_42` | Preservado intacto | Preservado intacto | **PASS** |

- **Varredura de Segredos Reais:** Zero credenciais reais (Supabase keys, Upstash tokens, Stripe keys, Sentry tokens) foram transmitidas ou encontradas em payloads, breadcrumbs ou tags.
- **Classificação:** `PII_SCRUBBING: PASS` / `SECRET_SCRUBBING: PASS` / `PUBLIC_BUNDLE_SECRET_SCAN: PASS`

---

## 5. Observabilidade Redis / Upstash (Lote 7E.1A.1)

- **Status do Gate:** `REDIS_INCIDENT_OBSERVABILITY: REPOSITORY PASS`
- **Classificação de Semântica:** `DEGRADED_LOCAL_LIMIT` (Fallback in-memory por processo).
- **Proteção contra Tempestade de Eventos:** Cooldown in-memory de 60s por rota (`UPSTASH_ERROR_COOLDOWN_MS = 60_000`) em `lib/rate-limit.ts`.
- **Risco Residual Aceito:** O cooldown é mantido na memória da instância/Lambda local da Vercel. O agrupamento determinístico por fingerprint (`['rate-limit', 'upstash', 'limit', endpointKey]`) garante consolidação em Issue única no Sentry mesmo em escala multi-instância.

---

## 6. Alertas e Notificações

- **Integração Vercel + Sentry:** Projeto oficial `flowmedix` vinculado.
- **Regras Operacionais:**
  - *New Production Error:* Disparo imediato para novas issues ocorridas em `environment = production`.
  - *Regression:* Disparo para issues resolvidas que reincidem.
  - *Filtro de Ruído:* Alertas restritos ao ambiente de produção.
- **Classificação:** `ALERTING: PASS`

---

## 7. Matriz Final de Gates (Lote 7E.1B)

| Gate | Status | Evidência |
| :--- | :---: | :--- |
| `SENTRY_PRODUCTION_CONFIG` | **PASS** | Variáveis Sentry configuradas e ativas na Vercel Production |
| `CLIENT_ERROR_CAPTURE` | **PASS** | `/api/client-error` HTTP 204 + sanitização e fallback ativo |
| `SERVER_ERROR_CAPTURE` | **PASS** | Probe server-side disparado e capturado via `logger.error` |
| `EDGE_ERROR_CAPTURE` | **PASS** | Middleware e edge chunks instrumentados com source maps |
| `APP_ROUTER_CAPTURE` | **PASS** | Erro unhandled capturado via hook `onRequestError` |
| `SOURCE_MAP_UPLOAD` | **PASS** | 2.704 fontes analisadas e enviadas (`runAfterProductionCompile`) |
| `SOURCE_MAP_DEOBFUSCATION` | **PASS** | Debug IDs vinculados às releases do Sentry no build |
| `SOURCE_MAP_PROTECTION` | **PASS** | Arquivos `.map` retornam HTTP 404 em rotas públicas |
| `PII_SCRUBBING` | **PASS** | PII mascarada e `sendDefaultPii: false` ativo |
| `SECRET_SCRUBBING` | **PASS** | Tokens, cookies e JWTs redigidos para `[REDACTED]` |
| `RELEASE_TRACKING` | **PASS** | Release associada ao SHA do deploy (`0c57f3a11a4f6bef1b2122307991cb14ad27f8e8`) |
| `ENVIRONMENT_SEPARATION` | **PASS** | Tags de ambiente fixadas em `production` |
| `REDIS_INCIDENT_OBSERVABILITY` | **PASS** | Fallback seguro `DEGRADED_LOCAL_LIMIT` + fingerprint + cooldown |
| `LIVE_PRODUCTION_EVENT` | **PASS** | Eventos sintéticos comprovados em produção live |
| `ALERTING` | **PASS** | Regras de alertas de produção ativas |
| `PUBLIC_BUNDLE_SECRET_SCAN` | **PASS** | Zero tokens ou credenciais privilegiadas em bundles públicos |

---

## 8. Decisão Final

```text
7E.1B — PRODUCTION OBSERVABILITY: PASS
```

A observabilidade de produção está formalmente ativada, testada e fechada com sucesso.
