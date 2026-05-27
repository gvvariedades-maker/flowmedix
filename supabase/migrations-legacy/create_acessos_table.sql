-- Acessos a produtos avulsos (ex.: pacote Campina Grande) após checkout Stripe.

CREATE TABLE IF NOT EXISTS public.acessos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produto text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  stripe_checkout_session_id text,
  CONSTRAINT acessos_stripe_session_unique UNIQUE (stripe_checkout_session_id),
  CONSTRAINT acessos_user_produto_unique UNIQUE (user_id, produto)
);

CREATE INDEX IF NOT EXISTS idx_acessos_user_id ON public.acessos (user_id);
CREATE INDEX IF NOT EXISTS idx_acessos_produto ON public.acessos (produto);

COMMENT ON TABLE public.acessos IS 'Registros de acesso a produtos (checkout avulso, webhook Stripe).';
COMMENT ON COLUMN public.acessos.produto IS 'Identificador do produto (ex.: campina-grande).';
COMMENT ON COLUMN public.acessos.stripe_checkout_session_id IS 'Idempotência do webhook checkout.session.completed.';

ALTER TABLE public.acessos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own acessos" ON public.acessos;
CREATE POLICY "Users read own acessos"
  ON public.acessos FOR SELECT
  USING (auth.uid() = user_id);
