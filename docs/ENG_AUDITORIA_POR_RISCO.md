# Auditoria por risco (engenharia)

> **Não** auditar “toda a estrutura” após rules/gates. Auditar o que os gates **não** bloqueiam.  
> Gates: `npm run check:architecture` · Done: `npm run check:ship` · PR zona amarela/vermelha: [`PROMPT_META_AUDITORIA_AVANT.md`](PROMPT_META_AUDITORIA_AVANT.md) §7.

## 1. O que o gate já cobre (não re-auditar no dia a dia)

| Check (`rule`) | Invariante |
|----------------|------------|
| `single-createBrowserClient` | Único `createBrowserClient` em `lib/supabase/client.ts` |
| `rsc-modulos-estudo-via-cache` | RSC não consulta `modulos_estudo` fora de `lib/cache.ts` |
| `no-console-in-app` | Sem `console.*` em `app/` / `components/` / `lib/` |
| `no-service-role-in-client` | Sem service role / `createServerSupabase` no client |
| `no-getuser-in-rsc` | Sem `.auth.getUser()` em RSC fora da allowlist |
| `no-new-env-without-zod` | `process.env` novo via `lib/env.ts` (ou allowlist legada) |

Baseline local: `npm run check:ship` (env + typecheck + arch + lint + test).

## 2. Checklist humano — só o que o script não pega

Rodar **por domínio** (1–2 h), não “repo inteiro”. Marcar ✅ / ⚠️ / ❌.

### Auth / sessão (zona vermelha)

- [ ] Mudanças em [`proxy.ts`](../proxy.ts) — `getUser()` só na borda; sem segundo middleware
- [ ] RSC usa `getServerSession()` ([`lib/supabase/server-auth.ts`](../lib/supabase/server-auth.ts)), não refresh no Node
- [ ] APIs admin: `requireAdminApi()`; aluno client: `fetchWithAuth`
- [ ] Cookies / logout / multi-aba: sem corrida óbvia de refresh

### Cache / catálogo (zona vermelha)

- [ ] Leitura de módulos/questão/histórico em RSC só via [`lib/cache.ts`](../lib/cache.ts)
- [ ] `unstable_cache` sem cookies de request; falha de rede não vira `[]` falso
- [ ] Invalidação (`revalidateTag` / helpers) coerente com o que mudou no DB

### RLS / Supabase / secrets

- [ ] RLS continua fonte de verdade — UI não “protege” sozinha
- [ ] Service role só server-side; sem `SUPABASE_SERVICE_ROLE_KEY` em bundle client
- [ ] Sem secrets em `NEXT_PUBLIC_*`; novos env no Zod de `lib/env.ts`

### Stripe / webhooks (zona vermelha)

- [ ] Webhook verifica assinatura; idempotência / replay
- [ ] Fluxo em `app/api/pagamentos/**` — sem inventar segundo trilho
- [ ] Migrations / policies novas: revisão humana antes de merge

### Player / vitrine (zona amarela — amostra)

- [ ] Diff de player/vitrine: smoke manual ou Playwright já existente
- [ ] Navegação vitrine ↔ questão (query, dismiss, histórico) sem regressão óbvia
- [ ] PR: Bugbot + Security Review se tocou auth/cache/API

## 3. Quando rodar o quê

| Gatilho | Ação |
|---------|------|
| Todo commit eng | Pre-commit + `check:architecture` (automático) |
| Done de `Feature:`/`Bug:` | `npm run check:ship` |
| PR zona amarela/vermelha | Bugbot + Security Review (§7 meta-auditoria) |
| Incidente / área quente | Só o domínio acima (auth **ou** cache **ou** Stripe…) |
| Clone novo | Copiar `docs/cursor/*.mdc` → `.cursor/rules/` se faltar |
| Mesmo anti-padrão **2×** | Novo gate em `check-architecture-patterns.ts` + linha no changelog de [`ENG_CONVERSA.md`](ENG_CONVERSA.md) |

## 4. Fora deste checklist

- Handcraft / L1–L6 / `production_ready` → pipeline de conteúdo (`QUALITY_*`, `audit:subtopico-*`)
- Polish só UI → `Visual:` / skill `avant-ui-visual`
- Varredura “toda a estrutura” sem gatilho → **não** recomendado

Índice: [`AGENTS.md`](../AGENTS.md) · Runbook eng: [`ENG_CONVERSA.md`](ENG_CONVERSA.md) · Rules: [`docs/cursor/avant-engineering.mdc`](cursor/avant-engineering.mdc)
