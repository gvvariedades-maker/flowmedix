-- Migration: Índices Críticos para Performance
-- Execute este script no SQL Editor do Supabase
-- Data: 2026-01-23
-- Objetivo: Melhorar performance de queries frequentes

-- ============================================================================
-- ÍNDICES PARA modulos_estudo
-- ============================================================================

-- Índice para busca por slug (query mais frequente)
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_modulo_slug 
  ON modulos_estudo(modulo_slug);

-- Índice composto para navegação (banca + modulo_nome)
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_modulo_nome 
  ON modulos_estudo(banca, modulo_nome);

-- Índice para detecção de duplicatas (content_hash)
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_content_hash 
  ON modulos_estudo(content_hash);

-- Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_created_at 
  ON modulos_estudo(created_at DESC);

-- Índice composto para filtros comuns (banca + created_at)
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_banca_created 
  ON modulos_estudo(banca, created_at DESC);

-- ============================================================================
-- ÍNDICES PARA historico_questoes
-- ============================================================================

-- Índice para busca por módulo (cálculo de estatísticas)
CREATE INDEX IF NOT EXISTS idx_historico_questoes_modulo_slug 
  ON historico_questoes(modulo_slug);

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_id 
  ON historico_questoes(user_id);

-- Índice composto para queries de estatísticas (user + módulo)
CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_modulo 
  ON historico_questoes(user_id, modulo_slug);

-- Índice para filtro de acertos (usado em cálculos)
CREATE INDEX IF NOT EXISTS idx_historico_questoes_acertou 
  ON historico_questoes(acertou) WHERE acertou = true;

-- Índice composto para estatísticas completas
CREATE INDEX IF NOT EXISTS idx_historico_questoes_modulo_acertou 
  ON historico_questoes(modulo_slug, acertou);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON INDEX idx_modulos_estudo_modulo_slug IS 
  'Índice crítico para busca de questões por slug (usado em /estudar/[slug])';

COMMENT ON INDEX idx_modulos_estudo_banca_modulo_nome IS 
  'Índice composto para navegação entre questões da mesma banca e módulo';

COMMENT ON INDEX idx_modulos_estudo_content_hash IS 
  'Índice para detecção rápida de questões duplicadas';

COMMENT ON INDEX idx_historico_questoes_modulo_slug IS 
  'Índice crítico para cálculo de estatísticas por módulo (usado em /estudar)';

COMMENT ON INDEX idx_historico_questoes_user_modulo IS 
  'Índice composto para queries de progresso do usuário por módulo';
