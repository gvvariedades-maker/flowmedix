-- Simulados analytics + retenção híbrida:
-- - Mantém detalhe por questão em simulado_respostas por 12 meses
-- - Preserva histórico agregado permanente por sessão (simulado_sessions)
-- - Preserva histórico agregado permanente por período/dimensão (simulado_analytics_daily)

ALTER TABLE public.simulado_sessions
  ADD COLUMN IF NOT EXISTS acertos integer,
  ADD COLUMN IF NOT EXISTS erros integer,
  ADD COLUMN IF NOT EXISTS percentual_acerto numeric(5,2),
  ADD COLUMN IF NOT EXISTS tempo_total_ms integer,
  ADD COLUMN IF NOT EXISTS tempo_medio_ms integer;

ALTER TABLE public.simulado_sessions
  DROP CONSTRAINT IF EXISTS simulado_sessions_acertos_non_negative,
  ADD CONSTRAINT simulado_sessions_acertos_non_negative
    CHECK (acertos IS NULL OR acertos >= 0),
  DROP CONSTRAINT IF EXISTS simulado_sessions_erros_non_negative,
  ADD CONSTRAINT simulado_sessions_erros_non_negative
    CHECK (erros IS NULL OR erros >= 0),
  DROP CONSTRAINT IF EXISTS simulado_sessions_percentual_range,
  ADD CONSTRAINT simulado_sessions_percentual_range
    CHECK (percentual_acerto IS NULL OR (percentual_acerto >= 0 AND percentual_acerto <= 100)),
  DROP CONSTRAINT IF EXISTS simulado_sessions_tempo_total_non_negative,
  ADD CONSTRAINT simulado_sessions_tempo_total_non_negative
    CHECK (tempo_total_ms IS NULL OR tempo_total_ms >= 0),
  DROP CONSTRAINT IF EXISTS simulado_sessions_tempo_medio_non_negative,
  ADD CONSTRAINT simulado_sessions_tempo_medio_non_negative
    CHECK (tempo_medio_ms IS NULL OR tempo_medio_ms >= 0);

CREATE INDEX IF NOT EXISTS idx_simulado_sessions_user_concluida_desc
  ON public.simulado_sessions (user_id, concluida_em DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_simulado_respostas_user_session_respondida
  ON public.simulado_respostas (user_id, session_id, respondida_em DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS public.simulado_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_ref date NOT NULL,
  modo text NOT NULL CHECK (modo IN ('treino', 'prova')),
  banca text NOT NULL DEFAULT 'DESCONHECIDA',
  topico text NOT NULL DEFAULT 'Geral',
  subtopico text NOT NULL DEFAULT 'Geral',
  total_questoes integer NOT NULL DEFAULT 0 CHECK (total_questoes >= 0),
  acertos integer NOT NULL DEFAULT 0 CHECK (acertos >= 0),
  erros integer NOT NULL DEFAULT 0 CHECK (erros >= 0),
  tempo_total_ms bigint NOT NULL DEFAULT 0 CHECK (tempo_total_ms >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, data_ref, modo, banca, topico, subtopico)
);

CREATE TABLE IF NOT EXISTS public.simulado_analytics_session_dims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.simulado_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_ref date NOT NULL,
  modo text NOT NULL CHECK (modo IN ('treino', 'prova')),
  banca text NOT NULL DEFAULT 'DESCONHECIDA',
  topico text NOT NULL DEFAULT 'Geral',
  subtopico text NOT NULL DEFAULT 'Geral',
  total_questoes integer NOT NULL DEFAULT 0 CHECK (total_questoes >= 0),
  acertos integer NOT NULL DEFAULT 0 CHECK (acertos >= 0),
  erros integer NOT NULL DEFAULT 0 CHECK (erros >= 0),
  tempo_total_ms bigint NOT NULL DEFAULT 0 CHECK (tempo_total_ms >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, modo, banca, topico, subtopico)
);

CREATE INDEX IF NOT EXISTS idx_simulado_analytics_daily_user_data
  ON public.simulado_analytics_daily (user_id, data_ref DESC);

CREATE INDEX IF NOT EXISTS idx_simulado_analytics_daily_dims
  ON public.simulado_analytics_daily (user_id, modo, banca, topico, subtopico);

CREATE INDEX IF NOT EXISTS idx_simulado_analytics_session_dims_user_data
  ON public.simulado_analytics_session_dims (user_id, data_ref DESC);

