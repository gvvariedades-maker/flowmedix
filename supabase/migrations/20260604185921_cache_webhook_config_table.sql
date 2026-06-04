-- Supabase Cloud não permite ALTER DATABASE em parâmetros app.* via roles da API.
-- Configuração canônica em private.cache_webhook_config (singleton); GUCs permanecem fallback (self-hosted).

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.cache_webhook_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  base_url text NOT NULL,
  secret text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE private.cache_webhook_config ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.cache_webhook_config FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.invalidate_cache_via_webhook(
  table_name text,
  event_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public, private
AS $$
DECLARE
  base_url text;
  webhook_secret text;
  webhook_url text;
BEGIN
  SELECT c.base_url, c.secret
  INTO base_url, webhook_secret
  FROM private.cache_webhook_config c
  WHERE c.id = 1;

  IF base_url IS NULL OR webhook_secret IS NULL THEN
    base_url := nullif(btrim(current_setting('app.webhook_url', true)), '');
    webhook_secret := nullif(btrim(current_setting('app.webhook_secret', true)), '');
  END IF;

  IF base_url IS NULL OR webhook_secret IS NULL THEN
    RAISE WARNING
      'invalidate_cache_via_webhook skipped: configure private.cache_webhook_config or GUCs app.webhook_url / app.webhook_secret. table=%, event=%',
      table_name,
      event_type;
    RETURN;
  END IF;

  webhook_url := regexp_replace(base_url, '/+$', '') || '/api/cache/revalidate';

  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || webhook_secret,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'table', table_name,
      'event', event_type
    )
  );

  RAISE LOG 'Cache invalidation triggered: url=%, table=%, event=%', webhook_url, table_name, event_type;
END;
$$;

COMMENT ON FUNCTION public.invalidate_cache_via_webhook(text, text) IS
  'POST /api/cache/revalidate via pg_net. Config: private.cache_webhook_config (Supabase Cloud) or GUCs app.webhook_url + app.webhook_secret.';

COMMENT ON TABLE private.cache_webhook_config IS
  'Singleton: base_url = NEXT_PUBLIC_APP_URL (sem path); secret = SUPABASE_WEBHOOK_SECRET. INSERT/UPDATE só service_role ou SQL Editor.';

REVOKE EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) TO service_role;
