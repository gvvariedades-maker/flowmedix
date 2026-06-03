-- Índices de navegação /estudar (passo 9.2 — performance plano instantâneo).
-- Cobre getQuestoesByBancaCached: .eq(banca).eq(modulo_nome).order(created_at).

CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_modulo_nome
  ON public.modulos_estudo (banca, modulo_nome);

CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_modulo_nome_created_at
  ON public.modulos_estudo (banca, modulo_nome, created_at ASC);

COMMENT ON INDEX public.idx_modulos_estudo_banca_modulo_nome IS
  'Navegação entre questões da mesma banca e módulo (dots do player)';

COMMENT ON INDEX public.idx_modulos_estudo_banca_modulo_nome_created_at IS
  'Navegação ordenada por created_at na mesma banca/módulo';
