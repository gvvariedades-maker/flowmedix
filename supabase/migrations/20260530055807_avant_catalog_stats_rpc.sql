-- Totais globais do catálogo (vitrine): questões com estudo reverso e NeuroSlides.
-- SECURITY DEFINER + EXECUTE só para service_role.

CREATE OR REPLACE FUNCTION public.avant_catalog_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH slides_per_modulo AS (
    SELECT
      CASE
        WHEN jsonb_array_length(COALESCE(conteudo_json->'reverse_study_slides', '[]'::jsonb)) > 0
          THEN jsonb_array_length(conteudo_json->'reverse_study_slides')
        ELSE jsonb_array_length(COALESCE(conteudo_json->'study_slides', '[]'::jsonb))
      END AS slide_count
    FROM modulos_estudo
    WHERE conteudo_json IS NOT NULL
  )
  SELECT jsonb_build_object(
    'total_questions', (SELECT count(*)::int FROM slides_per_modulo WHERE slide_count > 0),
    'total_slides', (SELECT coalesce(sum(slide_count), 0)::int FROM slides_per_modulo WHERE slide_count > 0)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.avant_catalog_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avant_catalog_stats() TO service_role;

COMMENT ON FUNCTION public.avant_catalog_stats() IS
  'Totais globais: questões com reverse/study slides e soma de NeuroSlides. Uso: service_role / vitrine.';
