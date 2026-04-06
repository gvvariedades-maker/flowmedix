# Auditoria técnica — deploy e produção (AVANT)

**Última atualização:** 2026-03-31

Este documento complementa [`DEPLOY.md`](./DEPLOY.md): inventário do que **já existe no código**, lacunas **recomendadas** antes de escalar, e melhorias **opcionais**. Não substitui revisão de RLS no Supabase nem testes manuais de negócio.

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

**Conclusão:** a base está **adequada para deploy** desde que variáveis de produção, Supabase e smoke test estejam corretos. Itens abaixo são **reforços**, não bloqueadores universais.

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

### 1. CI: build de produção

O workflow `.github/workflows/test.yml` inclui o job **`build`** (`npm run build` com env mínima). Para ainda mais fidelidade ao ambiente real, é possível trocar os placeholders do Supabase por **secrets** no repositório.

### 2. Rate limiting distribuído

Limitação **em memória** não funciona bem entre instâncias serverless. Para APIs públicas sensíveis, avaliar **Upstash Redis**, **Vercel KV** ou equivalente, ou proteção no WAF / API gateway — **só se** houver abuso ou requisito de compliance.

### 3. Monitoramento de erros (Sentry ou similar)

Opcional porém valioso em produção: captura de exceções não tratadas e performance. Exige DSN e configuração no Next.

### 4. Backup e restore (Supabase)

Documentar no processo interno:

- Backups automáticos do plano Supabase.
- Quem pode restaurar e em qual RTO/RPO.

### 5. RLS e service role

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

- [x] Headers de segurança (`next.config.js`)
- [ ] RLS revisado no Supabase para o cenário atual
- [ ] Segredos apenas em variáveis de ambiente do host
- [ ] Rate limiting distribuído (se necessário)

### Confiabilidade

- [x] Error boundaries globais / dashboard
- [x] `not-found`
- [x] Health check
- [x] Logging estruturado

### DevOps

- [x] Testes automatizados no CI
- [x] **Build** (`npm run build`) no CI
- [x] Documentação de deploy (`DEPLOY.md`)

### Observabilidade

- [x] Health endpoint
- [ ] Sentry (ou similar) *(opcional)*
- [ ] Analytics / Web Vitals *(opcional)*

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

Versões anteriores deste arquivo listavam “bloqueadores” (error boundaries, health, env, headers) como **não implementados**. O código foi atualizado desde então; este documento foi **realinhado** em 2026-03-31 para refletir o repositório e evitar duplicação com `DEPLOY.md`.
