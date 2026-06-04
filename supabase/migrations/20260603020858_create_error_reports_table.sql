-- Migration: Criar tabela error_reports
-- Objetivo: armazenar reportes de erro enviados por alunos com contexto técnico

CREATE TABLE IF NOT EXISTS public.error_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  context_type text NOT NULL CHECK (context_type IN ('lesson', 'simulado')),
  modulo_slug text,
  simulado_session_id uuid REFERENCES public.simulado_sessions(id) ON DELETE SET NULL,
  page_url text,
  category text NOT NULL CHECK (category IN ('enunciado', 'alternativas', 'gabarito', 'slides', 'navegacao', 'outro')),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'triagem', 'resolvido', 'descartado')),
  priority text NOT NULL DEFAULT 'p2' CHECK (priority IN ('p0', 'p1', 'p2', 'p3')),
  severity text,
  description text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices operacionais
CREATE INDEX IF NOT EXISTS idx_error_reports_status_priority_created
  ON public.error_reports(status, priority, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_reports_context_created
  ON public.error_reports(context_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_reports_user_created
  ON public.error_reports(user_id, created_at DESC);

-- RLS para criação segura por aluno
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "error_reports_owner_insert" ON public.error_reports;
CREATE POLICY "error_reports_owner_insert"
  ON public.error_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Opcional: permitir leitura dos próprios reports (útil para UX futuro)
DROP POLICY IF EXISTS "error_reports_owner_select" ON public.error_reports;
CREATE POLICY "error_reports_owner_select"
  ON public.error_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.error_reports IS
  'Reportes de erro enviados por alunos nos fluxos de estudo e simulado.';

COMMENT ON COLUMN public.error_reports.context_type IS
  'Contexto de origem do reporte: lesson ou simulado.';

COMMENT ON COLUMN public.error_reports.metadata IS
  'Contexto técnico adicional para reprodução do problema (jsonb).';
