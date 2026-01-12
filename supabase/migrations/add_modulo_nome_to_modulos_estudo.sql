-- Migration: Adicionar coluna modulo_nome na tabela modulos_estudo
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna modulo_nome (text) na tabela modulos_estudo
ALTER TABLE modulos_estudo 
ADD COLUMN IF NOT EXISTS modulo_nome TEXT;

-- Criar índice para melhorar performance nas consultas ordenadas por modulo_nome
CREATE INDEX IF NOT EXISTS idx_modulos_estudo_modulo_nome ON modulos_estudo(modulo_nome);

-- Comentário na coluna para documentação
COMMENT ON COLUMN modulos_estudo.modulo_nome IS 'Nome do módulo para agrupamento (ex: Módulo 01, Módulo 02)';
