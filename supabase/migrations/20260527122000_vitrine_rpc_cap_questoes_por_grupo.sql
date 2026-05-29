-- Fase 1.2 (escala): limita o payload de questoes[] por grupo na RPC,
-- mantendo totais agregados completos para UI e analytics.

CREATE OR REPLACE FUNCTION public.get_vitrine_page(
  p_user_id uuid,
  p_page int DEFAULT 1,
  p_banca text DEFAULT NULL,
  p_assunto text DEFAULT NULL,
  p_q text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_per_page constant int := 12;
  v_accessible_limit constant int := 10000;
  v_group_questions_cap constant int := 200;
  v_page int := GREATEST(COALESCE(p_page, 1), 1);
  v_q text := NULLIF(lower(btrim(coalesce(p_q, ''))), '');
  v_q_num text := regexp_replace(lower(btrim(coalesce(p_q, ''))), '^q-?', '', 'i');
  v_total_groups int := 0;
  v_total_pages int := 1;
  v_page_clamped int;
  v_total_modulos int := 0;
  v_groups jsonb;
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
      m.modulo_nome,
      m.titulo_aula,
      m.banca,
      m.created_at,
      m.avant_codigo,
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
      lm.modulo_nome,
      lm.titulo_aula,
      lm.banca,
      lm.created_at,
      lm.avant_codigo
    FROM linked_modulos lm
    ORDER BY lm.id, lm.created_at DESC NULLS LAST
  ),
  deduped_by_slug AS (
    SELECT DISTINCT ON (dbi.modulo_slug)
      dbi.id,
      dbi.modulo_slug,
      dbi.modulo_nome,
      dbi.titulo_aula,
      dbi.banca,
      dbi.created_at,
      dbi.avant_codigo
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT
      dbs.id,
      dbs.modulo_slug,
      dbs.modulo_nome,
      dbs.titulo_aula,
      dbs.banca,
      dbs.created_at,
      dbs.avant_codigo
    FROM deduped_by_slug dbs
    ORDER BY dbs.created_at DESC NULLS LAST
    LIMIT v_accessible_limit
  ),
  filtered_modulos AS (
    SELECT am.*
    FROM accessible_modulos am
    WHERE (
        p_banca IS NULL
        OR btrim(p_banca) = ''
        OR am.banca = btrim(p_banca)
      )
      AND (
        p_assunto IS NULL
        OR btrim(p_assunto) = ''
        OR am.titulo_aula = btrim(p_assunto)
      )
      AND (
        v_q IS NULL
        OR lower(coalesce(am.titulo_aula, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_nome, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.banca, '')) LIKE '%' || v_q || '%'
        OR lower(coalesce(am.modulo_slug, '')) LIKE '%' || v_q || '%'
        OR (
          am.avant_codigo IS NOT NULL
          AND (
            am.avant_codigo::text = v_q_num
            OR ('q-' || am.avant_codigo::text) LIKE '%' || v_q || '%'
          )
        )
      )
  ),
  historico_agg AS (
    SELECT
      hq.modulo_slug,
      COUNT(*)::int AS total_tentativas,
      COUNT(*) FILTER (WHERE hq.acertou)::int AS acertos,
      BOOL_OR(hq.estudo_reverso_concluido) AS estudo_reverso_concluido
    FROM public.historico_questoes hq
    INNER JOIN filtered_modulos fm ON fm.modulo_slug = hq.modulo_slug
    WHERE hq.user_id = p_user_id
    GROUP BY hq.modulo_slug
  ),
  modulos_enriched AS (
    SELECT
      fm.id,
      fm.modulo_slug,
      fm.modulo_nome,
      coalesce(fm.titulo_aula, 'Sem subtópico') AS group_key,
      fm.titulo_aula,
      fm.banca,
      fm.created_at,
      fm.avant_codigo,
      coalesce(ha.acertos, 0) AS acertos,
      coalesce(ha.total_tentativas, 0) AS total_tentativas,
      coalesce(ha.estudo_reverso_concluido, false) AS estudo_reverso_concluido
    FROM filtered_modulos fm
    LEFT JOIN historico_agg ha ON ha.modulo_slug = fm.modulo_slug
  ),
  group_stats AS (
    SELECT
      me.group_key AS titulo_aula,
      coalesce(
        (array_agg(me.modulo_nome ORDER BY me.created_at DESC NULLS LAST, me.modulo_slug ASC)
          FILTER (WHERE me.modulo_nome IS NOT NULL))[1],
        'Geral'
      ) AS modulo_nome,
      coalesce(
        (array_agg(me.banca ORDER BY me.created_at DESC NULLS LAST, me.modulo_slug ASC)
          FILTER (WHERE me.banca IS NOT NULL))[1],
        ''
      ) AS banca,
      SUM(me.acertos)::int AS acertos,
      SUM(me.total_tentativas - me.acertos)::int AS erros,
      SUM(me.total_tentativas)::int AS total_resolvidas,
      COUNT(*)::int AS total_questoes,
      COUNT(*) FILTER (WHERE me.estudo_reverso_concluido)::int AS trabalhadas
    FROM modulos_enriched me
    GROUP BY me.group_key
  ),
  groups_ordered AS (
    SELECT
      gs.*,
      CASE
        WHEN gs.total_resolvidas > 0 THEN round((gs.acertos::numeric / gs.total_resolvidas::numeric) * 100)::int
        ELSE 0
      END AS percentual,
      ROW_NUMBER() OVER (
        ORDER BY (gs.total_questoes - gs.trabalhadas) DESC, gs.titulo_aula ASC
      ) AS rn,
      COUNT(*) OVER ()::int AS total_groups
    FROM group_stats gs
  ),
  groups_page AS (
    SELECT go.*
    FROM groups_ordered go
    WHERE go.rn > (v_page - 1) * v_per_page
      AND go.rn <= v_page * v_per_page
  ),
  questoes_ranked AS (
    SELECT
      me.group_key,
      me.modulo_slug,
      me.avant_codigo,
      me.created_at,
      me.estudo_reverso_concluido,
      ROW_NUMBER() OVER (
        PARTITION BY me.group_key
        ORDER BY me.created_at ASC NULLS LAST, me.avant_codigo ASC NULLS LAST, me.modulo_slug ASC
      )::int AS numero
    FROM modulos_enriched me
    WHERE me.group_key IN (SELECT gp.titulo_aula FROM groups_page gp)
  ),
  groups_json AS (
    SELECT
      gp.titulo_aula,
      gp.modulo_nome,
      gp.banca,
      gp.acertos,
      gp.erros,
      gp.total_resolvidas AS "totalResolvidas",
      gp.total_questoes AS "totalQuestoes",
      gp.trabalhadas,
      gp.percentual,
      coalesce(
        (
          SELECT qr_nao.modulo_slug
          FROM questoes_ranked qr_nao
          WHERE qr_nao.group_key = gp.titulo_aula
            AND NOT qr_nao.estudo_reverso_concluido
          ORDER BY qr_nao.numero
          LIMIT 1
        ),
        (
          SELECT qr_first.modulo_slug
          FROM questoes_ranked qr_first
          WHERE qr_first.group_key = gp.titulo_aula
          ORDER BY qr_first.numero
          LIMIT 1
        ),
        ''
      ) AS "firstSlug",
      (
        SELECT coalesce(
          jsonb_agg(
            jsonb_build_object(
              'slug', qr.modulo_slug,
              'numero', qr.numero,
              'status', CASE WHEN qr.estudo_reverso_concluido THEN 'estudada' ELSE 'nao_estudada' END,
              'avant_codigo', qr.avant_codigo,
              'created_at', qr.created_at
            )
            ORDER BY qr.numero
          ),
          '[]'::jsonb
        )
        FROM questoes_ranked qr
        WHERE qr.group_key = gp.titulo_aula
          AND qr.numero <= v_group_questions_cap
      ) AS questoes,
      gp.rn
    FROM groups_page gp
  )
  SELECT
    (SELECT COUNT(*)::int FROM filtered_modulos),
    coalesce((SELECT MAX(go.total_groups) FROM groups_ordered go), 0),
    coalesce(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'titulo_aula', gj.titulo_aula,
            'modulo_nome', gj.modulo_nome,
            'banca', gj.banca,
            'acertos', gj.acertos,
            'erros', gj.erros,
            'totalResolvidas', gj."totalResolvidas",
            'totalQuestoes', gj."totalQuestoes",
            'trabalhadas', gj.trabalhadas,
            'percentual', gj.percentual,
            'firstSlug', gj."firstSlug",
            'questoes', gj.questoes
          )
          ORDER BY gj.rn
        )
        FROM groups_json gj
      ),
      '[]'::jsonb
    )
  INTO v_total_modulos, v_total_groups, v_groups;

  v_total_pages := GREATEST(1, CEIL(v_total_groups::numeric / v_per_page::numeric)::int);
  v_page_clamped := LEAST(v_page, v_total_pages);

  RETURN jsonb_build_object(
    'groups', v_groups,
    'pagination', jsonb_build_object(
      'page', v_page_clamped,
      'perPage', v_per_page,
      'totalGroups', v_total_groups,
      'totalPages', v_total_pages
    ),
    'totalModulosFiltrados', v_total_modulos
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_vitrine_page(uuid, int, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vitrine_page(uuid, int, text, text, text) TO service_role;
COMMENT ON FUNCTION public.get_vitrine_page(uuid, int, text, text, text) IS
  'Vitrine paginada por titulo_aula com busca indexável e payload capado de questoes[] por grupo.';
