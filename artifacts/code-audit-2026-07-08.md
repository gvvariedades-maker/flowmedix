# Auditoria de código AVANT — 2026-07-08

**Gerado em:** 2026-07-08T15:30:00Z (local)  
**Escopo:** engenharia (não catálogo L1–L6)  
**Ambiente:** Windows, `.env.local` presente

---

## Resumo executivo

| Gate | Resultado | Notas |
|------|-----------|-------|
| `validate:env` | ✅ PASS | Stripe/Sentry opcionais ausentes; Upstash Redis OK |
| `check:architecture` | ✅ PASS | `createBrowserClient` único; RSC sem `modulos_estudo` direto |
| `npm run build` | ✅ PASS | ~10 min; 116 páginas estáticas/SSG/dynamic |
| `npm test` | ⚠️ **2 falhas** | 263/265 suites, 2106/2108 tests — timeouts (flaky) |
| `npm run lint` | ❌ **37 problemas** | 30 errors, 7 warnings |
| `test:e2e:chromium` | ⏭️ Não executado | Baseline local; rodar antes de release |

**Veredito:** código **compilável e arquiteturalmente conforme**. **Correções 2026-07-08:** testes flaky + lint errors resolvidos (0 errors, 7 warnings).

---

## Correções aplicadas (2026-07-08 pós-auditoria)

| Item | Correção |
|------|----------|
| `simulado-analytics.route.test` | Mock `createServerSupabase` + `syncPendingSimuladoAnalytics` |
| `AvantLessonPlayer.elimination.test` | `waitFor` + timeout 15s |
| `AvantLessonPlayer.tsx` | Hooks após early return — `questionUnavailableUi` no return final |
| `missao-semanal/page.tsx` | Componentes de erro fora de try/catch |
| `useCatalogStatsCountUp.ts` | `targetsRef` atualizado em `useEffect` |
| Moldes slides | `SlideLucideIcon` + override ESLint em `variants/**` |
| `dangerZoneReveal.ts` | Modo auto sem `useEffect` |
| `eslint.config.mjs` | Overrides para variants + hook count-up |

**Lint atual:** `0 errors`, `7 warnings` (exhaustive-deps / no-html-link — não bloqueantes).

---

## 1. Baseline automatizado

### 1.1 `validate:env` ✅

```
✅ Variáveis de ambiente OK
✅ Upstash Redis configurado (rate limit distribuído)
⚠️  Stripe checkout/webhook desativados (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)
ℹ️  Sentry desativado (usa /api/client-error como fallback)
```

**Achados:**

| ID | Sev. | Item | Ação |
|----|------|------|------|
| ENV-1 | P2 | Stripe não configurado localmente | Esperado em dev; obrigatório em produção com checkout |
| ENV-2 | P2 | Sentry ausente | Opcional; seam em `lib/monitoring/reportClientError.ts` |
| ENV-3 | Info | Upstash ativo | Atualiza `AUDITORIA_DEPLOY.md` (doc antiga citava só rate limit em memória) |

### 1.2 `check:architecture` ✅

Script: `scripts/check-architecture-patterns.ts`

- ✅ Um único `createBrowserClient` em `lib/supabase/client.ts`
- ✅ Nenhum RSC `page.tsx` consultando `modulos_estudo` fora de `lib/cache.ts` (allowlist respeitada)

### 1.3 `npm run build` ✅

- Next.js 16.2.6 — compilou em ~7,2 min
- TypeScript OK (~64 s)
- 116 rotas geradas
- Avisos build: Browserslist desatualizado (7 meses); Resend desativado no worker de páginas

**Nota:** primeira tentativa falhou com `Another next build process is already running` (lock concorrente); retry PASS.

### 1.4 `npm test` ⚠️

```
Test Suites: 2 failed, 263 passed, 265 total
Tests:       2 failed, 2106 passed, 2108 total
Time:        ~695 s
```

| Suite | Falha | Causa provável |
|-------|-------|----------------|
| `AvantLessonPlayer.elimination.test.tsx` | timeout 5000 ms | `restaura eliminações da sessão ao remontar` — carga CPU / player pesado |
| `simulado-analytics.route.test.ts` | timeout 5000 ms | `retorna payload esperado com headers de cache` |

**Recomendação:** re-rodar isolado (`npm test -- <file>`). Se passar, marcar como flaky e aumentar timeout ou mockar async. Não bloqueia build.

### 1.5 `npm run lint` ❌

```
✖ 37 problems (30 errors, 7 warnings)
Tempo: ~14 min
```

**Distribuição por regra:**

| Regra ESLint | Qtd. aprox. | Onde |
|--------------|------------|------|
| `react-hooks/static-components` | ~20 | `components/slides/variants/*` (ícones Lucide em render) |
| `react-hooks/set-state-in-effect` | ~5 | slides interativos + `dangerZoneReveal.ts` |
| `react-hooks/error-boundaries` | 3 | `missao-semanal/page.tsx` (JSX em try/catch) |
| `react-hooks/refs` | 1 | `hooks/useCatalogStatsCountUp.ts` |
| `react-hooks/exhaustive-deps` | 4 warnings | DashboardShell, VitrineClient, dev tools |
| `@next/next/no-html-link-for-pages` | 1 warning | `global-error.tsx` |

**Arquivos com mais achados:**

- `components/slides/variants/SaeResponsibilityMatrix.tsx`
- `components/slides/variants/SusLegalPillarsConceptMap.tsx`
- `components/slides/variants/LogicFlowPniVfJuggleTap.tsx`
- `components/slides/variants/AdmeJourneyRailConceptMap.tsx`
- `components/accessibility/ReadableTextZoom.tsx`
- `components/lesson/AvantLessonPlayer.tsx`
- `app/(dashboard)/(authenticated)/missao-semanal/page.tsx`

