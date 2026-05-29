-- GoTrue admin listUsers falha com "Database error finding users" quando
-- email_change (ou tokens) são NULL: Scan error converting NULL to string.
UPDATE auth.users
SET
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, '')
WHERE email_change IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL;

CREATE OR REPLACE FUNCTION public.admin_get_auth_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
STABLE
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(user_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.admin_get_auth_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_auth_user_id_by_email(text) TO service_role;;
