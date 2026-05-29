-- CMS de landing pages (funil AVANT Pro) — templates reutilizáveis e instâncias por edital.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lp_page_status') THEN
    CREATE TYPE public.lp_page_status AS ENUM ('rascunho', 'ativo', 'arquivado');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.lp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lp_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  template_id uuid NOT NULL REFERENCES public.lp_templates(id) ON DELETE RESTRICT,
  status public.lp_page_status NOT NULL DEFAULT 'rascunho',
  internal_name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_campaign text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lp_pages_path_format CHECK (path ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS idx_lp_pages_status ON public.lp_pages(status);
CREATE INDEX IF NOT EXISTS idx_lp_pages_path ON public.lp_pages(path);

COMMENT ON TABLE public.lp_templates IS 'Modelos reutilizáveis de LP (layout/copy defaults).';
COMMENT ON TABLE public.lp_pages IS 'Instâncias publicadas de LP por path (/lp/{path}).';

ALTER TABLE public.lp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lp_pages_select_published ON public.lp_pages;
CREATE POLICY lp_pages_select_published ON public.lp_pages
  FOR SELECT
  USING (status = 'ativo');

DROP POLICY IF EXISTS lp_templates_select_all ON public.lp_templates;
CREATE POLICY lp_templates_select_all ON public.lp_templates
  FOR SELECT
  USING (true);

UPDATE public.concursos
SET price_cents = NULL
WHERE tipo = 'edital' AND slug <> 'geral';

INSERT INTO public.lp_templates (slug, nome, default_config)
VALUES (
  'concurso_pro_v1',
  'LP Concurso — AVANT Pro',
  '{"oferta":{"preco":"14,90"}}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;;
