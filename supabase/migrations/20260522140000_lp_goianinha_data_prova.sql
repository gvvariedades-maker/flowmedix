-- Data oficial da prova IDIB Goianinha/RN (07/06/2026)
UPDATE public.lp_pages
SET
  config = jsonb_set(
    jsonb_set(config, '{concurso,dataProva}', '"2026-06-07"'),
    '{concurso,dataProvaFormatada}',
    '"07/06/2026"'
  ),
  updated_at = now()
WHERE path = 'goianinha';
