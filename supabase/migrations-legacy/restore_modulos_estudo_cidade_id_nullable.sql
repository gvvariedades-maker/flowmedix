-- Compat: imports / clientes ainda enviam "cidade_id" em POST para modulos_estudo.
-- A coluna foi removida em security_cleanup_public_schema.sql; sem ela, o PostgREST
-- responde: Could not find the 'cidade_id' column ... in the schema cache.
-- Recriamos somente coluna UUID opcional; **sem** FK (tabela cidades foi removida).
-- O app usa ?cidade= na URL; este campo é legado e pode ficar NULL.

ALTER TABLE public.modulos_estudo
  ADD COLUMN IF NOT EXISTS cidade_id uuid NULL;

COMMENT ON COLUMN public.modulos_estudo.cidade_id IS
  'Legado/compat. Opcional. O fluxo do aluno usa query param ?cidade=; imports antigos podem preencher ou NULL.';
