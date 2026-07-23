# Inventário — schema `public` (AVANT)

Última atualização: **2026-07-23** (ledger Stripe `stripe_webhook_events`; baseline em [`docs/SUPABASE_MAINTENANCE.md`](../docs/SUPABASE_MAINTENANCE.md)).

Projeto Supabase: **`ozgouenqrofnvgrlgfwd`**.

## Tabelas ativas (núcleo do produto)

| Tabela | Uso |
|--------|-----|
| `modulos_estudo` | Catálogo de questões, laboratório, cache, estudo |
| `historico_questoes` | Tentativas, desempenho, plano de revisão |
| `study_notebooks` / `study_notebook_items` | Cadernos do aluno |
| `concursos` / `concurso_modulos` / `concurso_matriculas` | Catálogo, vínculos, entitlements |
| `concurso_purchases` | Checkout Stripe + webhook |
| `stripe_webhook_events` | Idempotência webhook Stripe por `event.id` (service role) |
| `lp_templates` / `lp_pages` | Landings de concurso |
| `email_templates` | CMS de e-mails (admin, service role) |
| `invite_links` / `invite_redemptions` | Convites Pro temporário (service role) |
| `acessos` | Auditoria Campina Grande + migração legada para matrícula |
| `simulado_sessions` / `simulado_respostas` | Sessões e respostas do simulado |
| `simulado_analytics_daily` / `simulado_analytics_session_dims` | Agregados de desempenho |
| `simulado_templates` | Modelos de simulado por usuário |
| `error_reports` | Relatos de erro do player (RLS por `user_id`) |

Não remova estas tabelas sem migrar o app.

### Tabelas service-only (RLS + policy `service_role`)

Bloqueio para `anon`/`authenticated`; acesso via `createServerSupabase()` (service role). Policies explícitas (`20260604150000`):

| Tabela | Policy |
|--------|--------|
| `email_templates` | `email_templates_service_all` (FOR ALL TO service_role) |
| `invite_links` | `invite_links_service_all` |
| `invite_redemptions` | `invite_redemptions_service_all` |
| `stripe_webhook_events` | `stripe_webhook_events_service_all` (`20260723120000`) |

## Tabelas legadas (não existem no banco)

O código **não** referencia mais: `flowcharts`, `exam_contents`, `enrollments`, `exams`, `profiles`, `modules`.

Rotas removidas: `/api/fluxogramas`, `/api/admin/enrollments`.

## RPCs e funções sensíveis

Padrão: `SECURITY DEFINER`, `REVOKE` de `PUBLIC`/`anon`/`authenticated`, `GRANT` só `service_role` (ver `20260523180000_revoke_public_rpc_execute.sql` e migrations por função).

### Somente `service_role` (app server / cron)

| Função | Uso no app |
|--------|------------|
| `admin_get_auth_user_id_by_email(text)` | Admin: resolver usuário por e-mail |
| `expire_concurso_matriculas()` | Cron: expirar matrículas |
| `fulfill_concurso_purchase(uuid)` | Webhook Stripe: liberar concurso |
| `invalidate_cache_via_webhook(text, text)` | Trigger → `POST /api/cache/revalidate`; config `private.cache_webhook_config` ou GUCs `app.webhook_*` (`20260604130000`, `20260604140000`) |
| `get_vitrine_page(uuid, int, text, text, text, text[], text[])` | Vitrine paginada (`lib/vitrine/rpc.ts`) |
| `get_vitrine_facets(uuid, text, text[])` | Facets banca/assunto |
| `get_simulado_question_pool(uuid, integer, text, text, text, text[], text[])` | Pool do simulado |
| `get_simulado_question_pool_count(uuid, text, text, text, text[], text[])` | Contagem do pool |
| `refresh_simulado_session_analytics(uuid)` | Rollup analytics ao concluir sessão |
| `avant_scale_health_metrics()` | `npm run scale:health` |
| `avant_catalog_stats()` | Estatísticas de catálogo (admin/escala) |
| `simulado_run_retention(integer, timestamptz)` | Cron mensal + admin: retenção híbrida de `simulado_respostas` (`20260604120000`) |

Assinaturas com `p_bancas` / `p_assuntos` (`text[]`): migration `20260529143147_multi_banca_assunto_rpc.sql`.

### Trigger / interno (não chamar via PostgREST)

| Função | Notas |
|--------|--------|
| `on_simulado_session_finalize_refresh_analytics()` | Wrapper do trigger em `simulado_sessions`; EXECUTE revogado de `anon`/`authenticated` (`20260604150000`) — não invocar via PostgREST |

## O que não apagar

- Schema **`auth.*`**: Supabase Auth.
- **`storage.*`**, **`realtime.*`**, extensões do projeto (`pg_net`, `pg_trgm`): infraestrutura Supabase.
- Triggers de cache em `modulos_estudo` e `historico_questoes` → `invalidate_cache_via_webhook`.

## Referência rápida de migrations (RPCs)

| Migration | Conteúdo principal |
|-----------|---------------------|
| `20260523180000` | Revoke RPCs admin/cache/compras |
| `20260524100000` | `avant_scale_health_metrics` |
| `20260524120000` / `20260524130000` | `get_vitrine_page`, `get_vitrine_facets` |
| `20260527163000` / `20260528040027` | Simulado sessions + pool + count |
| `20260528175704` | `refresh_simulado_session_analytics` + trigger |
| `20260604130000` | Harden `invalidate_cache_via_webhook` (sem fallback localhost) |
| `20260604140000` | `private.cache_webhook_config` (Supabase Cloud) |
| `20260604120000` | `simulado_run_retention` (retenção híbrida) |
| `20260604150000` | Revoke trigger wrapper simulado + RLS service_role em `email_templates` / `invite_*` |
| `20260529143147` | Multi banca/assunto nas RPCs vitrine/simulado |
| `20260530055807` | `avant_catalog_stats` |
| `20260723120000` | `stripe_webhook_events` — ledger `event.id` (service_role only) |

Drift de versões local ↔ remoto: ver baseline em [`docs/SUPABASE_MAINTENANCE.md`](../docs/SUPABASE_MAINTENANCE.md).
