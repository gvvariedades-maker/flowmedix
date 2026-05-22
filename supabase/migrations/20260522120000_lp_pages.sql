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

-- Desliga vitrine de pacotes por edital (histórico de matrículas/compras preservado).
UPDATE public.concursos
SET price_cents = NULL
WHERE tipo = 'edital' AND slug <> 'geral';

-- Template padrão
INSERT INTO public.lp_templates (slug, nome, default_config)
VALUES (
  'concurso_pro_v1',
  'LP Concurso — AVANT Pro',
  '{"oferta":{"preco":"14,90"}}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Campina Grande e Goianinha (configs das páginas estáticas legadas)
DO $$
DECLARE
  tpl_id uuid;
BEGIN
  SELECT id INTO tpl_id FROM public.lp_templates WHERE slug = 'concurso_pro_v1' LIMIT 1;
  IF tpl_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.lp_pages (
    path, template_id, status, internal_name, config, seo, published_at, updated_at
  ) VALUES (
    'campina-grande',
    tpl_id,
    'ativo',
    'Campina Grande PB 2026',
    '{
      "concurso": {
        "cidade": "Campina Grande",
        "cargo": "Técnico em Enfermagem",
        "banca": "IDECAN",
        "nomeBanca": "IDECAN",
        "vagas": "50",
        "vagasPCD": "5",
        "dataProva": "2026-08-30",
        "dataProvaFormatada": "30/08/2026",
        "statusInscricoes": "Inscrições até 15/06",
        "remuneracao": "A divulgar",
        "taxaInscricao": "R$ 110,00",
        "orgao": "Prefeitura de Campina Grande"
      },
      "oferta": { "preco": "14,90" },
      "copy": {
        "headlinePrincipal": "Questões reais da IDECAN para Técnico de Enfermagem em Campina Grande",
        "subtitulo": "Treine o padrão exato que a banca cobra. Assinatura AVANT Pro com Estudo Reverso e NeuroSlides após cada questão.",
        "dores": [
          "Você estuda teoria de enfermeiro mas a banca cobra raciocínio de técnico",
          "Erra questões por detalhe e não sabe como evitar o mesmo erro",
          "Não tem clareza do que ainda está derrubando sua nota"
        ],
        "perigosBanca": [
          "A IDECAN cobra sequência de procedimentos — não só o conceito isolado",
          "Questões com duas alternativas quase certas — detalhes técnicos decidem",
          "Biossegurança e EPIs aparecem em todo concurso IDECAN para enfermagem"
        ],
        "listaBeneficios": [
          "Questões reais de concursos IDECAN para Técnico em Enfermagem",
          "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
          "Diagnóstico imediato: erro de conceito, detalhe ou pegadinha de banca",
          "Revisão espaçada automática — sem planilha",
          "Plano diário adaptado ao seu desempenho",
          "Acesso completo à plataforma com assinatura AVANT Pro"
        ],
        "disclaimer": "Conteúdo focado em Conhecimentos Específicos de Enfermagem no padrão IDECAN, com acesso completo via assinatura AVANT Pro.",
        "disclaimerLegal": "O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem afiliados ao IDECAN ou à Prefeitura de Campina Grande."
      },
      "walkthrough": {
        "imagens": [
          "/images/campina-grande/walk-01.jpg",
          "/images/campina-grande/walk-02.jpg",
          "/images/campina-grande/walk-03.jpg",
          "/images/campina-grande/walk-04.jpg",
          "/images/campina-grande/walk-05.jpg",
          "/images/campina-grande/walk-06.jpg",
          "/images/campina-grande/walk-07.jpg",
          "/images/campina-grande/walk-08.jpg"
        ]
      }
    }'::jsonb,
    '{
      "title": "Técnico de Enfermagem Campina Grande | AVANT",
      "description": "Questões reais da IDECAN para Técnico de Enfermagem em Campina Grande. Estudo Reverso com NeuroSlides no AVANT Pro.",
      "canonical": "/lp/campina-grande",
      "ogTitle": "Questões reais da IDECAN para Técnico de Enfermagem | AVANT",
      "ogDescription": "Domine a parte que mais pesa na prova de Campina Grande: Conhecimentos Específicos de Técnico de Enfermagem com AVANT Pro."
    }'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (path) DO NOTHING;

  INSERT INTO public.lp_pages (
    path, template_id, status, internal_name, config, seo, published_at, updated_at
  ) VALUES (
    'goianinha',
    tpl_id,
    'ativo',
    'Goianinha/RN',
    '{
      "concurso": {
        "cidade": "Goianinha",
        "cargo": "Técnico em Enfermagem",
        "banca": "IDIB",
        "nomeBanca": "IDIB",
        "vagas": "A divulgar",
        "vagasPCD": "A divulgar",
        "dataProva": "2026-12-31",
        "dataProvaFormatada": "A divulgar",
        "statusInscricoes": "Inscrições encerradas",
        "remuneracao": "A divulgar",
        "taxaInscricao": "A divulgar",
        "orgao": "Prefeitura de Goianinha/RN"
      },
      "oferta": { "preco": "14,90" },
      "copy": {
        "headlinePrincipal": "Questões reais da IDIB para Técnico de Enfermagem em Goianinha/RN",
        "subtitulo": "Prepare-se com o padrão exato que a banca cobra. Assinatura AVANT Pro com Estudo Reverso e NeuroSlides após cada questão.",
        "dores": [
          "Você estuda material genérico sem saber o padrão específico da IDIB",
          "Erra questões por detalhe técnico que só aparece em questões reais da banca",
          "Não tem plano de estudo direcionado para o que esse concurso cobra"
        ],
        "perigosBanca": [
          "A IDIB foca em procedimentos técnicos com detalhes de execução",
          "Questões de farmacologia e cálculo de dose aparecem com frequência",
          "Saúde pública e SUS são cobrados com foco na atenção básica municipal"
        ],
        "listaBeneficios": [
          "Questões reais de concursos IDIB para Técnico em Enfermagem",
          "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
          "Diagnóstico imediato do erro",
          "Revisão espaçada automática",
          "Plano diário adaptado ao seu desempenho",
          "Acesso completo à plataforma com assinatura AVANT Pro"
        ],
        "disclaimer": "Conteúdo focado em Conhecimentos Específicos de Enfermagem para o padrão IDIB, dentro da assinatura AVANT Pro.",
        "disclaimerLegal": "O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem afiliados à IDIB ou à Prefeitura de Goianinha."
      },
      "walkthrough": {
        "imagens": [
          "/images/goianinha/walk-01.jpg",
          "/images/goianinha/walk-02.jpg",
          "/images/goianinha/walk-03.jpg",
          "/images/goianinha/walk-04.jpg",
          "/images/goianinha/walk-05.jpg",
          "/images/goianinha/walk-06.jpg",
          "/images/goianinha/walk-07.jpg",
          "/images/goianinha/walk-08.jpg"
        ]
      }
    }'::jsonb,
    '{
      "title": "Técnico de Enfermagem Goianinha/RN | AVANT",
      "description": "Questões reais da IDIB para Técnico de Enfermagem em Goianinha/RN. Estudo Reverso com NeuroSlides no AVANT Pro.",
      "canonical": "/lp/goianinha",
      "ogTitle": "Questões reais da IDIB para Técnico de Enfermagem | AVANT",
      "ogDescription": "Questões reais da IDIB para Técnico de Enfermagem em Goianinha/RN. Estudo Reverso com NeuroSlides no AVANT Pro."
    }'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (path) DO NOTHING;
END $$;
