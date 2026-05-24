-- RPC: facets da vitrine (bancas e assuntos) com mesma CTE de entitlements de get_vitrine_page.
-- Invocação via service_role (Node); EXECUTE revogado de anon/authenticated.

CREATE OR REPLACE FUNCTION public.get_vitrine_facets(
  p_user_id uuid,
  p_banca text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_accessible_limit constant int := 10000;
  v_bancas jsonb;
  v_assuntos jsonb;
BEGIN
  WITH active_matriculas AS (
    SELECT cm.concurso_id
    FROM public.concurso_matriculas cm
    WHERE cm.user_id = p_user_id
      AND (cm.status IS NULL OR cm.status = 'ativo')
      AND (cm.expires_at IS NULL OR cm.expires_at > now())
  ),
  edital_concurso AS (
    SELECT c.id
    FROM active_matriculas am
    INNER JOIN public.concursos c ON c.id = am.concurso_id
    WHERE c.tipo = 'edital'
    LIMIT 1
  ),
  nav_concurso_ids AS (
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE EXISTS (SELECT 1 FROM edital_concurso)
      AND am.concurso_id = (SELECT id FROM edital_concurso)
    UNION ALL
    SELECT am.concurso_id
    FROM active_matriculas am
    WHERE NOT EXISTS (SELECT 1 FROM edital_concurso)
  ),
  linked_modulos AS (
    SELECT
      m.id,
      m.modulo_slug,
      m.titulo_aula,
      m.banca,
      m.created_at,
      c.slug AS concurso_slug
    FROM nav_concurso_ids nci
    INNER JOIN public.concurso_modulos cm ON cm.concurso_id = nci.concurso_id
    INNER JOIN public.modulos_estudo m ON m.id = cm.modulo_id
    INNER JOIN public.concursos c ON c.id = nci.concurso_id
    WHERE c.slug <> 'campina-grande-2026'
       OR lower(coalesce(m.banca, '')) LIKE '%idecan%'
  ),
  deduped_by_id AS (
    SELECT DISTINCT ON (lm.id)
      lm.id,
      lm.modulo_slug,
      lm.titulo_aula,
      lm.banca,
      lm.created_at
    FROM linked_modulos lm
    ORDER BY lm.id, lm.created_at DESC NULLS LAST
  ),
  deduped_by_slug AS (
    SELECT DISTINCT ON (dbi.modulo_slug)
      dbi.id,
      dbi.modulo_slug,
      dbi.titulo_aula,
      dbi.banca,
      dbi.created_at
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT
      dbs.banca,
      dbs.titulo_aula
    FROM deduped_by_slug dbs
    ORDER BY dbs.created_at DESC NULLS LAST
    LIMIT v_accessible_limit
  )
  SELECT
    coalesce(
      (
        SELECT jsonb_agg(sub.banca ORDER BY sub.banca)
        FROM (
          SELECT DISTINCT am.banca
          FROM accessible_modulos am
          WHERE am.banca IS NOT NULL
            AND btrim(am.banca) <> ''
        ) sub
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        SELECT jsonb_agg(sub.titulo_aula ORDER BY sub.titulo_aula)
        FROM (
          SELECT DISTINCT am.titulo_aula
          FROM accessible_modulos am
          WHERE am.titulo_aula IS NOT NULL
            AND btrim(am.titulo_aula) <> ''
            AND (
              p_banca IS NULL
              OR btrim(p_banca) = ''
              OR am.banca = btrim(p_banca)
            )
        ) sub
      ),
      '[]'::jsonb
    )
  INTO v_bancas, v_assuntos;

  RETURN jsonb_build_object(
    'bancas', v_bancas,
    'assuntos', v_assuntos
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_vitrine_facets(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vitrine_facets(uuid, text) TO service_role;

COMMENT ON FUNCTION public.get_vitrine_facets(uuid, text) IS
  'Facets da vitrine (bancas e assuntos) com entitlements do aluno. assuntos respeitam p_banca. Uso: service_role.';
