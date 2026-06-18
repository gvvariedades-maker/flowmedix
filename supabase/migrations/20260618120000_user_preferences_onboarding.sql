-- Preferências de onboarding do aluno (motor adaptativo — Fase 1)

CREATE TABLE IF NOT EXISTS public.user_preferences_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  topicos_afinidade text[] NOT NULL DEFAULT '{}'::text[],
  topicos_dificuldade text[] NOT NULL DEFAULT '{}'::text[],
  carga_horaria_semanal integer
    CHECK (
      carga_horaria_semanal IS NULL
      OR (carga_horaria_semanal >= 1 AND carga_horaria_semanal <= 60)
    ),
  bancas_foco text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding_created_at
  ON public.user_preferences_onboarding (created_at DESC);

ALTER TABLE public.user_preferences_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_preferences_onboarding_owner_select" ON public.user_preferences_onboarding;
CREATE POLICY "user_preferences_onboarding_owner_select"
  ON public.user_preferences_onboarding
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_preferences_onboarding_owner_insert" ON public.user_preferences_onboarding;
CREATE POLICY "user_preferences_onboarding_owner_insert"
  ON public.user_preferences_onboarding
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_preferences_onboarding_owner_update" ON public.user_preferences_onboarding;
CREATE POLICY "user_preferences_onboarding_owner_update"
  ON public.user_preferences_onboarding
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

COMMENT ON TABLE public.user_preferences_onboarding IS
  'Preferências declaradas no onboarding de entrada (afinidades, fraquezas, bancas-alvo).';

COMMENT ON COLUMN public.user_preferences_onboarding.topicos_afinidade IS
  'Áreas de estudo em que o aluno se sente mais confiante.';

COMMENT ON COLUMN public.user_preferences_onboarding.topicos_dificuldade IS
  'Áreas de estudo em que o aluno quer focar por insegurança.';

COMMENT ON COLUMN public.user_preferences_onboarding.carga_horaria_semanal IS
  'Horas semanais disponíveis para estudo (opcional, 1–60).';

COMMENT ON COLUMN public.user_preferences_onboarding.bancas_foco IS
  'Bancas/órgãos de interesse para o concurso alvo.';
