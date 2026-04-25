-- Correção de avisos do Security Advisor (RLS + objetos legados fora do código AVANT).
-- Executar no SQL Editor do Supabase do projeto AVANT.
--
-- 1) View legada: expõe auth.users / SECURITY DEFINER (não referenciada no app).
-- 2) Tabela(s) de cidades: não há .from('cidades') no código; cidade é só query param na URL.
-- 3) modulos_estudo: RLS com SELECT público (catálogo); escrita via service role nas APIs.

-- ── Views legadas (nomes possíveis no painel / Postgres) ─────────────────────
DROP VIEW IF EXISTS public."perfis_de_usuario_públicos";
DROP VIEW IF EXISTS public.perfis_de_usuario_publicos;

-- ── Cidades: remove FK/coluna em modulos_estudo, depois tabelas ─────────────
ALTER TABLE public.modulos_estudo DROP COLUMN IF EXISTS cidade_id;

DROP TABLE IF EXISTS public.cidades CASCADE;
DROP TABLE IF EXISTS public.cidades_publicas CASCADE;
DROP TABLE IF EXISTS public."cidades públicas" CASCADE;

-- ── RLS em modulos_estudo ───────────────────────────────────────────────────
ALTER TABLE public.modulos_estudo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view modulos_estudo" ON public.modulos_estudo;

CREATE POLICY "Anyone can view modulos_estudo"
  ON public.modulos_estudo FOR SELECT
  USING (true);
