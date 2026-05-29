-- Endurece RPCs sensíveis: apenas service_role (APIs server-side / cron).

REVOKE EXECUTE ON FUNCTION public.admin_get_auth_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_concurso_matriculas() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fulfill_concurso_purchase(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_auth_user_id_by_email(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_concurso_matriculas() TO service_role;
GRANT EXECUTE ON FUNCTION public.fulfill_concurso_purchase(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) TO service_role;