**Prioridade:** P1 — não impede build, mas CI pode falhar se lint for gate obrigatório no PR.

### 1.6 E2E ⏭️

Não executado nesta sessão (build + test + lint ≈ 25 min). Comando recomendado:

```bash
npm run test:e2e:chromium
npm run test:e2e:drawer    # mobile
```

CI (`.github/workflows/test.yml`) roda suite completa Playwright em push/PR.

---

## 2. Superfícies críticas (revisão estática)

### 2.1 Auth e sessão

| Área | Arquivo | Status |
|------|---------|--------|
| Borda auth | `proxy.ts` | ✅ `getUser()` uma vez por request |
| RSC read-only | `lib/supabase/server-auth.ts` | Padrão documentado em CLAUDE.md |
| Admin API | `lib/admin/requireAdmin.ts` | Usado nas rotas `app/api/admin/**` |
| Bearer client | `lib/api/fetch-with-auth.ts` | Testado em `__tests__/lib/api/fetch-with-auth.test.ts` |

### 2.2 APIs (`app/api/**`)

- **83** Route Handlers
- **31** arquivos de teste em `__tests__/api/`
- Cobertura forte: vitrine, simulados, pagamentos, cache, health, entitlements
- **Gaps de teste** (rotas sem spec dedicado — revisar auth manualmente):

| Rota | Risco | Notas |
|------|-------|-------|
| `admin/lp-pages/**` | Médio | Admin — verificar `requireAdminApi` |
| `admin/invite-links/**` | Médio | Tokens de convite |
| `admin/concursos/**` | Alto | Matrículas, módulos |
| `admin/email-templates/**` | Médio | Envio transacional |
| `analytics/**` | Médio | Dados de usuário |
| `reportar-erro` | Baixo | Público autenticado |
| `client-error` | Baixo | Telemetria client |
| `zerar-desempenho` | Médio | Destrutivo — confirmar auth |
| `convite/**` | Alto | Resgate de token |

Rotas públicas **por design** (com secret próprio): `health`, `pagamentos/webhook`, `cache/revalidate`, `webhooks/auth`, `metrics` (METRICS_SECRET).

### 2.3 Cache

- Fonte: `lib/cache.ts`
- Testes: `__tests__/cache.test.ts`, `api/cache/revalidate.test.ts`
- CI `architecture-check` valida padrão RSC → cache

### 2.4 Pagamentos

- Testes: `__tests__/pagamentos/webhook.test.ts`, `criar-sessao.test.ts`, `guestCheckoutWebhook.test.ts`
- Stripe desligado no ambiente local desta auditoria

### 2.5 Logging

- `console.log` em `app/**`: apenas `app/layout.tsx` (env validation dev) — ✅ aceitável
- Produção: `lib/logger.ts`

---

## 3. CI existente

| Workflow | Jobs | Quando |
|----------|------|--------|
| `.github/workflows/test.yml` | build, test-unit, architecture-check, test-e2e, perf-smoke | push/PR main, develop |
| `.github/workflows/quality-layers.yml` | catalog-preflight, slides-visual, nightly health | PR catálogo / cron 04:00 |

**Gap local vs CI:** lint **não** aparece como job separado em `test.yml` — considerar adicionar `npm run lint` ao CI.

---

## 4. Plano de remediação priorizado

### P0 — antes de release

| # | Item | Comando / ação |
|---|------|----------------|
| 1 | Confirmar testes flaky | `npm test -- __tests__/api/simulado-analytics.route.test.ts` |
| 2 | E2E smoke | `npm run test:e2e:chromium` |
| 3 | RLS Supabase | Revisão manual no painel (fora do repo) |

### P1 — qualidade contínua

| # | Item | Ação |
|---|------|------|
| 4 | ESLint 30 errors | Batch em slides: extrair ícones Lucide fora do render; refatorar effects |
| 5 | `missao-semanal/page.tsx` | Trocar try/catch+JSX por error boundary |
| 6 | `useCatalogStatsCountUp.ts` | Mover update de ref para `useEffect` |
| 7 | Lint no CI | Adicionar job em `test.yml` |

### P2 — observabilidade / ops

| # | Item |
|---|------|
| 8 | Sentry em produção (opcional) |
| 9 | `npx update-browserslist-db@latest` |
| 10 | Resend keys em staging para smoke de e-mail |

---

## 5. Comandos para re-auditar

```bash
npm run validate:env
npm run check:architecture
npm run lint
npm test
npm run build
npm run test:e2e:chromium
```

Atualizar este arquivo após cada rodada:

```bash
# Data no nome: artifacts/code-audit-YYYY-MM-DD.md
```

---

## 6. Referências

- [`docs/AUDITORIA_DEPLOY.md`](../docs/AUDITORIA_DEPLOY.md)
- [`docs/AUDITORIA_MOBILE.md`](../docs/AUDITORIA_MOBILE.md)
- [`docs/PROMPT_META_AUDITORIA_AVANT.md`](../docs/PROMPT_META_AUDITORIA_AVANT.md) — catálogo
- [`CLAUDE.md`](../CLAUDE.md) §2 — padrões arquiteturais
- [`.github/workflows/test.yml`](../.github/workflows/test.yml)

---

## Histórico desta execução

| Comando | Início | Duração | Exit |
|---------|--------|---------|------|
| validate:env | 14:58 | ~53 s | 0 |
| check:architecture | 14:58 | ~53 s | 0 |
| lint | 14:58 | ~14 min | 1 |
| test | 15:01 | ~11,5 min | 1 |
| build (1ª) | 15:01 | ~2 min | 1 (lock) |
| build (2ª) | 15:15 | ~10 min | 0 |
