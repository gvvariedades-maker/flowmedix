-- Campos do builder admin: descrição longa e texto de destaque (vitrine/admin).

ALTER TABLE public.concursos
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS destaque text;

COMMENT ON COLUMN public.concursos.descricao IS 'Descrição do concurso (admin/builder); opcional.';
COMMENT ON COLUMN public.concursos.destaque IS 'Destaque ou chamada curta (admin/builder); opcional.';;
