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
  SELECT * INTO v_session FROM public.simulado_sessions WHERE id = p_session_id;
  IF v_session.id IS NULL THEN RETURN; END IF;
  IF v_session.status <> 'concluido' OR v_session.concluida_em IS NULL THEN RETURN; END IF;
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
    WHERE r.session_id = v_session.id AND r.user_id = v_session.user_id
  )
  UPDATE public.simulado_sessions s SET
    acertos = sr.acertos, erros = sr.erros,
    percentual_acerto = CASE WHEN sr.respondidas > 0 THEN round((sr.acertos::numeric / sr.respondidas::numeric) * 100, 2) ELSE NULL END,
    tempo_total_ms = sr.tempo_total_ms,
    tempo_medio_ms = CASE WHEN sr.respondidas > 0 THEN round(sr.tempo_total_ms::numeric / sr.respondidas::numeric)::integer ELSE NULL END
  FROM session_rollup sr WHERE s.id = v_session.id;
  DELETE FROM public.simulado_analytics_session_dims WHERE session_id = v_session.id;
  INSERT INTO public.simulado_analytics_session_dims (session_id, user_id, data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms, updated_at)
  SELECT v_session.id, v_session.user_id, v_data_ref, v_mode,
    coalesce(meta.banca, m.banca, 'DESCONHECIDA'),
    coalesce(meta.topico, m.modulo_nome, 'Geral'),
    coalesce(meta.subtopico, m.titulo_aula, m.modulo_nome, 'Geral'),
    count(*) FILTER (WHERE r.acertou IS NOT NULL)::integer,
    count(*) FILTER (WHERE r.acertou = true)::integer,
    count(*) FILTER (WHERE r.acertou = false)::integer,
    coalesce(sum(r.tempo_ms) FILTER (WHERE r.acertou IS NOT NULL), 0)::bigint, now()
  FROM public.simulado_respostas r
  INNER JOIN public.modulos_estudo m ON m.id = r.modulo_id
  LEFT JOIN LATERAL (
    SELECT nullif(btrim(m.conteudo_json #>> '{meta,banca}'), '') AS banca,
      nullif(btrim(m.conteudo_json #>> '{meta,topico}'), '') AS topico,
      nullif(btrim(m.conteudo_json #>> '{meta,subtopico}'), '') AS subtopico
  ) meta ON true
  WHERE r.session_id = v_session.id AND r.user_id = v_session.user_id AND r.acertou IS NOT NULL
  GROUP BY 1,2,3,4,5,6,7
  ON CONFLICT (session_id, modo, banca, topico, subtopico) DO UPDATE SET
    total_questoes = EXCLUDED.total_questoes, acertos = EXCLUDED.acertos, erros = EXCLUDED.erros,
    tempo_total_ms = EXCLUDED.tempo_total_ms, updated_at = now();
  DELETE FROM public.simulado_analytics_daily WHERE user_id = v_session.user_id AND data_ref = v_data_ref AND modo = v_mode;
  INSERT INTO public.simulado_analytics_daily (user_id, data_ref, modo, banca, topico, subtopico, total_questoes, acertos, erros, tempo_total_ms, updated_at)
  SELECT d.user_id, d.data_ref, d.modo, d.banca, d.topico, d.subtopico,
    sum(d.total_questoes)::integer, sum(d.acertos)::integer, sum(d.erros)::integer, sum(d.tempo_total_ms)::bigint, now()
  FROM public.simulado_analytics_session_dims d
  WHERE d.user_id = v_session.user_id AND d.data_ref = v_data_ref AND d.modo = v_mode
  GROUP BY 1,2,3,4,5,6;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_simulado_session_finalize_refresh_analytics()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'concluido' AND NEW.concluida_em IS NOT NULL
     AND (OLD.status IS DISTINCT FROM 'concluido' OR OLD.concluida_em IS DISTINCT FROM NEW.concluida_em) THEN
    PERFORM public.refresh_simulado_session_analytics(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_simulado_session_finalize_refresh_analytics ON public.simulado_sessions;
CREATE TRIGGER trg_simulado_session_finalize_refresh_analytics
AFTER UPDATE OF status, concluida_em ON public.simulado_sessions
FOR EACH ROW EXECUTE FUNCTION public.on_simulado_session_finalize_refresh_analytics();

REVOKE EXECUTE ON FUNCTION public.refresh_simulado_session_analytics(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_simulado_session_analytics(uuid) TO service_role;

DO $$
DECLARE v_session_id uuid;
BEGIN
  FOR v_session_id IN SELECT s.id FROM public.simulado_sessions s WHERE s.status = 'concluido' AND s.concluida_em IS NOT NULL
  LOOP
    PERFORM public.refresh_simulado_session_analytics(v_session_id);
  END LOOP;
END;
$$;;
