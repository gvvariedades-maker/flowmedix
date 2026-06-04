-- Modo Prova Fase 1: título legível, meta de ritmo e marcação de início da prova

ALTER TABLE public.simulado_sessions
  ADD COLUMN IF NOT EXISTS titulo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ritmo_meta_segundos_por_questao integer NULL
    CHECK (ritmo_meta_segundos_por_questao IS NULL OR ritmo_meta_segundos_por_questao > 0),
  ADD COLUMN IF NOT EXISTS prova_iniciada_em timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_simulado_sessions_user_titulo_concluida
  ON public.simulado_sessions (user_id, titulo, concluida_em DESC);
