-- Cadernos Prontos: rastreia origem do pack para idempotência (clone único por user+pack).
-- Coluna nullable — cadernos manuais seguem intactos.
-- RLS FOR ALL existente em study_notebooks já cobre a coluna nova (sem policy nova).

ALTER TABLE public.study_notebooks
  ADD COLUMN IF NOT EXISTS source_pack_id text;

COMMENT ON COLUMN public.study_notebooks.source_pack_id IS
  'ID estável do pack em lib/cadernos/packs.ts; NULL = caderno manual/wizard.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_notebooks_user_source_pack
  ON public.study_notebooks (user_id, source_pack_id)
  WHERE source_pack_id IS NOT NULL;
