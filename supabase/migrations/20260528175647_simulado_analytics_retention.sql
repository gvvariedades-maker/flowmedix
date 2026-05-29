-- Simulados analytics + retenção híbrida

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
  ON public.simulado_analytics_daily FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_analytics_daily_service_write" ON public.simulado_analytics_daily;
CREATE POLICY "simulado_analytics_daily_service_write"
  ON public.simulado_analytics_daily FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "simulado_analytics_session_dims_owner_select" ON public.simulado_analytics_session_dims;
CREATE POLICY "simulado_analytics_session_dims_owner_select"
  ON public.simulado_analytics_session_dims FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "simulado_analytics_session_dims_service_write" ON public.simulado_analytics_session_dims;
CREATE POLICY "simulado_analytics_session_dims_service_write"
  ON public.simulado_analytics_session_dims FOR ALL TO service_role USING (true) WITH CHECK (true);;
