# Security Closure — Production Observability & Sentry Hardening

**Status 7E.1A:** `7E.1A — OBSERVABILITY HARDENING PREPARATION: PASS`  
**Status Global Observabilidade:** `PRODUCTION OBSERVABILITY: NOT CLOSED` (Ativação e evidência live no Lote 7E.1B)  
**Data:** 2026-08-24  
**Ambiente Alvo:** Vercel Production / Supabase Production (`ozgouenqrofnvgrlgfwd`)  
**Commit SHA Base:** `7fc5776d90dfb6e1c06cf8ba470522567eef7d21` / `0a56ae5b` (codex/security-closure-observability)  
**Tipo de Lote:** Implementação / Hardening do Repositório (Sem mutação remota)

---

## 1. Sumário Executivo

O Lote **7E.1A (Production Observability Hardening Preparation)** preparou integralmente a infraestrutura de observabilidade e captura de erros do AVANT no repositório, implementando:

1. **Sanitização Centralizada e Universal (`lib/monitoring/sentrySanitizer.ts`):** Módulo universal (Client/Server/Edge) com proteção rigorosa contra vazamento de PII, headers `Authorization`, cookies de sessão, tokens JWT, chaves Supabase service-role, credenciais Upstash/Redis e segredos Stripe em payloads, URLs, headers, contexts e breadcrumbs.
2. **Derivação Determinística de Ambiente e Release (`lib/monitoring/sentryEnv.ts`):** Extração consistente de `environment` (`production`, `preview`, `development`, `test`) e `release` (`VERCEL_GIT_COMMIT_SHA`).
3. **Hardening de Configurações Sentry (`sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`):**
   - Inicialização condicional por DSN (zero overhead/inerte sem DSN).
   - `sendDefaultPii: false` explícito.
   - Amostragem conservadora (`tracesSampleRate: 0.1` em produção).
   - Injeção obrigatória dos hooks `beforeSend` e `beforeBreadcrumb` sanitizados.
4. **Integração Consciente com Logger (`lib/logger.ts`):**
   - Encaminhamento automático de `logger.error` para `Sentry.captureException` e `Sentry.captureMessage` com contexto higienizado.
   - Mecanismo anti-duplicação via property flag `__avant_sentry_reported__`.
   - Suporte à flag `skipSentry: true` para erros locais controlados.
5. **Observabilidade e Resiliência em Rate Limit / Upstash (`lib/rate-limit.ts`):**
   - Proteção de chamadas distribuídas com `try/catch`.
   - Em caso de falha de rede/timeout (`fetch failed`), emissão de log estruturado com tags seguras (`component: rate-limit`, `dependency: upstash`, `operation: limit`) e fallback transparente para armazenamento in-memory, evitando indisponibilidade ou retorno HTTP 500 para usuários finais.
6. **Proteção e Sanitização no Seam `/api/client-error` (`app/api/client-error/route.ts`):**
   - Rate limiting in-memory para mitigação de spam.
   - Validação de schema Zod e sanitização de payloads.
   - Rastreamento `clientSentryReported` para evitar eventos duplicados entre o browser e o servidor.

Todos os testes unitários (32 testes de monitoramento + 24 testes de segurança) e gates de arquitetura, compilação de produção e linting foram executados e aprovados com 100% de sucesso.

---

## 2. Matriz de Sanitização e Privacidade

| Dado / Vetor | Estratégia Implementada | Teste Unitário | Status |
| :--- | :--- | :--- | :---: |
| **Authorization (Bearer / JWT)** | Regex substitui tokens por `Bearer [REDACTED]` e `[REDACTED_JWT]` | `sentry-sanitizer.test.ts` | **PASS** |
| **Cookies de Sessão** | Headers `cookie` e `set-cookie` substituídos por `[REDACTED]` | `sentry-sanitizer.test.ts` | **PASS** |
| **JWTs em Strings / Mensagens** | Detecção por padrão de formato Base64 de 3 partes substituído por `[REDACTED_JWT]` | `sentry-sanitizer.test.ts` | **PASS** |
| **Chaves de API / Service Role** | Chaves case-insensitive (`serviceRoleKey`, `apiKey`, `stripeSecret`, `upstashToken`) substituídas por `[REDACTED]` | `sentry-sanitizer.test.ts` | **PASS** |
| **Query Strings em URLs** | `sanitizeUrl` higieniza parâmetros sensíveis (`token`, `code`, `state`, `secret`, `jwt`) preservando parâmetros seguros (`page`, `slug`, `banca`) | `sentry-sanitizer.test.ts` | **PASS** |
| **Objetos Aninhados & Circulares** | `sanitizeObject` recursivo com `WeakSet` (retorna `[CIRCULAR_OR_DEEP]` sem travar) | `sentry-sanitizer.test.ts` | **PASS** |
| **Dados Pessoais (User PII)** | `beforeSendSanitizer` remove/mascara `user.email`, `user.ip_address` e `user.username` | `sentry-sanitizer.test.ts` | **PASS** |

---

## 3. Matriz de Gates Locais (7E.1A)

| Gate Local | Comando Executado | Resultado |
| :--- | :--- | :---: |
| **Unit Tests Monitoring** | `npm test -- __tests__/monitoring/` | **PASS** (4 suítes / 32 testes) |
| **Unit Tests Security** | `npm test -- __tests__/security/` | **PASS** (4 suítes / 24 testes) |
| **Architecture Patterns** | `npm run check:architecture` | **PASS** (`✅ Padrões de arquitetura OK`) |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** (Zero erros) |
| **Linting** | `npm run lint` (`eslint .`) | **PASS** (Zero warnings/erros) |
| **Production Build** | `npx next build` | **PASS** (129 rotas compiladas com sucesso) |
| **Source Maps Protection** | Inspeção `.next/static` por arquivos `.map` | **PASS** (0 arquivos `.map` expostos) |
| **Git Diff Format** | `git diff --check` | **PASS** (Zero trailing whitespaces) |

