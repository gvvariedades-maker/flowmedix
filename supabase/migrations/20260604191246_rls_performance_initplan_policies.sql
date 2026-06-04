-- Fase 3 (performance): auth.uid() → (select auth.uid()) nas policies restantes (initplan).

DROP POLICY IF EXISTS "Users read own matriculas" ON public.concurso_matriculas;
CREATE POLICY "Users read own matriculas"
  ON public.concurso_matriculas FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own purchases" ON public.concurso_purchases;
CREATE POLICY "Users read own purchases"
  ON public.concurso_purchases FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users insert own pending purchases" ON public.concurso_purchases;
CREATE POLICY "Users insert own pending purchases"
  ON public.concurso_purchases FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    AND status = 'pending'::concurso_purchase_status
  );

DROP POLICY IF EXISTS "Users read own acessos" ON public.acessos;
CREATE POLICY "Users read own acessos"
  ON public.acessos FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own notebooks" ON public.study_notebooks;
CREATE POLICY "Users can manage own notebooks"
  ON public.study_notebooks FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage items of own notebooks" ON public.study_notebook_items;
CREATE POLICY "Users can manage items of own notebooks"
  ON public.study_notebook_items FOR ALL
  USING (
    notebook_id IN (
      SELECT id FROM public.study_notebooks WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    notebook_id IN (
      SELECT id FROM public.study_notebooks WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "error_reports_owner_insert" ON public.error_reports;
CREATE POLICY "error_reports_owner_insert"
  ON public.error_reports FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "error_reports_owner_select" ON public.error_reports;
CREATE POLICY "error_reports_owner_select"
  ON public.error_reports FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_sessions_owner_select" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_owner_select"
  ON public.simulado_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_sessions_owner_insert" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_owner_insert"
  ON public.simulado_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_sessions_owner_update" ON public.simulado_sessions;
CREATE POLICY "simulado_sessions_owner_update"
  ON public.simulado_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_respostas_owner_select" ON public.simulado_respostas;
CREATE POLICY "simulado_respostas_owner_select"
  ON public.simulado_respostas FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_respostas_owner_insert" ON public.simulado_respostas;
CREATE POLICY "simulado_respostas_owner_insert"
  ON public.simulado_respostas FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_respostas_owner_update" ON public.simulado_respostas;
CREATE POLICY "simulado_respostas_owner_update"
  ON public.simulado_respostas FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_select" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_select"
  ON public.simulado_templates FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_insert" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_insert"
  ON public.simulado_templates FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_update" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_update"
  ON public.simulado_templates FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_delete" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_delete"
  ON public.simulado_templates FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_analytics_daily_owner_select" ON public.simulado_analytics_daily;
CREATE POLICY "simulado_analytics_daily_owner_select"
  ON public.simulado_analytics_daily FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "simulado_analytics_session_dims_owner_select" ON public.simulado_analytics_session_dims;
CREATE POLICY "simulado_analytics_session_dims_owner_select"
  ON public.simulado_analytics_session_dims FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
