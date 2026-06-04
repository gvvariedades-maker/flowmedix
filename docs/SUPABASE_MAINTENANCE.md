# Supabase — manutenção preventiva (AVANT)

Runbook repetível para deploy, smoke e revisão mensal. Baseline de produção abaixo serve como evidência **antes/depois** das fases do plano de manutenção.

**Projeto:** `ozgouenqrofnvgrlgfwd` (ref da URL `https://ozgouenqrofnvgrlgfwd.supabase.co`)

**Docs relacionados:** [`supabase/INVENTARIO_PUBLIC.md`](../supabase/INVENTARIO_PUBLIC.md), [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md), [`SCALE_HEALTH.md`](./SCALE_HEALTH.md), [`WEBHOOK_SETUP.md`](./WEBHOOK_SETUP.md), [`SISTEMA_CACHE.md`](./SISTEMA_CACHE.md)

---

## Pré-deploy

1. **Migrations:** `npm run db:push` (ou `supabase db push` com projeto linkado). Conferir drift local ↔ remoto (seção [Baseline — migrations](#baseline--migrations)).
2. **Env:** `npm run validate:env` (roda também no `npm run build`).
3. **PostgREST Max Rows:** `npm run supabase:max-rows -- --dry-run` e, se necessário, aplicar sem `--dry-run` (teto ≥ 10.000 — ver [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md)).
4. **Tipos (opcional):** após DDL, diff `types/database.ts` com `generate_typescript_types` (MCP Supabase).

---

## Pós-deploy (smoke)

| Passo | Comando / ação | Critério |
|-------|----------------|----------|
| Health | `GET /api/health` | `status: ok`, `database: ok` |
| Escala | `npm run scale:health` | exit `0` ou `1` sem crítico de catálogo |
| Vitrine | Abrir `/estudar` ou `GET /api/vitrine?page=1` autenticado | JSON com grupos; sem erro 500 |
| Questão | Abrir `/estudar/[slug]` de um slug conhecido | Player carrega enunciado |
| Advisors | Supabase Dashboard → Database → Advisors (ou MCP `get_advisors`) | Sem WARN novo crítico de RPC pública |
| Cache webhook | Após configurar GUCs (Fase 1.2): `INSERT` teste em `modulos_estudo` | Log Vercel 200 em `/api/cache/revalidate` |

Admin (sessão): `GET /api/admin/scale-health` — mesmo payload que `npm run scale:health -- --json`.

---

## Mensal (ou trimestral)

1. **Advisors** security + performance (Dashboard ou MCP).
2. **Max rows:** confirmar valor ≥ 10.000; registrar data em [`SUPABASE_MAX_ROWS.md`](./SUPABASE_MAX_ROWS.md) se alterado.
3. **Escala:** `npm run scale:health` + `avant_scale_health_metrics` (via script ou admin).
4. **Cache:** teste manual — alterar um módulo no Laboratório e ver vitrine atualizar (webhook) ou em até ~5–15 min (TTL cache).
5. **Crons Vercel** (`vercel.json`): matrículas `0 3 * * *` → `/api/admin/manutencao/expirar-matriculas`; retenção simulado `0 4 1 * *` → `/api/admin/manutencao/simulado-retention` com `Authorization: Bearer ${CRON_SECRET}`.
6. **Auth Dashboard:** [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) ativo.
7. **Índices “unused” (INFO):** não remover antes de ~30 dias de carga real em produção.

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

Catálogo (~5,2k módulos) abaixo do teto de vitrine (10k). Ver alertas com `npm run scale:health`.

### Migrations aplicadas no remoto (32 registros)

Últimas entradas: `20260603020858_create_error_reports_table`, duplicata `20260603011249_performance_nav_indexes` + `20260603004659_performance_nav_indexes`.

**Drift repo ↔ remoto (mesmo nome, versão diferente):**

| Nome lógico | Repo (`supabase/migrations/`) | Remoto |
|-------------|-------------------------------|--------|
| `vitrine_page_includes_facets` | `20260531120000` | `20260531215933` |
| `simulado_prova_meta_titulo` | `20260601120000` | `20260601043501` |
| `simulado_templates` | `20260601140000` | `20260601045209` |
| `performance_nav_indexes` | `20260602120000` (1 arquivo) | `20260603004659` + `20260603011249` (2×) |
| `create_error_reports` | `20260602231000` | `20260603020858` |

Reconciliar com `supabase migration list` / repair **sem** reaplicar DDL destrutivo (Fase 4 do plano).

### Advisors — security (resumo)

| Nível | Qtd | Destaques |
|-------|-----|-----------|
| WARN | 5 | `on_simulado_session_finalize_refresh_analytics` executável por anon/authenticated; extensões `pg_net`/`pg_trgm` em `public`; leaked password protection desligado |
| INFO | 3 | RLS sem policy: `email_templates`, `invite_links`, `invite_redemptions` (modelo service-only intencional) |

### Advisors — performance (resumo)

| Nível | Tema | Destaques |
|-------|------|-----------|
| WARN | RLS initplan | Várias tabelas com `auth.uid()` sem `(select auth.uid())` |
| WARN | Policies duplicadas | `historico_questoes` (PT+EN), `concursos` / `concurso_modulos` / `modulos_estudo` (SELECT duplo) |
| WARN | Índice duplicado | `modulos_estudo`: `uniq_modulos_estudo_content_hash` + `unique_question_content` |
| INFO | FK sem índice | `error_reports`, `lp_pages`, `simulado_respostas`, `simulado_sessions` |
| INFO | Índices unused | Vários (não remover sem janela de observação) |

### Lacunas conhecidas (plano em andamento)

| Item | Estado no remoto |
|------|------------------|
| GUCs `app.webhook_url` / `app.webhook_secret` | Provável vazio → fallback localhost no trigger de cache |

---

## Checklist trimestral (Definition of Done parcial)

- [ ] Advisors: sem RPC `SECURITY DEFINER` exposta a `anon` (exceto funções públicas intencionais)
- [x] `simulado_run_retention` existe (migration `20260604120000`) e cron em `vercel.json`; smoke pós-deploy: `GET /api/admin/manutencao/simulado-retention` com `Authorization: Bearer ${CRON_SECRET}`
- [ ] Cache: GUCs webhook + invalidação em produção
- [ ] Max rows ≥ 10.000 confirmado
- [ ] `migration list` alinhado repo/remoto
- [ ] Inventário RPC atualizado em [`INVENTARIO_PUBLIC.md`](../supabase/INVENTARIO_PUBLIC.md)

---

## Comandos rápidos

```bash
npm run validate:env
npm run db:push
npm run supabase:max-rows -- --dry-run
npm run scale:health
npm run scale:health -- --json
```