---

## 4. Plano de Ativação e Evidência Live (Lote 7E.1B)

O lote seguinte (**7E.1B — Production Activation & Evidence**) executará a ativação remota controlada seguindo o roteiro:

1. **Configuração de Variáveis na Vercel Production:**
   - Adicionar `SENTRY_DSN` (Server-only).
   - Adicionar `NEXT_PUBLIC_SENTRY_DSN` (Client).
   - Adicionar `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (Build-only para upload de Source Maps).
2. **Deploy Controlado em Produção:**
   - Realizar o build/deploy oficial na Vercel.
   - Validar upload de Source Maps nos logs de build (`withSentryConfig`).
3. **Disparo de Evento de Teste Controlado:**
   - Executar disparo efêmero e controlado de erro sintético em rota administrativa protegida.
   - Confirmar recepção no dashboard do Sentry com:
     - `environment = production`
     - `release = <COMMIT_SHA>`
     - Stack trace completamente deobfuscada (Source Maps).
     - Ausência comprovada de PII, Authorization headers e cookies.
4. **Configuração de Regras de Alerta no Sentry:**
   - Configurar **Issue Alert**: Notificar imediatamente quando novo erro não tratado ocorrer em `environment: production`.
   - Configurar **Regression Alert**: Notificar quando erro marcado como resolvido voltar a ocorrer.
   - Validar entrega de notificação de alerta (e-mail de plantão / Slack).
5. **Fechamento Formal:**
   - Emissão do relatório final com status `PRODUCTION OBSERVABILITY: PASS`.

---

## 5. Verificação e Hardening de Observabilidade Redis / Upstash (Lote 7E.1A.1)

### 5.1 Fluxo Original e Inconsistência Confirmada
- **Diagnóstico do 7E.1A:** As funções `distributedRateLimit` e `distributedRateLimitWithInfo` capturavam exceções de rede do Upstash via `try/catch` e chamavam exclusivamente `logger.warn(...)`.
- **Lacuna Identificada:** Como `logger.warn` apenas emite log no console (stdout) e o erro era absorvido para permitir o fallback in-memory, **nenhum evento era transmitido ao Sentry**, impedindo a geração de Issues e alertas operacionais.
- **Resultado:** A inconsistência foi confirmada e corrigida no Lote 7E.1A.1.

### 5.2 Semântica de Segurança e Fallback In-Memory
- **Classificação de Semântica:** `DEGRADED_LOCAL_LIMIT` (Degradação local por processo).
- **Escopo e Lifetime:** O store de fallback (`RateLimitStore`) reside na memória local do processo Node.js / Lambda da Vercel, com limpeza por intervalo a cada 60s (`cleanupInterval.unref()`).
- **Limitações Serverless:** O fallback local **NÃO** é equivalente ao rate limiting distribuído do Redis. Em ambientes serverless com múltiplas instâncias concorrentes, contadores não são compartilhados e são redefinidos em cold starts.
- **Classificação de Segurança:** `ACCEPTABLE_TEMPORARY_DEGRADATION`. Prioriza a disponibilidade da aplicação e experiência do usuário legítimo durante indisponibilidade do Redis, mantendo contenção local contra abusos mono-instância.

### 5.3 Contrato de Observabilidade e Eventos Sentry
- **Despacho Centralizado:** Falhas em chamadas ao Upstash acionam `handleUpstashFailure(...)` em `lib/rate-limit.ts`, repassando o objeto `Error` original para `logger.error(...)`.
- **Tags Estruturadas:**
  - `component = rate-limit`
  - `dependency = upstash`
  - `operation = limit`
  - `degraded = true`
  - `endpoint = <options.key>`
- **Fingerprinting:** `['rate-limit', 'upstash', 'limit', endpointKey]` para agrupamento determinístico em Issue única no Sentry.
- **Anti-Event-Storm & Cooldown:** Cooldown in-memory de 60s (`UPSTASH_ERROR_COOLDOWN_MS = 60_000`) por rota. A 1ª ocorrência despacha para o Sentry (`logger.error`); ocorrências subsequentes dentro da janela são registradas localmente (`logger.warn`) sem poluir a cota do Sentry.
- **Privacidade:** O `identifier` bruto (IP do usuário, user ID ou e-mail) nunca é enviado nas tags, extra ou logMessage do Sentry. Segredos e URLs são higienizados por `lib/monitoring/sentrySanitizer.ts`.

### 5.4 Matriz de Gates Locais (7E.1A.1)

| Gate Local | Comando Executado | Resultado |
| :--- | :--- | :---: |
| **Unit Tests Monitoring + RateLimit** | `npm test -- __tests__/monitoring/ __tests__/lib/rate-limit.test.ts` | **PASS** (5 suítes / 41 testes) |
| **Unit Tests Security** | `npm test -- __tests__/security/` | **PASS** (4 suítes / 24 testes) |
| **Architecture Patterns** | `npm run check:architecture` | **PASS** (`✅ Padrões de arquitetura Supabase/cache OK`) |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** (Zero erros) |
| **Linting** | `npm run lint` (`eslint .`) | **PASS** (Zero warnings/erros) |
| **Production Build** | `npx next build` | **PASS** (129 rotas compiladas com sucesso) |
| **Git Diff Format** | `git diff --check` | **PASS** (Zero trailing whitespaces) |

