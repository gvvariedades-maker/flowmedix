# Auditoria técnica — deploy e produção (AVANT)

**Última atualização:** 2026-07-23

Este documento complementa [`DEPLOY.md`](./DEPLOY.md): inventário do que **já existe no código**, lacunas **recomendadas** antes de escalar, e melhorias **opcionais**. Não substitui revisão de RLS no Supabase nem testes manuais de negócio.  
**Hub segurança eng:** [`SECURITY_ENG_AVANT.md`](./SECURITY_ENG_AVANT.md). Scorecard: [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md) (headers/CSP = #4; Upstash = #7; Sentry = #8; MFA = #11; drill = #12; pentest = #13). Rituais: [`SECURITY_RITUAIS.md`](./SECURITY_RITUAIS.md).  
**Checklist humano Sentry / Upstash / MFA / backup / paper drill / pentest:** [`DEPLOY.md`](./DEPLOY.md) § [Ops produção (scorecard)](DEPLOY.md#ops-produção-scorecard-pass-humano) — PASS no scorecard **sem** falhar `npm run build` local se DSN/Upstash ausentes.

---

## Resumo executivo

| Área | Situação |
|------|----------|
| Build e TypeScript | Projeto configurado para `npm run build` com validação de env prévia. |
| Variáveis de ambiente | `lib/env.ts` + `scripts/validate-env.ts`; layout trata falhas de validação (ver código). |
| Segurança HTTP | Headers em `next.config.js` (HSTS, frame, CSP, etc.). |
| Saúde da aplicação | `GET /api/health` com checagem de conectividade ao Supabase. |
| Erros de UI | `app/error.tsx`; `app/(dashboard)/error.tsx`. |
| 404 | `app/not-found.tsx`. |
| SEO / metadata | `app/layout.tsx` com `metadata`, `metadataBase`, keywords. |
| Cache | `lib/cache.ts` e invalidação por tags onde implementado. |
| Testes | Jest + Playwright; CI em `.github/workflows/test.yml`. |

**Conclusão:** a base está **adequada para deploy** desde que variáveis de produção, Supabase e smoke test estejam corretos. Lacunas de **scorecard ops** (Sentry #8, Upstash #7, MFA #11, backup, paper drill #12, pentest #13) são **PASS humano** — ver [`DEPLOY.md`](DEPLOY.md) § Ops produção e [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md); **não** bloqueiam build local sem DSN/Upstash.

---

## O que já está implementado (referência rápida)

| Item | Onde |
|------|------|
| Validação de env | `lib/env.ts`, `scripts/validate-env.ts`, script `build` |
| Security headers | `next.config.js` → `headers()` |
| Health check | `app/api/health/route.ts` |
| Error boundaries | `app/error.tsx`, `app/(dashboard)/error.tsx` |
| Not found | `app/not-found.tsx` |
| Logging | `lib/logger.ts` |
| Validação em APIs | Zod em várias rotas (`lib/validations.ts`) |

---

## Recomendações antes de escalar tráfego ou dados sensíveis

### 1. CI: build de produção + supply chain + RLS

O workflow `.github/workflows/test.yml` inclui **`build`**, **`security-audit`** (`npm audit --omit=dev --audit-level=high`) e **`smoke-rls`** condicional (secrets `SMOKE_*`). Dependabot: `.github/dependabot.yml`. Checklist de secrets e branch protection: [`DEPLOY.md`](DEPLOY.md) § CI/CD · barra: [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md).

### 2. Rate limiting distribuído (scorecard #7)

Limitação **em memória** não funciona bem entre instâncias serverless. Em **Production**, configurar **Upstash Redis** (`UPSTASH_REDIS_REST_*` ou `KV_REST_API_*`) — passo a passo em [`DEPLOY.md`](DEPLOY.md) § Ops produção. Sem env: fallback in-memory + warn em `validate:env` (clone/dev OK; **#7 FAIL** no scorecard até configurar).

### 3. Monitoramento de erros — Sentry (scorecard #8)

Código já presente (`instrumentation*.ts`, `sentry.*.config.ts`). **PASS #8** = DSN em Vercel Production (+ source maps opcionais no CI). Ausência de DSN **não** quebra build. Checklist: [`DEPLOY.md`](DEPLOY.md) § Ops produção · evidência no [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md).

### 4. Backup e restore (Supabase) — suporte a IR / #12

Documentar no processo (não é item isolado do scorecard 1–13, mas alimenta o paper drill):

- Backups automáticos do plano Supabase.
- Quem pode restaurar e **RTO/RPO** em [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) § Backup.
- Checklist mensal: [`SUPABASE_MAINTENANCE.md`](SUPABASE_MAINTENANCE.md).

### 5. Admin MFA (scorecard #11 — ops)

TOTP nas contas `ADMIN_EMAIL` / `ADMIN_EMAILS` no Supabase Auth — ver [`DEPLOY.md`](DEPLOY.md) § Ops produção. Código: só `requireAdminApi`.

### 6. RLS e service role

Revisar políticas no painel Supabase para todas as tabelas expostas ao cliente. A **service role** deve permanecer **apenas** em código servidor (API routes, server actions), nunca em `NEXT_PUBLIC_*`.

---

## Melhorias opcionais (produto / performance)

| Tema | Notas |
|------|--------|
| Vercel Analytics / Web Vitals | Mede LCP, INP, CLS em usuários reais. |
| Bundle | `next/dynamic` para componentes pesados fora do caminho crítico. |
| Imagens | `next/image`; domínios em `next.config.js` → `images.remotePatterns`. |
| PWA | Service worker, manifest — só se houver requisito explícito. |
| MCP Vercel (Cursor) | Opcional para DX; não substitui checklist de deploy. |

**FinOps:** o estado principal do AVANT é **Supabase (Postgres)**. Introduzir Vercel KV / Edge Config só faz sentido para casos específicos (feature flags globais, rate limit, etc.), não como padrão obrigatório.

---

## Métricas de referência (metas, não SLA)

Valores comuns de boas práticas (Core Web Vitals):

- **LCP** &lt; 2,5 s  
- **INP** &lt; 200 ms  
- **CLS** &lt; 0,1  

Devem ser validados com **dados reais** (RUM), não apenas Lighthouse local.

---

## Checklist consolidado

### Segurança

- [x] Headers de segurança (`next.config.js`) — evidência scorecard #4
- [ ] RLS revisado no Supabase para o cenário atual
- [ ] Segredos apenas em variáveis de ambiente do host
- [ ] Rate limiting distribuído em **Production** (Upstash — scorecard #7; [`DEPLOY.md`](DEPLOY.md) § Ops)
- [ ] Admin MFA no provedor (scorecard #11)

### Confiabilidade

- [x] Error boundaries globais / dashboard
- [x] `not-found`
- [x] Health check
- [x] Logging estruturado
- [ ] Backup + RTO/RPO anotados no IR ([`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md))

### DevOps

- [x] Testes automatizados no CI
- [x] **Build** (`npm run build`) no CI
- [x] **Supply chain** — Dependabot + job `security-audit` (`npm audit` high/critical)
- [x] **RLS smoke** no CI — job `smoke-rls` condicional (`SMOKE_*`; skip sem secrets)
- [ ] Branch protection + secret scanning (ops GitHub — [`DEPLOY.md`](DEPLOY.md) / scorecard)
- [x] Documentação de deploy (`DEPLOY.md`) + checklist ops produção

### Observabilidade

- [x] Health endpoint
- [ ] Sentry DSN em Production (scorecard #8 — [`DEPLOY.md`](DEPLOY.md) § Ops; **não** bloqueia build local)
- [ ] Paper drill IR (scorecard #12)
- [ ] Pentest focado + P0/P1 remedados (scorecard #13 — [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md))
- [ ] Analytics / Web Vitals *(opcional produto)*

---

## Comandos úteis

```bash
npm run validate:env
npm run build
npm run test
npm run test:e2e
npm run lint
```

---

## Histórico de alinhamento

Versões anteriores deste arquivo listavam “bloqueadores” (error boundaries, health, env, headers) como **não implementados**. O código foi atualizado desde então; realinhado em 2026-03-31 para refletir o repositório e evitar duplicação com `DEPLOY.md`.  
**2026-07-23:** Sentry / Upstash / MFA / backup / paper drill deixam de ser “opcional genérico” e passam a **PASS obrigatório no scorecard** (ops humano; sem fail de build local) — ver [`DEPLOY.md`](DEPLOY.md) § Ops produção e [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md).  
**2026-07-23 (Fase 5):** rituais mensal/trimestral + pentest focado (#13) em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md).
