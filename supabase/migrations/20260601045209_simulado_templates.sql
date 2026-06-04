-- Modo Prova Fase 4: templates salvos e vínculo com sessões

CREATE TABLE IF NOT EXISTS public.simulado_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  modo text NOT NULL CHECK (modo IN ('treino', 'prova')),
  quantidade integer NOT NULL CHECK (quantidade BETWEEN 1 AND 100),
  filtros jsonb NOT NULL DEFAULT '{}'::jsonb,
  ritmo_meta_segundos_por_questao integer NULL
    CHECK (ritmo_meta_segundos_por_questao IS NULL OR ritmo_meta_segundos_por_questao > 0),
  ultimo_uso_em timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulado_templates_user_created
  ON public.simulado_templates (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulado_templates_user_ultimo_uso
  ON public.simulado_templates (user_id, ultimo_uso_em DESC NULLS LAST, created_at DESC);

ALTER TABLE public.simulado_sessions
  ADD COLUMN IF NOT EXISTS template_id uuid NULL
    REFERENCES public.simulado_templates(id) ON DELETE SET NULL;

ALTER TABLE public.simulado_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "simulado_templates_owner_select" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_select"
  ON public.simulado_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_insert" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_insert"
  ON public.simulado_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_update" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_update"
  ON public.simulado_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_templates_owner_delete" ON public.simulado_templates;
CREATE POLICY "simulado_templates_owner_delete"
  ON public.simulado_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
