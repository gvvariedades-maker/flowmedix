-- Cache webhook config (Supabase Cloud: use INSERT; self-hosted: GUCs)
-- Migrations: 20260604130000 + 20260604140000
--
-- base_url = NEXT_PUBLIC_APP_URL sem barra final
-- secret   = mesmo valor que SUPABASE_WEBHOOK_SECRET na Vercel

-- === Supabase Cloud (recomendado; GUC app.* costuma dar permission denied) ===
INSERT INTO private.cache_webhook_config (id, base_url, secret)
VALUES (1, 'https://www.avant.enf.br', 'cole_SUPABASE_WEBHOOK_SECRET_da_Vercel')
ON CONFLICT (id) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  secret = EXCLUDED.secret,
  updated_at = now();

-- === Self-hosted / quando ALTER DATABASE for permitido ===
-- ALTER DATABASE postgres SET app.webhook_url = 'https://www.avant.enf.br';
-- ALTER DATABASE postgres SET app.webhook_secret = 'mesmo_secret';

-- Verificar:
-- SELECT base_url, length(secret) AS secret_len FROM private.cache_webhook_config WHERE id = 1;

-- Smoke (esperado 200 nos logs Vercel; 401 = secret diferente da Vercel):
-- SELECT public.invalidate_cache_via_webhook('modulos_estudo', 'INSERT');
