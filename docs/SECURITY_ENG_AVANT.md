# Segurança de engenharia — onboarding AVANT

Leitura estimada: **~5 minutos**. Hub de descoberta — **não** duplica checklists nem policies.

> **Frase-guia:** RLS é a fonte de verdade; gates cobrem o repetível; humano revisa zona vermelha.  
> **Não confundir** com o subtópico de conteúdo [Segurança do Paciente](PROTOCOLO_A4_MINIMO_SEGURANCA_PACIENTE.md) (enfermagem / PNSP).  
> **UI / design:** [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md).  
> **Barra do produto:** [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) · Threat: [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) · IR: [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) · Rituais: [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md)

---

## Qual trilho? (15 segundos)

| Você vai… | Trilho | Próximo passo |
|-----------|--------|---------------|
| Mudar auth, cache, API, Stripe, RLS, env | **A — Código / PR** | [Ordem A](#trilho-a--código--pr) |
| Deploy, webhooks, smoke RLS, headers | **B — Ops / produção** | [Ordem B](#trilho-b--ops--produção) |
| Auditar domínio após incidente ou PR quente; o que o gate não pega | **C — Além do gate** | [Ordem C](#trilho-c--além-do-gate) |
| Medir / marcar PASS da barra | Scorecard | [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) |
| Cadência mensal / trimestral / pentest | Rituais | [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) |
| Conteúdo de questão / handcraft | Pipeline | [`AGENTS.md`](../AGENTS.md) — **não** este hub |
| Polish só UI | Design | [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md) |

**Não misturar:** Security Review de PR ≠ meta-auditoria de catálogo ≠ design visual.

---

## Trilho A — Código / PR

**Ordem de leitura (pare quando souber decidir):**

1. [`.cursor/rules/avant-engineering.mdc`](../.cursor/rules/avant-engineering.mdc) — RLS, fontes canônicas, zona verde/amarela/vermelha · cópia: [`cursor/avant-engineering.mdc`](cursor/avant-engineering.mdc)  
2. [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) — o que o gate já pega vs checklist humano  
3. [`PROMPT_META_AUDITORIA_AVANT.md`](PROMPT_META_AUDITORIA_AVANT.md) **§7** — prompts Bugbot + Security Review  
4. [`MIGRATIONS_PR_CHECKLIST.md`](MIGRATIONS_PR_CHECKLIST.md) — se o PR toca `supabase/migrations/`  
5. Código: [`proxy.ts`](../proxy.ts) · [`lib/cache.ts`](../lib/cache.ts) · [`lib/env.ts`](../lib/env.ts) · [`lib/supabase/`](../lib/supabase/)

**Gates locais:**

```bash
npm run check:architecture   # invariantes Supabase/cache/env
npm run check:ship           # Done de Feature/Bug/API/Refactor
```

**No Cursor:** `Feature:` / `Bug:` / `API:` / `Refactor:` · PR zona amarela/vermelha → Bugbot + Security Review (§7).

---

## Trilho B — Ops / produção

**Ordem de leitura:**

1. [`DEPLOY.md`](DEPLOY.md) — env, webhooks, matriz infra/segurança, `smoke:rls`, **CI secrets `SMOKE_*`**, branch protection, secret scanning, **§ Ops produção** (Sentry #8 · Upstash #7 · MFA #11 · backup · paper drill #12)  
2. [`AUDITORIA_DEPLOY.md`](AUDITORIA_DEPLOY.md) — headers HTTP (HSTS/CSP), inventário, lacunas alinhadas ao scorecard  
3. [`SUPABASE_MAINTENANCE.md`](SUPABASE_MAINTENANCE.md) — auth (leaked password), RLS performance, backups no ciclo mensal  
4. [`WEBHOOK_SETUP.md`](WEBHOOK_SETUP.md) (+ [`WEBHOOK_SETUP_SQL.md`](WEBHOOK_SETUP_SQL.md) / resumo) — cache + auth welcome  
5. Scorecard + checklist ops (produção / GitHub): [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) · IR + RTO/RPO: [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) · rituais + pentest (#13): [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md)

**Smoke típico pós-migration RLS:**

```bash
npm run validate:env
npm run smoke:rls
```

---

## Trilho C — Além do gate

Use quando o gate **não** basta (incidente, área quente, PR vermelha, paper drill):

1. [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) §2 — **um domínio por vez** (auth **ou** cache **ou** Stripe…) — cadência mensal em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md)  
2. [`PROMPT_META_AUDITORIA_AVANT.md`](PROMPT_META_AUDITORIA_AVANT.md) §7 — Security Review no diff  
3. [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) — STRIDE nos 4 fluxos (login, admin, checkout, webhooks); revisão **trimestral**  
4. [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) — contém → rotaciona → smoke RLS → fecha  
5. Pentest focado (scorecard #13): [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md)  
6. Runbook eng: [`ENG_CONVERSA.md`](ENG_CONVERSA.md)

Não fazer varredura “repo inteiro” sem gatilho.

---

## Hierarquia de autoridade (anti-drift)

| Camada | Canônico | Papel |
|--------|----------|--------|
| Guardrails diários | `avant-engineering.mdc` | RLS, paths canônicos, zonas |
| Gate automatizado | `check:architecture` / `check:ship` | Invariantes repetíveis |
| Barra do produto | `SECURITY_SCORECARD.md` | 13 itens PASS/FAIL (CI + código + ops; #13 = pentest) |
| Checklist humano | `ENG_AUDITORIA_POR_RISCO.md` | O que o script não pega |
| Threat / IR / rituais | `SECURITY_THREAT_MODEL` / `SECURITY_INCIDENT_RUNBOOK` / `SECURITY_RITUAIS` | Modelo + resposta + cadência |
| Review de PR | Meta-auditoria §7 | Bugbot + Security Review |
| Deploy / RLS ops | `DEPLOY.md` + `SUPABASE_MAINTENANCE.md` | Produção e smoke |
| Migrations | `MIGRATIONS_PR_CHECKLIST.md` | Sem relaxar RLS/GRANT sem justificativa |
| Auto-aprovação eng | Matriz zona em `avant-engineering` | Verde fecha com gate; vermelha = humano |

Este hub **aponta**; não copia políticas RLS nem secrets.

**Nota:** [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md) é risco de **conteúdo** (A4 / dose) — espelho conceitual da matriz eng, não security de app.

---

## Always / Never (resumo)

**Always**

- RLS / policies Supabase como fonte de verdade  
- Service role **só** server-side (`createServerSupabase`)  
- Sessão em RSC: `getServerSession()`; `getUser()` só na borda (`proxy.ts`)  
- APIs: Zod + `requireAdminApi()` / `fetchWithAuth` conforme o caso  
- Env novo via Zod em `lib/env.ts` + `validate:env`  
- Webhooks Stripe: verificar assinatura; sem segundo trilho de pagamento  
- Zona vermelha: implementar, **não** declarar ship sem revisão humana  

**Never**

- Segurança só no client / esconder botão = “protegido”  
- `SUPABASE_SERVICE_ROLE_KEY` ou secrets em `NEXT_PUBLIC_*` / bundle client  
- Segundo `createBrowserClient` ou query de catálogo em RSC fora de `lib/cache.ts`  
- Relaxar RLS/GRANT em migration sem justificativa no PR  
- Misturar Security Review com handcraft / pipeline de conteúdo  

Detalhe: `avant-engineering` + `ENG_AUDITORIA_POR_RISCO` + `CLAUDE.md` §10.

---

## Por persona (tempo-alvo <10 min)

| Persona | Abre só |
|---------|---------|
| Dev em feature verde | Este hub → `avant-engineering` → `check:ship` |
| Dev / reviewer em PR amarela/vermelha | Este hub → `ENG_AUDITORIA` domínio → §7 Security Review |
| Ops / deploy | Este hub → `DEPLOY` → `SUPABASE_MAINTENANCE` → `smoke:rls` → scorecard ops |
| Incidente auth/cache/Stripe | Este hub → Trilho C → IR → um domínio em `ENG_AUDITORIA` |
| Dono da barra | [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) · rituais [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) |

---

## Não usar como onboarding de segurança de app

| Doc | Por quê |
|-----|---------|
| [`PROTOCOLO_A4_MINIMO_SEGURANCA_PACIENTE.md`](PROTOCOLO_A4_MINIMO_SEGURANCA_PACIENTE.md) | Conteúdo TE / PNSP |
| [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md) | Risco de conteúdo (A4), não threat model |
| Pipeline handcraft / qualidade | Catálogo, não auth/RLS |
| [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md) | UI visual |
| [`LEGADO_INDEX.md`](LEGADO_INDEX.md) | Índice histórico |

---

## Mapa rápido de arquivos sensíveis

| Peça | Path |
|------|------|
| Auth na borda | `proxy.ts` |
| Sessão RSC | `lib/supabase/server-auth.ts` |
| Service role | `lib/supabase/server.ts` |
| Client browser | `lib/supabase/client.ts` |
| Cache catálogo | `lib/cache.ts` |
| Env Zod | `lib/env.ts` |
| Admin API | `lib/admin/requireAdmin.ts` |
| Pagamentos | `app/api/pagamentos/**` |
| Gates | `scripts/check-architecture-patterns.ts` |
| Headers HTTP | `next.config.js` (ver `AUDITORIA_DEPLOY.md`) |
