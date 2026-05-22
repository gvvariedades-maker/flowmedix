-- Garante exclusão em cascade ao remover usuário do Auth (admin «Excluir conta»).
ALTER TABLE public.historico_questoes
  DROP CONSTRAINT IF EXISTS historico_questoes_user_id_fkey;

ALTER TABLE public.historico_questoes
  ADD CONSTRAINT historico_questoes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
