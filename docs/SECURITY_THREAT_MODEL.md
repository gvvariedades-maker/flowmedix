# Threat model (STRIDE leve) — AVANT

> **Hub:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) · Scorecard: [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) · IR: [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) · Rituais: [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md)  
> Revisar **trimestralmente** — cadência e log em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md). Escopo: app eng — não conteúdo TE.

Modelo enxuto nos **4 fluxos** críticos. Controles = o que já existe ou está no scorecard; gaps = itens FAIL até fecharem.

---

## 1. Login / sessão (`proxy.ts` + cookies)

| STRIDE | Ameaça | Controle | Gap residual |
|--------|--------|----------|--------------|
| Spoofing | Sessão forjada / token roubado | Supabase Auth + `getUser()` **só** na borda ([`proxy.ts`](../proxy.ts)); RSC usa `getServerSession()` read-only | MFA aluno opcional; MFA **admin** = item scorecard |
| Tampering | Cookie / JWT manipulado | Verificação no provedor; sem segundo refresh no Node | — |
| Repudiation | “Não fui eu” em ações autenticadas | Logs Sentry/host + histórico no DB com `user_id` | Sentry DSN prod (ops) |
| Information disclosure | Leak de sessão entre abas / SSR | Web Locks no client; cache sem cookies de request em `unstable_cache` | — |
| Denial of service | Flood de auth | Rate limit (Upstash em prod) | Upstash prod (ops) |
| Elevation | Aluno vira admin via cookie | Admin só por allowlist email + `requireAdminApi` — não flag client | MFA admin |

**Arquivos âncora:** `proxy.ts` · `lib/supabase/server-auth.ts` · `lib/supabase/client.ts`

---

## 2. Admin (`requireAdminApi`)

| STRIDE | Ameaça | Controle | Gap residual |
|--------|--------|----------|--------------|
| Spoofing | JWT de aluno em rota admin | `requireAdminApi()` valida sessão + email em `ADMIN_EMAIL` / `ADMIN_EMAILS` | Suite `__tests__/security/admin-forbid-aluno.test.ts` (scorecard #6) |
| Tampering | Body malicioso no Laboratório / admin APIs | Zod (`QuestaoCompletaSchema` e schemas de rota) | — |
| Repudiation | Mudança admin sem trilha | Logs + revisão PR zona vermelha | — |
| Information disclosure | Service role no browser | Gate `no-service-role-in-client`; `createServerSupabase` só server | — |
| Denial of service | Spam em APIs admin | Rate limit + auth obrigatória | Upstash |
| Elevation | Bypass “esconder UI” | RLS + `requireAdminApi` — UI não é controle | — |

**Arquivos âncora:** `lib/admin/requireAdmin.ts` · `app/(admin)/**` · `app/api/admin/**`

---

## 3. Checkout (`criar-sessao` / Stripe Checkout)

| STRIDE | Ameaça | Controle | Gap residual |
|--------|--------|----------|--------------|
| Spoofing | Sessão de checkout em nome de outro usuário | Sessão autenticada + payload Zod; Stripe Session server-side | — |
| Tampering | Alterar preço / produto no client | Preços e `price_id` só no servidor | — |
| Repudiation | “Paguei e não recebi” | Webhook Stripe + `concurso_purchases` + ledger `stripe_webhook_events` | Scorecard #5 |
| Information disclosure | Leak de secret Stripe | Secrets só server / env Zod; sem `NEXT_PUBLIC_` de secret | — |
| Denial of service | Flood criar-sessão | Rate limit | Upstash |
| Elevation | Matricular sem pagamento | Entitlement só após webhook verificado + claim `event.id` | — |

**Arquivos âncora:** `app/api/pagamentos/**` · `lib/stripe/**`

---

## 4. Webhooks (Stripe / cache / auth welcome)

| STRIDE | Ameaça | Controle | Gap residual |
|--------|--------|----------|--------------|
| Spoofing | Replay / evento forjado | `constructEvent` + `STRIPE_WEBHOOK_SECRET`; secrets de webhook Supabase | Rotação no IR |
| Tampering | Payload alterado em trânsito | Assinatura Stripe / secret compartilhado | — |
| Repudiation | Double fulfill | Ledger `stripe_webhook_events` (`processing`→`processed`) + state-based (`paid` / upsert) | Stuck `processing` → 503 + ops DELETE (checklist migrations) |
| Information disclosure | Body de webhook em logs | Logger sem dump de PII/secrets; `payload_hash` opcional no ledger | — |
| Denial of service | Flood webhook | Stripe retries + claim/release no handler; rate limit onde aplicável | — |
| Elevation | Webhook → service role amplo | Handler mínimo; fulfill só tabelas necessárias; RLS service_role only em `stripe_webhook_events` | Migration zona vermelha — humano aprova `db:push` |

**Arquivos âncora:** `lib/stripe/webhookRouteHandler.ts` · `app/api/cache/revalidate` · [`WEBHOOK_SETUP.md`](WEBHOOK_SETUP.md)

---

## Fora de escopo (neste modelo)

- Ameaças de conteúdo pedagógico / PNSP  
- Infra física / SOC2  
- Supply chain npm (coberto no scorecard #9, não STRIDE por fluxo)

Revisão humana de domínio: [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) (Trilho C — Além do gate). Cadência mensal/trimestral + pentest: [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md).
