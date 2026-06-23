-- Registro de subtópicos que precisam de extração de diretrizes oficiais (tier A/B)
-- para alimentar lib/guidelines/ e geração IA com factcheck.

CREATE TYPE guideline_urgency AS ENUM ('critical', 'high', 'medium', 'low', 'none');
CREATE TYPE guideline_extraction_status AS ENUM (
  'pending',
  'in_progress',
  'extracted',
  'codified',
  'not_applicable'
);
CREATE TYPE guideline_source_tier AS ENUM ('A', 'B');

CREATE TABLE public.subtopico_guideline_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopico text NOT NULL UNIQUE,
  topico text NOT NULL,
  topico_ordem smallint NOT NULL,
  subtopico_ordem smallint NOT NULL,
  needs_official_data boolean NOT NULL DEFAULT true,
  urgency guideline_urgency NOT NULL DEFAULT 'medium',
  question_count integer NOT NULL DEFAULT 0,
  has_premium_builder boolean NOT NULL DEFAULT false,
  has_bespoke_molde boolean NOT NULL DEFAULT false,
  has_guideline_codified boolean NOT NULL DEFAULT false,
  guideline_table_id text,
  extraction_status guideline_extraction_status NOT NULL DEFAULT 'pending',
  primary_issuer text,
  extraction_notes text,
  rollout_priority integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subtopico_guideline_registry IS
  'Mapa de subtópicos AVANT que exigem diretrizes oficiais para builders/IA. question_count atualizado via refresh_subtopico_guideline_counts().';

CREATE TABLE public.guideline_source_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id uuid NOT NULL REFERENCES public.subtopico_guideline_registry(id) ON DELETE CASCADE,
  source_id text NOT NULL,
  tier guideline_source_tier NOT NULL,
  issuer text NOT NULL,
  title text NOT NULL,
  year smallint,
  url text,
  priority smallint NOT NULL DEFAULT 1,
  extraction_status guideline_extraction_status NOT NULL DEFAULT 'pending',
  extracted_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (registry_id, source_id)
);

COMMENT ON TABLE public.guideline_source_candidates IS
  'Fontes oficiais candidatas à extração (gov.br, COFEN, Anvisa, sociedades tier B).';

CREATE INDEX idx_subtopico_guideline_registry_urgency
  ON public.subtopico_guideline_registry (urgency, rollout_priority);

CREATE INDEX idx_guideline_source_candidates_registry
  ON public.guideline_source_candidates (registry_id, priority);

-- Atualiza question_count a partir de modulos_estudo (meta.subtopico no JSON).
CREATE OR REPLACE FUNCTION public.refresh_subtopico_guideline_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE subtopico_guideline_registry r
  SET
    question_count = COALESCE(c.cnt, 0),
    updated_at = now()
  FROM (
    SELECT
      COALESCE(conteudo_json->'meta'->>'subtopico', subtopico, assunto) AS subtopico,
      COUNT(*)::int AS cnt
    FROM modulos_estudo
    GROUP BY 1
  ) c
  WHERE r.subtopico = c.subtopico;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_subtopico_guideline_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_subtopico_guideline_counts() TO service_role;

-- RLS: leitura admin via service_role; sem acesso anon/authenticated.
ALTER TABLE public.subtopico_guideline_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guideline_source_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY subtopico_guideline_registry_service_role
  ON public.subtopico_guideline_registry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY guideline_source_candidates_service_role
  ON public.guideline_source_candidates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
