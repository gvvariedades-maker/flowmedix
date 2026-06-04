-- Fase 3 (performance): policies duplicadas, SELECT consolidado, índices FK/duplicado.
-- Sem mudança de regra de negócio — mesmas condições, menos avaliações por linha.

-- =============================================================================
-- historico_questoes: remover duplicata PT+EN; 4 policies com (select auth.uid())
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own question history" ON public.historico_questoes;
DROP POLICY IF EXISTS "Users can insert their own question history" ON public.historico_questoes;
DROP POLICY IF EXISTS "Users can update their own question history" ON public.historico_questoes;
DROP POLICY IF EXISTS "Users can delete their own question history" ON public.historico_questoes;
DROP POLICY IF EXISTS "Usuários veem seu próprio histórico" ON public.historico_questoes;
DROP POLICY IF EXISTS "Usuários gravam suas tentativas" ON public.historico_questoes;

DROP POLICY IF EXISTS "historico_questoes_owner_select" ON public.historico_questoes;
CREATE POLICY "historico_questoes_owner_select"
  ON public.historico_questoes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "historico_questoes_owner_insert" ON public.historico_questoes;
CREATE POLICY "historico_questoes_owner_insert"
  ON public.historico_questoes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "historico_questoes_owner_update" ON public.historico_questoes;
CREATE POLICY "historico_questoes_owner_update"
  ON public.historico_questoes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "historico_questoes_owner_delete" ON public.historico_questoes;
CREATE POLICY "historico_questoes_owner_delete"
  ON public.historico_questoes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- concursos / concurso_modulos / modulos_estudo: um SELECT permissivo (OR)
-- =============================================================================

DROP POLICY IF EXISTS "Users read enrolled concursos" ON public.concursos;
DROP POLICY IF EXISTS "Public read sellable concursos" ON public.concursos;
DROP POLICY IF EXISTS "concursos_select_enrolled_or_sellable" ON public.concursos;
CREATE POLICY "concursos_select_enrolled_or_sellable"
  ON public.concursos FOR SELECT
  USING (
    status = 'ativo'::concurso_status
    AND (
      (price_cents IS NOT NULL AND price_cents > 0)
      OR EXISTS (
        SELECT 1
        FROM public.concurso_matriculas mat
        WHERE mat.concurso_id = concursos.id
          AND mat.user_id = (select auth.uid())
          AND mat.status = 'ativo'::concurso_matricula_status
          AND (mat.expires_at IS NULL OR mat.expires_at > now())
      )
    )
  );

DROP POLICY IF EXISTS "Users read enrolled concurso modulos" ON public.concurso_modulos;
DROP POLICY IF EXISTS "Public read sellable concurso modulos" ON public.concurso_modulos;
DROP POLICY IF EXISTS "concurso_modulos_select_enrolled_or_sellable" ON public.concurso_modulos;
CREATE POLICY "concurso_modulos_select_enrolled_or_sellable"
  ON public.concurso_modulos FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_matriculas mat
      WHERE mat.concurso_id = concurso_modulos.concurso_id
        AND mat.user_id = (select auth.uid())
        AND mat.status = 'ativo'::concurso_matricula_status
        AND (mat.expires_at IS NULL OR mat.expires_at > now())
    )
    OR EXISTS (
      SELECT 1
      FROM public.concursos c
      WHERE c.id = concurso_modulos.concurso_id
        AND c.status = 'ativo'::concurso_status
        AND c.price_cents IS NOT NULL
        AND c.price_cents > 0
    )
  );

DROP POLICY IF EXISTS "Matriculated users view modulos_estudo" ON public.modulos_estudo;
DROP POLICY IF EXISTS "Public read modulos of sellable concursos" ON public.modulos_estudo;
DROP POLICY IF EXISTS "Anyone can view modulos_estudo" ON public.modulos_estudo;
DROP POLICY IF EXISTS "modulos_estudo_select_enrolled_or_sellable" ON public.modulos_estudo;
CREATE POLICY "modulos_estudo_select_enrolled_or_sellable"
  ON public.modulos_estudo FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_modulos cm
      INNER JOIN public.concurso_matriculas mat ON mat.concurso_id = cm.concurso_id
      WHERE cm.modulo_id = modulos_estudo.id
        AND mat.user_id = (select auth.uid())
        AND mat.status = 'ativo'::concurso_matricula_status
        AND (mat.expires_at IS NULL OR mat.expires_at > now())
    )
    OR EXISTS (
      SELECT 1
      FROM public.concurso_modulos cm
      INNER JOIN public.concursos c ON c.id = cm.concurso_id
      WHERE cm.modulo_id = modulos_estudo.id
        AND c.status = 'ativo'::concurso_status
        AND c.price_cents IS NOT NULL
        AND c.price_cents > 0
    )
  );

-- =============================================================================
-- Índices: FK sem cobertura dedicada; duplicata content_hash em modulos_estudo
-- =============================================================================

ALTER TABLE public.modulos_estudo DROP CONSTRAINT IF EXISTS unique_question_content;

CREATE INDEX IF NOT EXISTS idx_error_reports_resolved_by
  ON public.error_reports (resolved_by)
  WHERE resolved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_error_reports_simulado_session_id
  ON public.error_reports (simulado_session_id)
  WHERE simulado_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_simulado_respostas_modulo_id
  ON public.simulado_respostas (modulo_id);

CREATE INDEX IF NOT EXISTS idx_simulado_sessions_template_id
  ON public.simulado_sessions (template_id)
  WHERE template_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lp_pages_template_id
  ON public.lp_pages (template_id);

COMMENT ON INDEX public.idx_error_reports_resolved_by IS
  'FK error_reports.resolved_by — joins admin / triagem';

COMMENT ON INDEX public.idx_error_reports_simulado_session_id IS
  'FK error_reports.simulado_session_id — filtros por sessão de simulado';

COMMENT ON INDEX public.idx_simulado_respostas_modulo_id IS
  'FK simulado_respostas.modulo_id — pool e integridade referencial';

COMMENT ON INDEX public.idx_simulado_sessions_template_id IS
  'FK simulado_sessions.template_id — reuso de templates salvos';

COMMENT ON INDEX public.idx_lp_pages_template_id IS
  'FK lp_pages.template_id — listagem por modelo de LP';
