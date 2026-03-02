-- Migration: Criar tabela historico_questoes
-- Execute este script no SQL Editor do Supabase
-- Data: 2026-01-27
-- Objetivo: Criar tabela para armazenar histórico de tentativas de questões dos alunos

-- ============================================================================
-- CRIAÇÃO DA TABELA historico_questoes
-- ============================================================================

CREATE TABLE IF NOT EXISTS historico_questoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  modulo_slug text NOT NULL,
  topico text,
  subtopico text,
  banca text,
  acertou boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
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

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_historico_questoes_created_at 
  ON historico_questoes(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE historico_questoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios registros
CREATE POLICY "Users can view their own question history"
  ON historico_questoes FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir apenas seus próprios registros
CREATE POLICY "Users can insert their own question history"
  ON historico_questoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar apenas seus próprios registros (opcional, para limpeza)
CREATE POLICY "Users can delete their own question history"
  ON historico_questoes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE historico_questoes IS 
  'Armazena o histórico de tentativas de questões respondidas pelos alunos';

COMMENT ON COLUMN historico_questoes.user_id IS 
  'ID do usuário que respondeu a questão';

COMMENT ON COLUMN historico_questoes.modulo_slug IS 
  'Slug único do módulo/aula respondida';

COMMENT ON COLUMN historico_questoes.topico IS 
  'Tópico principal da questão';

COMMENT ON COLUMN historico_questoes.subtopico IS 
  'Subtópico específico da questão';

COMMENT ON COLUMN historico_questoes.banca IS 
  'Banca examinadora da questão';

COMMENT ON COLUMN historico_questoes.acertou IS 
  'Indica se o aluno acertou (true) ou errou (false) a questão';

COMMENT ON COLUMN historico_questoes.created_at IS 
  'Data e hora em que a questão foi respondida';
