-- Reset 1A (historico_questoes): wrappers de cache INVOKER quebram DELETE autenticado.
-- Live (2026-08-14): invalidate_cache_via_webhook é SECURITY DEFINER, EXECUTE só
-- postgres + service_role. Wrappers trigger_invalidate_cache_historico_* são INVOKER;
-- o aluno dispara o trigger no POST /api/zerar-desempenho (JWT + RLS) e recebe
-- permission denied for function invalidate_cache_via_webhook — a transação desfaz.
--
-- Forward-only a partir da definição live. Não edita 20260604185803 / 20260604185921.
-- Não concede EXECUTE da webhook a authenticated (não vira RPC).
-- Rota app permanece JWT + RLS (não service role).

CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_historico_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $$
BEGIN
  PERFORM public.invalidate_cache_via_webhook('historico_questoes', 'INSERT');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_historico_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $$
BEGIN
  PERFORM public.invalidate_cache_via_webhook('historico_questoes', 'UPDATE');
  RETURN NEW;
END;
$$;

-- Statement-level: um webhook por DELETE em lote (reset), não um por linha.
-- RETURN NULL — FOR EACH STATEMENT não tem NEW/OLD.
CREATE OR REPLACE FUNCTION public.trigger_invalidate_cache_historico_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $$
BEGIN
  PERFORM public.invalidate_cache_via_webhook('historico_questoes', 'DELETE');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS cache_invalidate_historico_delete ON public.historico_questoes;
CREATE TRIGGER cache_invalidate_historico_delete
  AFTER DELETE ON public.historico_questoes
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_invalidate_cache_historico_delete();

COMMENT ON FUNCTION public.trigger_invalidate_cache_historico_insert() IS
  'AFTER INSERT ROW em historico_questoes → invalidate_cache_via_webhook. SECURITY DEFINER (owner postgres); EXECUTE revogado de anon/authenticated.';
COMMENT ON FUNCTION public.trigger_invalidate_cache_historico_update() IS
  'AFTER UPDATE ROW em historico_questoes → invalidate_cache_via_webhook. SECURITY DEFINER (owner postgres); EXECUTE revogado de anon/authenticated.';
COMMENT ON FUNCTION public.trigger_invalidate_cache_historico_delete() IS
  'AFTER DELETE STATEMENT em historico_questoes → um webhook por comando (reset 1A). SECURITY DEFINER; EXECUTE revogado de anon/authenticated.';

REVOKE EXECUTE ON FUNCTION public.trigger_invalidate_cache_historico_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_invalidate_cache_historico_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_invalidate_cache_historico_delete() FROM PUBLIC, anon, authenticated;

-- Idempotente: webhook continua interna (já endurecida em 20260604185921).
REVOKE EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invalidate_cache_via_webhook(text, text) TO service_role;
