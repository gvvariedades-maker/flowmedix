-- Retenção híbrida de simulados: consolida analytics e remove detalhe de respostas antigas.
-- Mantém simulado_sessions, simulado_analytics_daily e simulado_analytics_session_dims.

CREATE OR REPLACE FUNCTION public.simulado_run_retention(
  p_retention_months integer DEFAULT 12,
  p_reference timestamptz DEFAULT now()
)
RETURNS TABLE(consolidated_sessions integer, deleted_respostas integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff timestamptz;
  v_consolidated integer := 0;
  v_deleted integer := 0;
  v_session_id uuid;
  v_batch_deleted integer;
BEGIN
  IF p_retention_months IS NULL OR p_retention_months < 1 THEN
    RAISE EXCEPTION 'p_retention_months must be >= 1';
  END IF;

  v_cutoff := p_reference - make_interval(months => p_retention_months);

  FOR v_session_id IN
    SELECT s.id
    FROM public.simulado_sessions s
    WHERE s.status = 'concluido'
      AND s.concluida_em IS NOT NULL
      AND s.concluida_em < v_cutoff
      AND EXISTS (
        SELECT 1
        FROM public.simulado_respostas r
        WHERE r.session_id = s.id
      )
    ORDER BY s.concluida_em ASC
  LOOP
    PERFORM public.refresh_simulado_session_analytics(v_session_id);
    v_consolidated := v_consolidated + 1;

    DELETE FROM public.simulado_respostas
    WHERE session_id = v_session_id;

    GET DIAGNOSTICS v_batch_deleted = ROW_COUNT;
    v_deleted := v_deleted + v_batch_deleted;
  END LOOP;

  RETURN QUERY SELECT v_consolidated, v_deleted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.simulado_run_retention(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.simulado_run_retention(integer, timestamptz) TO service_role;
