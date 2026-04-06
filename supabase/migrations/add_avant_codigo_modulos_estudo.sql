-- Código numérico único por questão (ex.: Q-1847 na UI) para localizar no admin.
-- Novas linhas recebem valor automático via sequence.

ALTER TABLE modulos_estudo ADD COLUMN IF NOT EXISTS avant_codigo integer;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
  FROM modulos_estudo
  WHERE avant_codigo IS NULL
)
UPDATE modulos_estudo m
SET avant_codigo = numbered.rn
FROM numbered
WHERE m.id = numbered.id;

CREATE SEQUENCE IF NOT EXISTS modulos_estudo_avant_codigo_seq;

SELECT setval(
  'modulos_estudo_avant_codigo_seq',
  GREATEST(COALESCE((SELECT MAX(avant_codigo) FROM modulos_estudo), 0), 0)
);

ALTER TABLE modulos_estudo
  ALTER COLUMN avant_codigo SET DEFAULT nextval('modulos_estudo_avant_codigo_seq');

ALTER SEQUENCE modulos_estudo_avant_codigo_seq OWNED BY modulos_estudo.avant_codigo;

ALTER TABLE modulos_estudo ALTER COLUMN avant_codigo SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_modulos_estudo_avant_codigo ON modulos_estudo (avant_codigo);

COMMENT ON COLUMN modulos_estudo.avant_codigo IS 'Identificador estável de exibição no admin (sequência); usar como Q-{valor} na interface.';
