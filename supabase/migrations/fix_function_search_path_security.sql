-- Corrige aviso function_search_path_mutable (linter Supabase 0011).
-- search_path fixo evita hijacking de objetos homônimos em schemas maliciosos.
-- net.http_post permanece qualificado; public contém tabelas e invalidate_cache_via_webhook.

ALTER FUNCTION public.update_notebook_updated_at() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.invalidate_cache_via_webhook(text, text) SET search_path TO pg_catalog, public;
ALTER FUNCTION public.modules_search_trigger() SET search_path TO pg_catalog, public;

ALTER FUNCTION public.trigger_invalidate_cache_modulos_insert() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_modulos_update() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_modulos_delete() SET search_path TO pg_catalog, public;

ALTER FUNCTION public.trigger_invalidate_cache_historico_insert() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_historico_update() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_historico_delete() SET search_path TO pg_catalog, public;

ALTER FUNCTION public.trigger_invalidate_cache_flowcharts_insert() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_flowcharts_update() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_flowcharts_delete() SET search_path TO pg_catalog, public;

ALTER FUNCTION public.trigger_invalidate_cache_exam_contents_insert() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_exam_contents_update() SET search_path TO pg_catalog, public;
ALTER FUNCTION public.trigger_invalidate_cache_exam_contents_delete() SET search_path TO pg_catalog, public;

-- Nota: pg_net em public — extensão não é relocatable (ALTER EXTENSION … SET SCHEMA falha).
-- O aviso extension_in_public pode permanecer até o Supabase/pg_net suportar outro schema.