ALTER TABLE public.simulado_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_analytics_session_dims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "simulado_analytics_daily_owner_select" ON public.simulado_analytics_daily;
CREATE POLICY "simulado_analytics_daily_owner_select"
  ON public.simulado_analytics_daily
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_analytics_daily_service_write" ON public.simulado_analytics_daily;
CREATE POLICY "simulado_analytics_daily_service_write"
  ON public.simulado_analytics_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "simulado_analytics_session_dims_owner_select" ON public.simulado_analytics_session_dims;
CREATE POLICY "simulado_analytics_session_dims_owner_select"
  ON public.simulado_analytics_session_dims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_analytics_session_dims_service_write" ON public.simulado_analytics_session_dims;
CREATE POLICY "simulado_analytics_session_dims_service_write"
  ON public.simulado_analytics_session_dims
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.refresh_simulado_session_analytics(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.simulado_sessions%ROWTYPE;
  v_mode text;
  v_data_ref date;
BEGIN
  SELECT *
    INTO v_session
  FROM public.simulado_sessions
  WHERE id = p_session_id;

  IF v_session.id IS NULL THEN
    RETURN;
  END IF;

  IF v_session.status <> 'concluido' OR v_session.concluida_em IS NULL THEN
    RETURN;
  END IF;

  v_mode := CASE
    WHEN v_session.modo IN ('treino', 'prova') THEN v_session.modo
    WHEN coalesce(v_session.filtros ->> 'modo', 'treino') = 'prova' THEN 'prova'
    ELSE 'treino'
  END;
  v_data_ref := (v_session.concluida_em AT TIME ZONE 'UTC')::date;

  WITH session_rollup AS (
    SELECT
      count(*) FILTER (WHERE r.acertou IS NOT NULL)::integer AS respondidas,
      count(*) FILTER (WHERE r.acertou = true)::integer AS acertos,
      count(*) FILTER (WHERE r.acertou = false)::integer AS erros,
      coalesce(sum(r.tempo_ms) FILTER (WHERE r.acertou IS NOT NULL), 0)::integer AS tempo_total_ms
    FROM public.simulado_respostas r
    WHERE r.session_id = v_session.id
      AND r.user_id = v_session.user_id
  )
  UPDATE public.simulado_sessions s
  SET
    acertos = sr.acertos,
    erros = sr.erros,
    percentual_acerto = CASE
      WHEN sr.respondidas > 0 THEN round((sr.acertos::numeric / sr.respondidas::numeric) * 100, 2)
      ELSE NULL
    END,
    tempo_total_ms = sr.tempo_total_ms,
    tempo_medio_ms = CASE
      WHEN sr.respondidas > 0 THEN round(sr.tempo_total_ms::numeric / sr.respondidas::numeric)::integer
      ELSE NULL
    END
  FROM session_rollup sr
  WHERE s.id = v_session.id;

  DELETE FROM public.simulado_analytics_session_dims
  WHERE session_id = v_session.id;

  INSERT INTO public.simulado_analytics_session_dims (
    session_id,
    user_id,
    data_ref,
    modo,
    banca,
    topico,
    subtopico,
    total_questoes,
    acertos,
    erros,
    tempo_total_ms,
    updated_at
  )
  SELECT
    v_session.id AS session_id,
    v_session.user_id,
    v_data_ref AS data_ref,
    v_mode AS modo,
    coalesce(meta.banca, m.banca, 'DESCONHECIDA') AS banca,
    coalesce(meta.topico, m.modulo_nome, 'Geral') AS topico,
    coalesce(meta.subtopico, m.titulo_aula, m.modulo_nome, 'Geral') AS subtopico,
    count(*) FILTER (WHERE r.acertou IS NOT NULL)::integer AS total_questoes,
    count(*) FILTER (WHERE r.acertou = true)::integer AS acertos,
    count(*) FILTER (WHERE r.acertou = false)::integer AS erros,
    coalesce(sum(r.tempo_ms) FILTER (WHERE r.acertou IS NOT NULL), 0)::bigint AS tempo_total_ms,
    now() AS updated_at
  FROM public.simulado_respostas r
  INNER JOIN public.modulos_estudo m
    ON m.id = r.modulo_id
  LEFT JOIN LATERAL (
    SELECT
      nullif(btrim(m.conteudo_json #>> '{meta,banca}'), '') AS banca,
      nullif(btrim(m.conteudo_json #>> '{meta,topico}'), '') AS topico,
      nullif(btrim(m.conteudo_json #>> '{meta,subtopico}'), '') AS subtopico
  ) meta ON true
  WHERE r.session_id = v_session.id
    AND r.user_id = v_session.user_id
    AND r.acertou IS NOT NULL
  GROUP BY 1, 2, 3, 4, 5, 6, 7
  ON CONFLICT (session_id, modo, banca, topico, subtopico)
  DO UPDATE
    SET
      total_questoes = EXCLUDED.total_questoes,
      acertos = EXCLUDED.acertos,
      erros = EXCLUDED.erros,
      tempo_total_ms = EXCLUDED.tempo_total_ms,
      updated_at = now();

  DELETE FROM public.simulado_analytics_daily
  WHERE user_id = v_session.user_id
    AND data_ref = v_data_ref
    AND modo = v_mode;

  INSERT INTO public.simulado_analytics_daily (
    user_id,
    data_ref,
    modo,
    banca,
    topico,
    subtopico,
    total_questoes,
    acertos,
    erros,
    tempo_total_ms,
    updated_at
  )
  SELECT
    d.user_id,
    d.data_ref,
    d.modo,
    d.banca,
    d.topico,
    d.subtopico,
    sum(d.total_questoes)::integer AS total_questoes,
    sum(d.acertos)::integer AS acertos,
    sum(d.erros)::integer AS erros,
    sum(d.tempo_total_ms)::bigint AS tempo_total_ms,
    now() AS updated_at
  FROM public.simulado_analytics_session_dims d
  WHERE d.user_id = v_session.user_id
    AND d.data_ref = v_data_ref
    AND d.modo = v_mode
  GROUP BY 1, 2, 3, 4, 5, 6;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_simulado_session_finalize_refresh_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'concluido'
     AND NEW.concluida_em IS NOT NULL
     AND (OLD.status IS DISTINCT FROM 'concluido' OR OLD.concluida_em IS DISTINCT FROM NEW.concluida_em) THEN
    PERFORM public.refresh_simulado_session_analytics(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_simulado_session_finalize_refresh_analytics ON public.simulado_sessions;
CREATE TRIGGER trg_simulado_session_finalize_refresh_analytics
AFTER UPDATE OF status, concluida_em
ON public.simulado_sessions
FOR EACH ROW
EXECUTE FUNCTION public.on_simulado_session_finalize_refresh_analytics();

CREATE OR REPLACE FUNCTION public.simulado_run_retention(
  p_reference timestamptz DEFAULT now(),
  p_retention_months integer DEFAULT 12
)
RETURNS TABLE(
  consolidated_sessions integer,
  deleted_respostas integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff timestamptz;
BEGIN
  v_cutoff := p_reference - make_interval(months => GREATEST(p_retention_months, 1));

  WITH target_sessions AS (
    SELECT s.id
    FROM public.simulado_sessions s
    WHERE s.status = 'concluido'
      AND s.concluida_em IS NOT NULL
      AND s.concluida_em < v_cutoff
  )
  SELECT count(*)::integer
    INTO consolidated_sessions
  FROM target_sessions;

  PERFORM public.refresh_simulado_session_analytics(ts.id)
  FROM (
    SELECT s.id
    FROM public.simulado_sessions s
    WHERE s.status = 'concluido'
      AND s.concluida_em IS NOT NULL
      AND s.concluida_em < v_cutoff
  ) ts;

  DELETE FROM public.simulado_respostas r
  USING public.simulado_sessions s
  WHERE s.id = r.session_id
    AND s.status = 'concluido'
    AND s.concluida_em IS NOT NULL
    AND s.concluida_em < v_cutoff;

  GET DIAGNOSTICS deleted_respostas = ROW_COUNT;

  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_simulado_session_analytics(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_simulado_session_analytics(uuid)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.simulado_run_retention(timestamptz, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.simulado_run_retention(timestamptz, integer)
  TO service_role;

-- Backfill inicial para sessões já concluídas (idempotente).
DO $$
DECLARE
  v_session_id uuid;
BEGIN
  FOR v_session_id IN
    SELECT s.id
    FROM public.simulado_sessions s
    WHERE s.status = 'concluido'
      AND s.concluida_em IS NOT NULL
  LOOP
    PERFORM public.refresh_simulado_session_analytics(v_session_id);
  END LOOP;
END;
$$;

COMMENT ON TABLE public.simulado_analytics_daily IS
  'Agregados permanentes diários de simulados por usuário, modo e dimensões pedagógicas.';

COMMENT ON TABLE public.simulado_analytics_session_dims IS
  'Agregados permanentes por sessão e dimensão; base idempotente para materialização diária.';

COMMENT ON FUNCTION public.refresh_simulado_session_analytics(uuid) IS
  'Recalcula métricas da sessão concluída e consolida agregados em simulado_analytics_daily.';

COMMENT ON FUNCTION public.simulado_run_retention(timestamptz, integer) IS
  'Aplica retenção híbrida: consolida sessões concluídas e remove detalhe por questão após janela de retenção.';
