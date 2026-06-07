-- Boas-vindas: INSERT em auth.users → POST /api/webhooks/auth (pg_net).

-- Reutiliza private.cache_webhook_config (base_url + secret = SUPABASE_WEBHOOK_SECRET na Vercel).



CREATE OR REPLACE FUNCTION private.notify_auth_user_welcome_webhook()

RETURNS trigger

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path TO pg_catalog, public, private, auth

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

      'auth welcome webhook skipped: configure private.cache_webhook_config or GUCs app.webhook_url / app.webhook_secret. user_id=%',

      NEW.id;

    RETURN NEW;

  END IF;



  webhook_url := regexp_replace(base_url, '/+$', '') || '/api/webhooks/auth';



  PERFORM net.http_post(

    url := webhook_url,

    headers := jsonb_build_object(

      'x-webhook-secret', webhook_secret,

      'Content-Type', 'application/json'

    ),

    body := jsonb_build_object(

      'type', 'INSERT',

      'schema', 'auth',

      'table', 'users',

      'record', jsonb_build_object('id', NEW.id::text)

    )

  );



  RETURN NEW;

END;

$$;



COMMENT ON FUNCTION private.notify_auth_user_welcome_webhook() IS

  'Dispara e-mail de boas-vindas via POST /api/webhooks/auth após signup (header x-webhook-secret).';



DROP TRIGGER IF EXISTS auth_users_welcome_webhook ON auth.users;



CREATE TRIGGER auth_users_welcome_webhook

  AFTER INSERT ON auth.users

  FOR EACH ROW

  EXECUTE FUNCTION private.notify_auth_user_welcome_webhook();

