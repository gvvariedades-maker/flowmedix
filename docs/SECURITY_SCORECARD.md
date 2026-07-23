# Scorecard de segurança — AVANT

> **Meta:** 100% deste scorecard (Next 16 + Supabase RLS + Stripe + admin por email). Não existe 100% absoluto de segurança.  
> **Hub:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) · Threat: [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) · IR: [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) · Rituais: [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md)

Atualizar status com evidência (link CI, commit, screenshot ops, data do paper drill / pentest). Itens **ops** não falham `npm run build` local se DSN/Upstash ausentes.

**Última fechamento código:** 2026-07-23 — `npm run check:ship` PASS (301 suites / 2531 tests) · Security Review Stripe ledger: P0/P1/P2 = 0.

| # | Item | Dono | Evidência | Status |
|---|------|------|-----------|--------|
| 1 | **Arquitetura** — `check:architecture` + `check:ship` verdes | CI / código | Local 2026-07-23: `check:ship` PASS; job `architecture-check` em [`test.yml`](../.github/workflows/test.yml) | **PASS** |
| 2 | **RLS smoke** — `npm run smoke:rls` (+ SQL companion) | CI condicional / ops | 2026-07-23: `smoke:rls` PASS remoto (incl. `stripe_webhook_events`); job `smoke-rls` (secrets CI opcional) | **PASS** |
| 3 | **Secrets / env Zod** — `validate:env`; sem secret em `NEXT_PUBLIC_*` | CI / código | `validate:env` no ship; gates `no-service-role-in-client` / `no-new-env-without-zod` | **PASS** |
| 4 | **Headers / CSP** — `next.config.js` alinhado a auditoria | código / ops | [`AUDITORIA_DEPLOY.md`](AUDITORIA_DEPLOY.md) — headers implementados; sem lacuna P0 aberta no inventário | **PASS** |
| 5 | **Stripe** — assinatura webhook + idempotência por `event.id` | código | `constructEvent` + ledger + migration `20260723120000` aplicada 2026-07-23 (`db:push --include-all`) + `smoke:rls` PASS (`anon_stripe_webhook_events_vazio`) | **PASS** |
| 6 | **IDOR mínimo** — histórico / matrícula cross-user | código / CI | `__tests__/security/` (`historico-idor`, `admin-forbid-aluno`, `anon-rls-contract`) no `check:ship` | **PASS** |
| 7 | **Rate limit distribuído em prod** — Upstash configurado | ops | `UPSTASH_REDIS_REST_*` na Vercel Production ([`DEPLOY.md`](DEPLOY.md)) | ☐ FAIL (ops) |
| 8 | **Sentry ativo em prod** — DSN | ops | `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` na Vercel Production | ☐ FAIL (ops) |
| 9 | **Supply chain** — Dependabot + `npm audit` no CI | CI | [`.github/dependabot.yml`](../.github/dependabot.yml) + job `security-audit`. **Job falha até limpar highs** (`next`, `sharp`, `ws`, `brace-expansion`, `fast-uri`, `js-yaml` — 2026-07-23) | **PASS** estrutura · ☐ FAIL audit |
| 10 | **PR zona vermelha** — Security Review §7 | processo | Review 2026-07-23 no diff ledger/migration/security tests — 0 P0/P1/P2 | **PASS** (este ciclo) |
| 11 | **Admin** — só `requireAdminApi`; MFA no provedor | código + ops | Código: rotas admin via `requireAdminApi` + teste `admin-forbid-aluno`. **Ops:** MFA TOTP nas contas admin | **PASS** código · ☐ FAIL MFA |
| 12 | **Incidente** — runbook exercitado (paper drill) | ops | Data + notas em [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) § Paper drill | ☐ FAIL (ops) |
| 13 | **Pentest focado** — auth + admin + Stripe + RLS leak; P0/P1 remedados | ops | Escopo + logs em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) | ☐ FAIL (ops) |

## Resumo fechamento código (Fase 3)

| Bloco | Resultado |
|-------|-----------|
| `check:ship` | PASS |
| Security Review Stripe ledger | 0 findings |
| `db:push` + `smoke:rls` | PASS 2026-07-23 (projeto linkado) |
| Scorecard #1–6, #10, parte #11 | PASS código |
| #9 `npm audit --audit-level=high` | FAIL até upgrade deps |
| #7/#8/#11 MFA/#12/#13 + GitHub protection | Ops humano |

## Rituais contínuos (Fase 5)

Cadência completa: [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md). Resumo:

| Ritmo | Ação | Alimenta |
|-------|------|----------|
| Mensal | 1 domínio em [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) + `smoke:rls` remoto | Log mensal nos rituais; issues se falha |
| Trimestral | Revisar 4 fluxos em [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) | Log trimestral; gaps → scorecard / issues |
| Sob demanda | Pentest focado (1–2 dias) | **#13** PASS após remediação P0/P1 |

## Notas de promoção

