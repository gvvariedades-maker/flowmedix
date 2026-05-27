-- Migration: Adicionar coluna estudo_reverso_concluido em historico_questoes
-- Data: 2026-03-29
-- Objetivo: Registrar quando o aluno confirma explicitamente que concluiu o ciclo de estudo reverso

ALTER TABLE historico_questoes
ADD COLUMN IF NOT EXISTS estudo_reverso_concluido BOOLEAN DEFAULT false;

-- Índice para busca rápida por conclusão de estudo reverso
CREATE INDEX IF NOT EXISTS idx_historico_estudo_concluido
  ON historico_questoes(user_id, modulo_slug, estudo_reverso_concluido)
  WHERE estudo_reverso_concluido = true;

COMMENT ON COLUMN historico_questoes.estudo_reverso_concluido IS
  'true quando o aluno clicou em "Marcar estudo reverso como concluído" no último slide';
