-- Boas-vindas: copy Técnico de Enfermagem + visual alinhado ao DEFAULT_WELCOME_CONTENT.

UPDATE public.email_templates
SET
  subject = 'Bem-vindo ao AVANT — Técnico de Enfermagem',
  preview_text = 'Estudo reverso com NeuroSlides — comece pela sua primeira questão',
  content = jsonb_build_object(
    'headline', 'Olá, {{firstName}}!',
    'paragraph1',
    'Você entrou no AVANT — estudo reverso feito para Técnicos de Enfermagem em concursos públicos. Cada questão vira um NeuroSlide que fixa o raciocínio clínico em poucos minutos.',
    'paragraph2',
    'Mapas conceituais, regras de ouro e fluxos de decisão na ordem da sua banca — sem reler PDF inteiro.',
    'ctaLabel', 'Começar no AVANT',
    'ctaUrl', '/estudar'
  ),
  updated_at = now()
WHERE slug = 'welcome';