- **`npm audit`:** no dia 1, falha só em **high/critical** (`security-audit` em [`.github/workflows/test.yml`](../.github/workflows/test.yml)). Promover a `moderate` após o primeiro clean estável. **Antes de exigir `security-audit` na branch protection:** limpar highs atuais (ex. `next` / `sharp` / `ws` via Dependabot ou `npm audit fix`) — senão `main` fica vermelho de propósito até o upgrade.
- **`smoke-rls` no CI:** roda só com secrets `SMOKE_SUPABASE_URL`, `SMOKE_SUPABASE_ANON_KEY`, `SMOKE_SUPABASE_SERVICE_ROLE_KEY`; sem secrets = skip com aviso — não bloqueia clone. Detalhe: [`DEPLOY.md`](DEPLOY.md) § CI secrets.
- **Branch protection (`main`):** exigir `architecture-check` + `security-audit`; incluir `smoke-rls` quando secrets existirem. Checklist: [`DEPLOY.md`](DEPLOY.md) § Branch protection.
- **Secret scanning + push protection:** habilitar no repositório GitHub; checklist em [`DEPLOY.md`](DEPLOY.md) § Secret scanning.

## Checklist ops (GitHub) — marcar PASS com data

| Item | Onde | Feito em |
|------|------|----------|
| Dependabot ativo (PRs npm / actions) | [`.github/dependabot.yml`](../.github/dependabot.yml) + aba Dependabot | |
| Job `security-audit` verde em `main` | Actions → workflow Testes | ⚠ blocked by highs 2026-07-23 |
| Secrets `SMOKE_*` configurados | Settings → Secrets → Actions | |
| Branch protection exige `architecture-check` + `security-audit` | Settings → Branches | |
| `smoke-rls` exigido na protection (após secrets) | Settings → Branches | |
| Secret scanning + push protection | Settings → Code security | |

## Checklist ops (produção) — humano; **não** falha `npm run build`

Passo a passo em [`DEPLOY.md`](DEPLOY.md) § [Ops produção (scorecard)](DEPLOY.md#ops-produção-scorecard-pass-humano). Marcar **Feito em** e o item # do scorecard acima. Ausência de DSN/Upstash em clone/dev é esperada.

| Item scorecard | Ação (evidência sem colar secrets) | Feito em |
|----------------|-------------------------------------|----------|
| **#8 Sentry** | Vercel Production: `SENTRY_DSN` e/ou `NEXT_PUBLIC_SENTRY_DSN`. Opcional CI: `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` (source maps). Confirmar evento de teste no painel Sentry. Código: `instrumentation*.ts` / `sentry.*.config.ts`. | |
| **#7 Upstash** | Vercel Production: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_*`). Sem isso → rate limit in-memory + warn em `validate:env`. Smoke: 11º `POST /api/pagamentos/criar-sessao` → 429. | |
| **#11 Admin MFA** | Supabase Auth → MFA (TOTP) **obrigatório** nas contas listadas em `ADMIN_EMAIL` / `ADMIN_EMAILS`. Evidência: screenshot Settings Auth / usuário com fator ativo (sem QR). Parte código (`requireAdminApi`) já é gate de PR. | |
| **Backup** (suporte a IR) | Supabase: backups do plano ativos; anotar RTO/RPO em [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) § Backup. Quem pode restaurar (papel). Não é item #1–13 isolado — bloqueia confiança do #12. | |
| **#12 Paper drill** | Exercitar 1× o checklist de [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md); preencher tabela § Paper drill; marcar #12 PASS. | |
| **#13 Pentest** | Executar escopo em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) § Pentest; remediar P0/P1; preencher log pentest; marcar #13 PASS. |

**Critério de fechamento Fase 4:** linhas #7/#8/#11/backup/#12 com data **ou** gap explícito. **Fase 5:** #13 + logs mensal/trimestral em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md). Não declarar “100% scorecard” com #7/#8/#11/#12/#13 em aberto sem nota.

### Gaps ainda abertos

| Scorecard # | Gap | Dono | Meta |
|-------------|-----|------|------|
| #9 | Limpar `npm audit` high (`next`/`sharp`/`ws`/…) | eng | Dependabot / upgrade controlado |
| #7 | Upstash Redis em Vercel Production | ops | [`DEPLOY.md`](DEPLOY.md) § Ops 2 |
| #8 | `SENTRY_DSN` (e opcional source maps CI) em Production | ops | [`DEPLOY.md`](DEPLOY.md) § Ops 1 |
| #11 | MFA TOTP nas contas `ADMIN_EMAIL` / `ADMIN_EMAILS` | ops | [`DEPLOY.md`](DEPLOY.md) § Ops 3 |
| Backup | Confirmar backups + RTO/RPO no IR | ops | [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) § Backup |
| #12 | Paper drill 1× + data no IR | ops | [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) § Paper drill |
| #13 | Pentest focado + remediação P0/P1 | ops | [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) § Pentest |
| GitHub | Branch protection + secret scanning + `SMOKE_*` | ops | [`DEPLOY.md`](DEPLOY.md) § CI/CD |

## Como marcar PASS

| Tipo | Critério |
|------|----------|
| CI / código | Job verde em `main` ou evidência de merge do gate |
| Ops | Screenshot / env list (sem valores) / data do drill |
| Processo | PR recente zona vermelha com §7 anexado ou checklist preenchido |

**Fora deste scorecard:** SOC2, WAF pago, falhar build sem Sentry, handcraft do subtópico “Segurança do Paciente”.
