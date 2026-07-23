# Incident response — runbook (1 página)

> **Hub:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) · Scorecard item #12: [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md)  
> Exercitar **1×** (paper drill) e registrar data abaixo. Não substitui playbook do provedor (Vercel / Supabase / Stripe).

## Quem aciona

| Papel | Ação |
|-------|------|
| Quem detectou | Abrir incidente (chat/issue); **não** commitar secrets “para debug” |
| Eng on-call / dono do repo | Seguir checklist; rotacionar secrets; postmortem curto |
| Admin produto | Comunicar alunos só se houver vazamento de dados pessoais |

## Severidade rápida

| Nível | Exemplos | Meta |
|-------|----------|------|
| P0 | Leak de service role / webhook secret; fulfill falso em massa; RLS off em tabela sensível | Contém em minutos; rotaciona já |
| P1 | IDOR confirmado; admin bypass; Stripe sem assinatura em prod | Contém em horas |
| P2 | Rate limit só in-memory; Sentry down | Agenda + scorecard |

## Checklist (ordem)

1. **Contém** — desabilitar rota/feature afetada se possível (feature flag, rollback Vercel, pausar webhook no Stripe Dashboard).
2. **Revoga / rotaciona** (marque o que aplicou):
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` (Supabase → API → regenerate) + atualizar Vercel + invalidar deploys antigos se vazou
   - [ ] `STRIPE_WEBHOOK_SECRET` — novo endpoint/secret no Stripe + env Vercel
   - [ ] `SUPABASE_WEBHOOK_SECRET` (ou equivalente cache/auth welcome) — ver [`WEBHOOK_SETUP.md`](WEBHOOK_SETUP.md)
   - [ ] `STRIPE_SECRET_KEY` se houve abuso de API
   - [ ] Tokens `UPSTASH_*` / `SENTRY_*` se comprometidos
   - [ ] Sessões: forçar logout / banir usuário abusador no Auth se aplicável
3. **RLS** — `npm run smoke:rls` (ou SQL companion) em prod/staging; conferir policies em tabelas tocadas ([`supabase/INVENTARIO_PUBLIC.md`](../supabase/INVENTARIO_PUBLIC.md)).
4. **Stripe** — no Dashboard: eventos falhos, refunds, customers suspeitos; confirmar que handler rejeita assinatura inválida (400).
5. **Evidência** — logs Vercel/Sentry (sem colar secrets); IDs de `event.id` / `user_id` relevantes.
6. **Fecha** — root cause em 5–10 linhas; se anti-padrão **2×** → gate em `scripts/check-architecture-patterns.ts` ([`ENG_CONVERSA.md`](ENG_CONVERSA.md)).
7. **Scorecard** — atualizar item #12 + gaps descobertos.

## Contatos / painéis (preencher no drill)

| Sistema | Onde |
|---------|------|
| Vercel | Project → Settings → Environment Variables / Deployments |
| Supabase | Project Settings → API / Auth / Database |
| Stripe | Developers → Webhooks / API keys |
| GitHub | Settings → Secrets and variables / Actions |
| Sentry | Project → Issues / Settings → Client Keys (DSN) |
| Upstash | Console / Vercel Marketplace → Redis |

## Backup (RTO / RPO) — preencher na Fase 4 ops

Confirmar no Dashboard Supabase (Settings → Database / Backups) e anotar. Detalhe do checklist: [`DEPLOY.md`](DEPLOY.md) § Ops produção · evidência no [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) § Checklist ops (produção).

| Campo | Valor |
|-------|-------|
| Plano / backups automáticos | _ex.: Pro — daily PITR / daily snapshots_ |
| RPO (perda máxima aceitável) | _ex.: ≤ 24 h_ |
| RTO (tempo até restore útil) | _ex.: ≤ 4 h em horário comercial_ |
| Quem pode restaurar | _papel / nomes_ |
| Última confirmação de backup | _YYYY-MM-DD_ |
| Restore testado? | ☐ sim (staging) / ☐ só paper |

## Paper drill

| Campo | Valor |
|-------|-------|
| Data | _YYYY-MM-DD_ |
| Participantes | _nomes_ |
| Cenário simulado | _ex.: leak hipotético de webhook secret_ |
| Tempo até “contém” | _min_ |
| Lacunas encontradas | _link issue / nota_ |
| Scorecard #12 | ☐ PASS |

Threat model dos 4 fluxos: [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md). Auditoria por domínio pós-incidente: [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md). Cadência contínua + pentest (#13): [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md).
