# Supabase — manutenção preventiva (AVANT)

Runbook repetível para deploy, smoke e revisão mensal. Baseline de produção abaixo serve como evidência **antes/depois** das fases do plano de manutenção.

**Projeto:** `ozgouenqrofnvgrlgfwd` (ref da URL `https://ozgouenqrofnvgrlgfwd.supabase.co`)

**Docs relacionados:** [`SECURITY_ENG_AVANT.md`](./SECURITY_ENG_AVANT.md) (hub segurança), [`SECURITY_SCORECARD.md`](./SECURITY_SCORECARD.md) (ops #7–#13), [`SECURITY_RITUAIS.md`](./SECURITY_RITUAIS.md) (mensal domínio + trimestral threat + pentest), [`DEPLOY.md`](./DEPLOY.md) § Ops produção, [`SECURITY_INCIDENT_RUNBOOK.md`](./SECURITY_INCIDENT_RUNBOOK.md) (backup RTO/RPO), [`supabase/INVENTARIO_PUBLIC.md`](../supabase/INVENTARIO_PUBLIC.md), [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md), [`SCALE_HEALTH.md`](./SCALE_HEALTH.md), [`WEBHOOK_SETUP.md`](./WEBHOOK_SETUP.md), [`SISTEMA_CACHE.md`](./SISTEMA_CACHE.md)

---

## Pré-deploy

1. **Migrations:** `npm run db:push` (ou `supabase db push` com projeto linkado). Conferir drift local ↔ remoto (seção [Baseline — migrations](#baseline--migrations)).
2. **Env:** `npm run validate:env` (roda também no `npm run build`).
3. **PostgREST Max Rows:** `npm run supabase:max-rows -- --dry-run` e, se necessário, aplicar sem `--dry-run` (teto ≥ 10.000 — ver [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md)).
4. **Tipos (opcional):** após DDL, `npm run check:db-types` (diff com snapshot) ou `--update` para commitar [`types/database.supabase.snapshot.ts`](../types/database.supabase.snapshot.ts).

---

## Pós-deploy (smoke)

| Passo | Comando / ação | Critério |
|-------|----------------|----------|
| Health | `GET /api/health` | `status: ok`, `database: ok` |
| Escala | `npm run scale:health` | exit `0` ou `1` sem crítico de catálogo |
| Vitrine | Abrir `/estudar` ou `GET /api/vitrine?page=1` autenticado | JSON com grupos; sem erro 500 |
| Questão | Abrir `/estudar/[slug]` de um slug conhecido | Player carrega enunciado |
| Advisors | Supabase Dashboard → Database → Advisors (ou MCP `get_advisors`) | Sem WARN novo crítico de RPC pública |
| RLS performance | `npm run smoke:rls` + [`supabase/scripts/rls_performance_smoke.sql`](../supabase/scripts/rls_performance_smoke.sql) no SQL Editor | Anon vê vendáveis; matriculado manual em `/estudar`; sem policies legadas em `historico_questoes` |
| Cache webhook | Após configurar GUCs (Fase 1.2): `INSERT` teste em `modulos_estudo` | Log Vercel 200 em `/api/cache/revalidate` |

Admin (sessão): `GET /api/admin/scale-health` — mesmo payload que `npm run scale:health -- --json`.

---

## Mensal

1. **Advisors** security + performance (Dashboard ou MCP).
2. **Max rows:** confirmar valor ≥ 10.000 (`npm run supabase:max-rows`); registrar em [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md#valor-confirmado-produção) se alterado. **Última confirmação:** 15.000 em 2026-06-04.
3. **Escala:** `npm run scale:health` + `avant_scale_health_metrics` (via script ou admin).
4. **Cache:** teste manual — alterar um módulo no Laboratório e ver vitrine atualizar (webhook) ou em até ~5–15 min (TTL cache).
5. **Crons Vercel** (`vercel.json`): matrículas `0 3 * * *` → `/api/admin/manutencao/expirar-matriculas`; retenção simulado `0 4 1 * *` → `/api/admin/manutencao/simulado-retention` com `Authorization: Bearer ${CRON_SECRET}`.
6. **Auth Dashboard:** conferir [Leaked password protection](#auth-leaked-password-protection) (ação manual no Dashboard).
7. **Admin MFA:** contas em `ADMIN_EMAIL` / `ADMIN_EMAILS` com TOTP ativo (scorecard #11 — [`DEPLOY.md`](DEPLOY.md) § Ops produção).
8. **Backups:** confirmar backups do plano + RTO/RPO no [`SECURITY_INCIDENT_RUNBOOK.md`](SECURITY_INCIDENT_RUNBOOK.md) § Backup.
9. **Índices “unused” (INFO):** não remover antes de ~30 dias de carga real em produção.
10. **Segurança (paralelo):** 1 domínio de [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) + `npm run smoke:rls` — log em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) (não duplicar checklist aqui).

---

## Trimestral (Definition of Done — operação contínua)

Executar **tudo** do checklist mensal acima, mais:

| # | Item | Comando / ação | Critério |
|---|------|----------------|----------|
| 1 | Migrations alinhadas | `npm run migration:list` | Colunas Local e Remote idênticas; ver [Reconciliar drift](#reconciliar-drift-migrations) se divergir |
| 2 | Push sem pendências | `npm run db:push` | `Remote database is up to date` |
| 3 | Arquitetura cache/Supabase | `npm run check:architecture` | exit 0 (também roda no CI) |
| 4 | Types vs schema | `npm run check:db-types` | exit 0; se drift, revisar e `npm run check:db-types -- --update` |
| 5 | Scale health | `npm run scale:health -- --json` | sem alerta crítico de catálogo/truncamento |
| 6 | RLS smoke | `npm run smoke:rls` + [`rls_performance_smoke.sql`](../supabase/scripts/rls_performance_smoke.sql) | anon vendáveis; matriculado manual |
| 7 | Cache webhook | `INSERT` teste em `modulos_estudo` ou `SELECT invalidate_cache_via_webhook(...)` | 200 em `/api/cache/revalidate` (Vercel) |
| 8 | Retenção simulado | `GET /api/admin/manutencao/simulado-retention` + cron Vercel | 200 com `CRON_SECRET` |
| 9 | Inventário RPC | Revisar [`supabase/INVENTARIO_PUBLIC.md`](../supabase/INVENTARIO_PUBLIC.md) | RPCs novas documentadas |
| 10 | Baseline | Atualizar seção [Baseline](#baseline--snapshot-2026-06-04) abaixo | migrations count, advisors, row counts |
| 11 | Threat model (segurança) | Revisar 4 fluxos em [`SECURITY_THREAT_MODEL.md`](SECURITY_THREAT_MODEL.md) | Log em [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md) |

**Tipos:** `types/database.ts` é hand-curated para o app; o drift de schema usa snapshot gerado (`types/database.supabase.snapshot.ts`). MCP Supabase `generate_typescript_types` é equivalente ao `supabase gen types typescript --linked`.

---

## Reconciliar drift (migrations)

Quando `migration list` mostra versões só em Local ou só em Remote (mesmo DDL já aplicado):

1. Identifique o **nome lógico** da migration (`*_descricao.sql`).
2. No remoto: `SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;` (SQL Editor ou MCP).
3. **Renomeie** arquivos em [`supabase/migrations/`](../supabase/migrations/) para o timestamp do remoto — **sem** alterar o SQL se o DDL já rodou.
4. Duplicata no remoto (ex. dois `performance_nav_indexes`) → segundo arquivo local no-op com comentário (`SELECT 1;`).
5. Migration partida no remoto → dividir arquivos locais na mesma ordem de versões.
6. Validar: `npm run migration:list` (38 entradas pareadas em 2026-06-04) e `npm run db:push`.

Detalhes: [`supabase/migrations/README.md`](../supabase/migrations/README.md).

**Não fazer:** `repair --status reverted` + `db push` para “reaplicar” DDL que já existe — risco de erro ou duplicação.

---

## Auth — Leaked password protection

Proteção contra senhas vazadas (Have I Been Pwned) **não** é configurável por migration; ative no Supabase Dashboard **uma vez por projeto** e revise no checklist mensal.

| Passo | Onde |
|-------|------|
| 1 | [Dashboard](https://supabase.com/dashboard) → projeto **AVANT** (`ozgouenqrofnvgrlgfwd`) |
| 2 | **Authentication** → **Providers** → **Email** (ou **Settings** → **Auth** → **Password security**, conforme layout atual) |
| 3 | Ativar **Leaked password protection** / **Prevent the use of leaked passwords** |
| 4 | Salvar; opcional: testar cadastro com senha conhecida vazada (deve falhar com erro de senha fraca/vazada) |

Documentação: [Password strength and leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

**Onboarding admin (novo ambiente):** incluir este passo no mesmo dia do primeiro deploy de Auth (antes de abrir cadastro público).

Após ativar: atualizar o baseline abaixo (remover WARN “leaked password protection desligado” nos advisors).

---

## Atualizar este baseline

```text
1. MCP Supabase: list_migrations
2. MCP Supabase: get_advisors (security + performance)
3. SQL (service role / SQL Editor):
   SELECT relname, n_live_tup::bigint AS est_rows
   FROM pg_stat_user_tables
   WHERE schemaname = 'public'
     AND relname IN ('modulos_estudo','historico_questoes', ...);
4. Opcional: supabase migration list  (CLI, local vs linked)
```

Substituir a seção **Baseline** abaixo e a data em `INVENTARIO_PUBLIC.md`.

---

## Baseline — snapshot (2026-06-04)

### Contagem de linhas (estimativa `pg_stat_user_tables`)

| Tabela | Linhas ~ |
|--------|----------|
| `modulos_estudo` | 5.179 |
| `historico_questoes` | 405 |
| `concurso_modulos` | 5.521 |
| `concurso_matriculas` | 13 |
| `concursos` | 3 |
| `concurso_purchases` | 4 |
| `simulado_sessions` | 47 |
| `simulado_respostas` | 580 |
| `simulado_analytics_daily` | 152 |
| `study_notebooks` | 3 |
| `study_notebook_items` | 287 |
| `error_reports` | 1 |
| `invite_links` | 2 |
| `invite_redemptions` | 1 |
| `email_templates` | 2 |
| `lp_pages` | 3 |
| `acessos` | 0 |

Catálogo (~5,2k módulos) abaixo do teto de vitrine (10k). **PostgREST Max Rows:** 15.000 (confirmado 2026-06-04). Ver alertas com `npm run scale:health`.

### Migrations aplicadas no remoto (38 registros — alinhado ao repo)

**Status (2026-06-04):** `npm run migration:list` — Local e Remote idênticos. `npm run db:push` → `Remote database is up to date`.

Últimas entradas: `20260604191239_rls_performance`, `20260604191246_rls_performance_initplan_policies`.

**Drift histórico (resolvido):** timestamps divergentes entre repo e remoto (ex. `vitrine_page_includes_facets`, `create_error_reports`) foram reconciliados renomeando arquivos locais para as versões registradas no remoto — ver [Reconciliar drift](#reconciliar-drift-migrations).

### Advisors — security (resumo)

| Nível | Qtd | Destaques |
|-------|-----|-----------|
| WARN | 2–3 | Extensões `pg_net`/`pg_trgm` em `public`; leaked password protection (até ativar no Dashboard — [Auth](#auth-leaked-password-protection)) |
| INFO | 0–1 | RLS service-only: `email_templates`, `invite_links`, `invite_redemptions` com policies `*_service_all` (`20260604150000`) |

### Advisors — performance (resumo)

| Nível | Tema | Destaques |
|-------|------|-----------|
| WARN | RLS initplan | Corrigido em `20260604191239` + `20260604191246` |
| WARN | Policies duplicadas | Corrigido: `historico_questoes`, `concursos`, `concurso_modulos`, `modulos_estudo` (`20260604191239`) |
| WARN | Índice duplicado | constraint `unique_question_content` removida; mantido `uniq_modulos_estudo_content_hash` (`20260604191239`) |
| INFO | FK sem índice | Índices FK criados em `20260604191239`; INFO “unused” é esperado até carga real |
| INFO | Índices unused | Vários (não remover sem janela de observação) |

### Cache webhook (remoto)

Migrations `20260604130000` + `20260604140000` aplicadas no projeto. Config em **`private.cache_webhook_config`** (Cloud) ou GUCs `app.webhook_*` (self-hosted).

Template SQL: [`supabase/scripts/set_cache_webhook_gucs.sql`](../supabase/scripts/set_cache_webhook_gucs.sql).

**Smoke:** `SELECT invalidate_cache_via_webhook('modulos_estudo', 'INSERT');` — em `net._http_response` esperar `status_code = 200`. **401** = `secret` na tabela ≠ `SUPABASE_WEBHOOK_SECRET` na Vercel (alinhar os dois).

---

## Checklist trimestral (Definition of Done parcial)

- [x] `on_simulado_session_finalize_refresh_analytics`: EXECUTE revogado (`20260604150000`)
- [x] RLS service-only: policies `email_templates_service_all`, `invite_links_service_all`, `invite_redemptions_service_all`
- [ ] Advisors: sem RPC `SECURITY DEFINER` exposta a `anon` (exceto funções públicas intencionais)
- [ ] Auth: leaked password protection ativo no Dashboard
- [x] `simulado_run_retention` existe (migration `20260604120000`) e cron em `vercel.json`; smoke pós-deploy: `GET /api/admin/manutencao/simulado-retention` com `Authorization: Bearer ${CRON_SECRET}`
- [ ] Cache: GUCs webhook + invalidação em produção (migration `20260604130000` + `ALTER DATABASE` acima)
- [x] Max rows ≥ 10.000 confirmado (**15.000** em 2026-06-04 — ver [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md#valor-confirmado-produção))
- [x] RLS performance (`20260604191239` + `20260604191246`): `npm run smoke:rls` + `rls_performance_smoke.sql` (2026-06-04 remoto OK)
- [x] `migration list` alinhado repo/remoto (2026-06-04)
- [ ] Inventário RPC atualizado em [`INVENTARIO_PUBLIC.md`](../supabase/INVENTARIO_PUBLIC.md)

---

## Comandos rápidos

```bash
npm run validate:env
npm run db:push
npm run migration:list
npm run check:architecture
npm run check:db-types
npm run supabase:max-rows -- --dry-run
npm run scale:health
npm run scale:health -- --json
npm run smoke:rls
```
