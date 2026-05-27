-- Garante que o mesmo enunciado (content_hash) não seja inserido duas vezes.
-- O AVANT gera content_hash a partir do texto normalizado de question_data.instruction.
--
-- ATENÇÃO: a criação falha se já existirem duas ou mais linhas com o mesmo content_hash.
-- Nesse caso, deduplicar manualmente antes de aplicar a migration.

CREATE UNIQUE INDEX IF NOT EXISTS uniq_modulos_estudo_content_hash
  ON modulos_estudo (content_hash);
