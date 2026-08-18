-- Pós-apply: 20260814120000_historico_cache_trigger_definer
-- SQL Editor (service role). Cada predicado deve ser true.

SELECT
  (SELECT p.prosecdef
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'trigger_invalidate_cache_historico_insert') AS insert_definer,
  (SELECT p.prosecdef
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'trigger_invalidate_cache_historico_update') AS update_definer,
  (SELECT p.prosecdef
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'trigger_invalidate_cache_historico_delete') AS delete_definer,
  (SELECT t.tgtype = 8
     FROM pg_trigger t
     JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal
      AND c.relname = 'historico_questoes'
      AND t.tgname = 'cache_invalidate_historico_delete') AS delete_is_statement,
  (SELECT pg_get_triggerdef(t.oid) LIKE '%FOR EACH STATEMENT%'
     FROM pg_trigger t
     JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal
      AND c.relname = 'historico_questoes'
      AND t.tgname = 'cache_invalidate_historico_delete') AS delete_trigger_sql_statement,
  NOT has_function_privilege(
    'anon',
    'public.invalidate_cache_via_webhook(text, text)',
    'EXECUTE'
  ) AS anon_cannot_execute_webhook,
  NOT has_function_privilege(
    'authenticated',
    'public.invalidate_cache_via_webhook(text, text)',
    'EXECUTE'
  ) AS authenticated_cannot_execute_webhook,
  has_function_privilege(
    'service_role',
    'public.invalidate_cache_via_webhook(text, text)',
    'EXECUTE'
  ) AS service_role_can_execute_webhook,
  NOT has_function_privilege(
    'authenticated',
    'public.trigger_invalidate_cache_historico_delete()',
    'EXECUTE'
  ) AS authenticated_cannot_execute_delete_wrapper;
