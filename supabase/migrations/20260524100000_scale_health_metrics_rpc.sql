-- Métricas de escala para health check (script CLI + API admin).
-- SECURITY DEFINER + EXECUTE só para service_role.

CREATE OR REPLACE FUNCTION public.avant_scale_health_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'generated_at', to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'modulos_estudo_count', (SELECT count(*)::int FROM modulos_estudo),
    'historico_questoes_count', (SELECT count(*)::int FROM historico_questoes),
    'json_bytes', (
      SELECT jsonb_build_object(
        'avg', coalesce(round(avg(pg_column_size(conteudo_json)))::int, 0),
        'max', coalesce(max(pg_column_size(conteudo_json))::int, 0),
        'p95', coalesce(
          (percentile_cont(0.95) WITHIN GROUP (ORDER BY pg_column_size(conteudo_json)))::int,
          0
        ),
        'total', coalesce(sum(pg_column_size(conteudo_json))::bigint, 0)
      )
      FROM modulos_estudo
      WHERE conteudo_json IS NOT NULL
    ),
    'questions_over_100kb', (
      SELECT count(*)::int
      FROM modulos_estudo
      WHERE conteudo_json IS NOT NULL
        AND pg_column_size(conteudo_json) > 102400
    ),
    'assuntos_over_200_count', (
      SELECT count(*)::int
      FROM (
        SELECT titulo_aula
        FROM modulos_estudo
        WHERE titulo_aula IS NOT NULL AND btrim(titulo_aula) <> ''
        GROUP BY titulo_aula
        HAVING count(*) > 200
      ) AS heavy_assuntos
    ),
    'users_historico_over_5000', (
      SELECT count(*)::int
      FROM (
        SELECT user_id
        FROM historico_questoes
        GROUP BY user_id
        HAVING count(*) > 5000
      ) AS heavy_users
    ),
    'reverse_slides', (
      SELECT jsonb_build_object(
        'avg', coalesce(
          round(avg(
            jsonb_array_length(COALESCE(conteudo_json->'reverse_study_slides', '[]'::jsonb))
          ))::numeric,
          0
        ),
        'not_four_slides', (
          SELECT count(*)::int
          FROM modulos_estudo
          WHERE conteudo_json IS NOT NULL
            AND jsonb_array_length(COALESCE(conteudo_json->'reverse_study_slides', '[]'::jsonb)) <> 4
        )
      )
      FROM modulos_estudo
      WHERE conteudo_json IS NOT NULL
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.avant_scale_health_metrics() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avant_scale_health_metrics() TO service_role;

COMMENT ON FUNCTION public.avant_scale_health_metrics() IS
  'Agregados de escala (catálogo, JSON, histórico). Uso: service_role / scale-health-check.';
