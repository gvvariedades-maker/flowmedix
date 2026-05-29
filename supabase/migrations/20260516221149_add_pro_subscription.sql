-- Freemium AVANT Pro: origem stripe_pro, vitrine geral R$ 9,90, índice de limite diário.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'concurso_matricula_origem'
      AND e.enumlabel = 'stripe_pro'
  ) THEN
    ALTER TYPE public.concurso_matricula_origem ADD VALUE 'stripe_pro';
  END IF;
END $$;

UPDATE public.concursos
SET price_cents = 990
WHERE slug = 'geral';

CREATE INDEX IF NOT EXISTS idx_historico_questoes_user_date
  ON public.historico_questoes (user_id, created_at DESC);;
