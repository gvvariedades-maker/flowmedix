-- Templates de e-mail editáveis no admin (boas-vindas + marketing).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_template_kind') THEN
    CREATE TYPE public.email_template_kind AS ENUM ('transactional', 'marketing');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.email_templates (
  slug text PRIMARY KEY,
  kind public.email_template_kind NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  preview_text text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_templates IS 'Copy de e-mails transacionais e campanhas de marketing (admin).';

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

INSERT INTO public.email_templates (slug, kind, name, subject, preview_text, content)
VALUES
  (
    'welcome',
    'transactional',
    'Boas-vindas (cadastro)',
    'Bem-vindo ao Avant',
    'Bem-vindo ao Avant — comece com NeuroSlides',
    jsonb_build_object(
      'headline', 'Olá, {{firstName}}!',
      'paragraph1', 'Bem-vindo ao Avant. Cada questão vira um NeuroSlide — estudo reverso visual que fixa o raciocínio clínico em poucos minutos.',
      'paragraph2', 'Mapas, regras de ouro e fluxos de decisão na ordem certa para a sua banca — sem reler PDF inteiro.',
      'ctaLabel', 'Ir para o dashboard',
      'ctaUrl', '/dashboard'
    )
  ),
  (
    'marketing',
    'marketing',
    'Campanha de marketing',
    'Novidades no AVANT',
    'Mensagem do AVANT para você',
    jsonb_build_object(
      'headline', 'Olá!',
      'paragraph1', 'Temos novidades no AVANT para acelerar sua preparação em Técnico de Enfermagem.',
      'paragraph2', 'Abra o app e confira os concursos e o estudo reverso com NeuroSlides.',
      'ctaLabel', 'Ver concursos abertos',
      'ctaUrl', '/planos'
    )
  )
ON CONFLICT (slug) DO NOTHING;;
