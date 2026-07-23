# Configuração de Webhook do Supabase (cache + Auth)

**Hub segurança eng:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) (Trilho B — ops).

## Visão geral

O AVANT invalida cache de duas formas:

1. **Triggers Postgres (`pg_net`)** em `modulos_estudo` e `historico_questoes` → `POST /api/cache/revalidate` (recomendado em produção).
2. **Webhooks do Dashboard** (HTTP Request) — alternativa manual; mesma URL e secret.

O secret canônico é **`SUPABASE_WEBHOOK_SECRET`** (Vercel / `.env`). O endpoint de cache aceita `Authorization: Bearer <secret>`. A variável legada `WEBHOOK_SECRET` ainda funciona como fallback durante a transição.

## Secret único

```bash
openssl rand -hex 32
```

Configure **o mesmo valor** em:

| Onde | Variável / GUC |
|------|----------------|
| Vercel / `.env` | `SUPABASE_WEBHOOK_SECRET` |
| Postgres (SQL Editor) | `app.webhook_secret` |
| URL base do app | `NEXT_PUBLIC_APP_URL` → GUC `app.webhook_url` (sem barra final, sem `/api/...`) |

Script de referência: [`supabase/scripts/set_cache_webhook_gucs.sql`](../supabase/scripts/set_cache_webhook_gucs.sql)

### Config no Supabase Cloud (recomendado — migration `20260604140000`)

Em projetos hospedados, `ALTER DATABASE … app.webhook_*` costuma retornar **permission denied**. Use a tabela singleton:

```sql
INSERT INTO private.cache_webhook_config (id, base_url, secret)
VALUES (1, 'https://www.avant.enf.br', 'mesmo_valor_de_SUPABASE_WEBHOOK_SECRET_na_Vercel')
ON CONFLICT (id) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  secret = EXCLUDED.secret,
  updated_at = now();
```

### GUCs (self-hosted ou quando o painel permitir)

```sql
ALTER DATABASE postgres SET app.webhook_url = 'https://seu-dominio.com';
ALTER DATABASE postgres SET app.webhook_secret = 'mesmo_valor_de_SUPABASE_WEBHOOK_SECRET';
```

Desenvolvimento local:

```sql
ALTER DATABASE postgres SET app.webhook_url = 'http://localhost:3000';
ALTER DATABASE postgres SET app.webhook_secret = 'dev-secret';
```

A função `invalidate_cache_via_webhook` **não** envia mais POST para `localhost` se os GUCs estiverem vazios (evita cache stale silencioso em produção).

Guia SQL completo (triggers): [WEBHOOK_SETUP_SQL.md](./WEBHOOK_SETUP_SQL.md)

## Pré-requisitos

1. Migration `20260604130000_cache_webhook_hardening.sql` aplicada (`npm run db:push`).
2. `NEXT_PUBLIC_APP_URL` e `SUPABASE_WEBHOOK_SECRET` na Vercel (`npm run validate:env`).
3. GUCs `app.webhook_url` / `app.webhook_secret` configurados no projeto Supabase.

## Verificação pós-deploy

1. `INSERT` ou `UPDATE` em `modulos_estudo` no SQL Editor.
2. Logs Postgres: sem `WARNING` de GUC ausente; opcional `Cache invalidation triggered`.
3. Logs Vercel: `Cache invalidation request` com status **200** em `/api/cache/revalidate`.

Teste manual:

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/cache/revalidate" \
  -H "Authorization: Bearer $SUPABASE_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"table": "modulos_estudo", "event": "INSERT"}'
```

## Webhooks via Dashboard (opcional)

Se não usar triggers SQL, crie webhooks em **Database → Webhooks**:

| Campo | Valor |
|-------|--------|
| URL | `{NEXT_PUBLIC_APP_URL}/api/cache/revalidate` |
| Headers | `Authorization: Bearer <SUPABASE_WEBHOOK_SECRET>` |
| Body | `{"table": "modulos_estudo", "event": "{{event}}"}` |

Tabelas críticas: `modulos_estudo`, `historico_questoes`.

## Auth (e-mail de boas-vindas)

Migration `20260607140000_auth_users_welcome_webhook.sql`: trigger `auth_users_welcome_webhook` em `auth.users` (INSERT) → `POST /api/webhooks/auth` via `pg_net`, header **`x-webhook-secret`** (mesmo secret de `private.cache_webhook_config` / `SUPABASE_WEBHOOK_SECRET`).

Implementação Next.js: [`app/api/webhooks/auth/route.ts`](../app/api/webhooks/auth/route.ts).

**Alternativa manual:** Database Webhook no Dashboard (schema `auth`, tabela `users`, evento INSERT) com a mesma URL e header — só necessária se o trigger SQL não estiver aplicado.

## Troubleshooting

### WARNING: `invalidate_cache_via_webhook skipped`

GUCs não configurados. Rode o SQL da seção [GUCs no Supabase](#gucs-no-supabase-obrigatório-após-migration-20260604130000).

### Erro 401 no `/api/cache/revalidate`

1. `SUPABASE_WEBHOOK_SECRET` na Vercel igual ao `app.webhook_secret`.
2. Header `Authorization: Bearer ...` (não `x-webhook-secret`).
3. Em produção, pelo menos um dos dois envs deve existir (`SUPABASE_WEBHOOK_SECRET` preferido).

### Cache não atualiza

1. Smoke acima (curl).
2. [`SISTEMA_CACHE.md`](./SISTEMA_CACHE.md) — TTL de fallback (5–15 min) se webhook falhar.
3. `npm run scale:health` — catálogo dentro do teto.

## Referências

- [SUPABASE_MAINTENANCE.md](./SUPABASE_MAINTENANCE.md) — checklist deploy
- [SISTEMA_CACHE.md](./SISTEMA_CACHE.md)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)
