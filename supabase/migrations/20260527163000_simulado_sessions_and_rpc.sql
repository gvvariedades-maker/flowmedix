-- Modo Simulado (backlog pós Fase 1.1):
-- - Tabelas de sessão/respostas com FK para modulos_estudo(id)
-- - Sorteio de questões via RPC (sem carregar catálogo no Node)

CREATE TABLE IF NOT EXISTS public.simulado_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_questoes integer NOT NULL CHECK (total_questoes > 0 AND total_questoes <= 100),
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'concluido', 'cancelado')),
  filtros jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  concluida_em timestamptz NULL
);
CREATE INDEX IF NOT EXISTS idx_simulado_sessions_user_status_created
  ON public.simulado_sessions(user_id, status, created_at DESC);
CREATE TABLE IF NOT EXISTS public.simulado_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.simulado_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos_estudo(id) ON DELETE RESTRICT,
  modulo_slug text NOT NULL,
  ordem integer NOT NULL CHECK (ordem > 0),
  opcao_id text NULL,
  opcao_correta_id text NULL,
  acertou boolean NULL,
  respondida_em timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, modulo_id),
  UNIQUE(session_id, ordem)
);
CREATE INDEX IF NOT EXISTS idx_simulado_respostas_session_ordem
  ON public.simulado_respostas(session_id, ordem);
CREATE INDEX IF NOT EXISTS idx_simulado_respostas_user_session
  ON public.simulado_respostas(user_id, session_id);
ALTER TABLE public.simulado_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_respostas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "simulado_sessions_owner_select" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_owner_select"
  ON public.simulado_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "simulado_sessions_owner_insert" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_owner_insert"
  ON public.simulado_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "simulado_sessions_owner_update" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_owner_update"
  ON public.simulado_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "simulado_respostas_owner_select" ON public.simulado_respostas;
CREATE POLICY "simulado_respostas_owner_select"
  ON public.simulado_respostas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "simulado_respostas_owner_insert" ON public.simulado_respostas;
CREATE POLICY "simulado_respostas_owner_insert"
  ON public.simulado_respostas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "simulado_respostas_owner_update" ON public.simulado_respostas;
CREATE POLICY "simulado_respostas_owner_update"
  ON public.simulado_respostas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.get_simulado_question_pool(
  p_user_id uuid,
  p_quantidade integer DEFAULT 20,
  p_banca text DEFAULT NULL,
  p_assunto text DEFAULT NULL,
  p_q text DEFAULT NULL
)
RETURNS TABLE(modulo_id uuid, modulo_slug text, ordem integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_accessible_limit constant int := 10000;
  v_quantidade int := LEAST(GREATEST(COALESCE(p_quantidade, 20), 1), 100);
  v_q text := NULLIF(lower(btrim(coalesce(p_q, ''))), '');
  v_q_num text := regexp_replace(lower(btrim(coalesce(p_q, ''))), '^q-?', '', 'i');
BEGIN
  RETURN QUERY
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
      m.avant_codigo,
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
      lm.modulo_nome,
      lm.titulo_aula,
      lm.banca,
      lm.avant_codigo,
      lm.created_at
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
      dbi.avant_codigo,
      dbi.created_at
    FROM deduped_by_id dbi
    ORDER BY dbi.modulo_slug, dbi.created_at DESC NULLS LAST
  ),
  accessible_modulos AS (
    SELECT *
    FROM deduped_by_slug
    ORDER BY created_at DESC NULLS LAST
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
  sampled AS (
    SELECT
      fm.id AS modulo_id_selected,
      fm.modulo_slug AS modulo_slug_selected
    FROM filtered_modulos fm
    ORDER BY random()
    LIMIT v_quantidade
  )
  SELECT
    s.modulo_id_selected AS modulo_id,
    s.modulo_slug_selected AS modulo_slug,
    ROW_NUMBER() OVER (ORDER BY s.modulo_slug_selected ASC)::integer AS ordem
  FROM sampled s;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_simulado_question_pool(uuid, integer, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_simulado_question_pool(uuid, integer, text, text, text)
  TO service_role;
COMMENT ON FUNCTION public.get_simulado_question_pool(uuid, integer, text, text, text) IS
  'Sorteia questões acessíveis do aluno para sessão de simulado (com filtros banca/assunto/q).';
