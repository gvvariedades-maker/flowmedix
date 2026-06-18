-- Arquivar LP Goianinha (removida do produto).
UPDATE public.lp_pages
SET
  status = 'arquivado',
  updated_at = now()
WHERE path = 'goianinha';
