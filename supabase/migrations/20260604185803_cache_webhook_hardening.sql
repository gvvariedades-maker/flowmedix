-- Harden cache invalidation webhook: require GUCs (no silent localhost fallback).
-- Next.js validates Bearer with SUPABASE_WEBHOOK_SECRET (WEBHOOK_SECRET legacy fallback).
-- After deploy, set once in SQL Editor (values must match Vercel):
--   ALTER DATABASE postgres SET app.webhook_url = '<NEXT_PUBLIC_APP_URL without trailing slash>';
--   ALTER DATABASE postgres SET app.webhook_secret = '<SUPABASE_WEBHOOK_SECRET>';
-- See docs/WEBHOOK_SETUP.md and supabase/scripts/set_cache_webhook_gucs.sql

CREATE OR REPLACE FUNCTION public.invalidate_cache_via_webhook(
  table_name text,
  event_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $$
DECLARE
  base_url text;
  webhook_secret text;
  webhook_url text;
BEGIN
  base_url := nullif(btrim(current_setting('app.webhook_url', true)), '');
  webhook_secret := nullif(btrim(current_setting('app.webhook_secret', true)), '');

  IF base_url IS NULL OR webhook_secret IS NULL THEN
    RAISE WARNING
      'invalidate_cache_via_webhook skipped: set app.webhook_url (base URL, same host as NEXT_PUBLIC_APP_URL) and app.webhook_secret (same value as SUPABASE_WEBHOOK_SECRET). table=%, event=%',
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
  'POST /api/cache/revalidate via pg_net. Requires database GUCs app.webhook_url (base, no path) and app.webhook_secret (= SUPABASE_WEBHOOK_SECRET on Vercel). Skips with WARNING if unset.';

REVOKE EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) TO service_role;
