-- Fase 1.3 (escala): reforça índices para filtros/ordenação da vitrine
-- e garante cobertura trigram nos campos usados por `p_q`.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
-- Filtros determinísticos da vitrine.
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_titulo_aula
  ON public.modulos_estudo (banca, titulo_aula);
-- Ordenação por assunto no agrupamento e seleção por recência.
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_titulo_aula_created_at
  ON public.modulos_estudo (titulo_aula, created_at DESC);
-- Busca textual (`p_q`) com lower/coalesce para casar com a expressão da RPC.
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_titulo_aula_trgm
  ON public.modulos_estudo
  USING gin (lower(coalesce(titulo_aula, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_modulo_nome_trgm
  ON public.modulos_estudo
  USING gin (lower(coalesce(modulo_nome, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_trgm
  ON public.modulos_estudo
  USING gin (lower(coalesce(banca, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_modulo_slug_trgm
  ON public.modulos_estudo
  USING gin (lower(coalesce(modulo_slug, '')) gin_trgm_ops);
COMMENT ON INDEX idx_modulos_estudo_banca_titulo_aula IS
  'Fase 1.3: acelera filtros combinados de banca e assunto na vitrine.';
COMMENT ON INDEX idx_modulos_estudo_titulo_aula_created_at IS
  'Fase 1.3: acelera acesso por assunto com ordenacao por recencia.';
