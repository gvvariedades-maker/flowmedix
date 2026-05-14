-- Comércio por concurso: preço, compras, expiração de matrícula e vitrine pública restrita.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'concurso_matricula_origem'
      AND e.enumlabel = 'purchase'
  ) THEN
    ALTER TYPE public.concurso_matricula_origem ADD VALUE 'purchase';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_purchase_status') THEN
    CREATE TYPE public.concurso_purchase_status AS ENUM ('pending', 'paid', 'refunded');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concurso_matricula_status') THEN
    CREATE TYPE public.concurso_matricula_status AS ENUM ('ativo', 'expirado');
  END IF;
END $$;

ALTER TABLE public.concursos
  ADD COLUMN IF NOT EXISTS price_cents integer,
  ADD COLUMN IF NOT EXISTS data_prova date;

COMMENT ON COLUMN public.concursos.price_cents IS 'Preço em centavos (BRL). NULL ou 0 = não vendável na vitrine.';
COMMENT ON COLUMN public.concursos.data_prova IS 'Data da prova; usada para calcular expires_at da matrícula pós-compra.';

ALTER TABLE public.concurso_matriculas
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS status public.concurso_matricula_status NOT NULL DEFAULT 'ativo';

COMMENT ON COLUMN public.concurso_matriculas.expires_at IS 'Fim do acesso; NULL = sem expiração (legado/admin).';
COMMENT ON COLUMN public.concurso_matriculas.status IS 'ativo | expirado; linhas preservadas para auditoria.';

CREATE INDEX IF NOT EXISTS idx_concurso_matriculas_active
  ON public.concurso_matriculas (user_id, concurso_id)
  WHERE status = 'ativo';

CREATE TABLE IF NOT EXISTS public.concurso_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id uuid NOT NULL REFERENCES public.concursos(id) ON DELETE CASCADE,
  status public.concurso_purchase_status NOT NULL DEFAULT 'pending',
  gateway text NOT NULL DEFAULT 'stripe',
  gateway_payment_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CONSTRAINT concurso_purchases_gateway_payment_unique UNIQUE (gateway, gateway_payment_id),
  CONSTRAINT concurso_purchases_amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_concurso_purchases_user
  ON public.concurso_purchases (user_id);

CREATE INDEX IF NOT EXISTS idx_concurso_purchases_concurso_status
  ON public.concurso_purchases (concurso_id, status);

COMMENT ON TABLE public.concurso_purchases IS 'Compras de acesso a concursos (checkout + webhook).';
COMMENT ON COLUMN public.concurso_purchases.gateway_payment_id IS 'Idempotência do gateway (ex.: Stripe session/payment id).';

ALTER TABLE public.concurso_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own purchases" ON public.concurso_purchases;
CREATE POLICY "Users read own purchases"
  ON public.concurso_purchases FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own pending purchases" ON public.concurso_purchases;
CREATE POLICY "Users insert own pending purchases"
  ON public.concurso_purchases FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Users read enrolled concursos" ON public.concursos;
CREATE POLICY "Users read enrolled concursos"
  ON public.concursos FOR SELECT
  USING (
    status = 'ativo'
    AND EXISTS (
      SELECT 1
      FROM public.concurso_matriculas mat
      WHERE mat.concurso_id = concursos.id
        AND mat.user_id = auth.uid()
        AND mat.status = 'ativo'
        AND (mat.expires_at IS NULL OR mat.expires_at > now())
    )
  );

DROP POLICY IF EXISTS "Public read sellable concursos" ON public.concursos;
CREATE POLICY "Public read sellable concursos"
  ON public.concursos FOR SELECT
  USING (
    status = 'ativo'
    AND price_cents IS NOT NULL
    AND price_cents > 0
  );

DROP POLICY IF EXISTS "Users read enrolled concurso modulos" ON public.concurso_modulos;
CREATE POLICY "Users read enrolled concurso modulos"
  ON public.concurso_modulos FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_matriculas mat
      WHERE mat.concurso_id = concurso_modulos.concurso_id
        AND mat.user_id = auth.uid()
        AND mat.status = 'ativo'
        AND (mat.expires_at IS NULL OR mat.expires_at > now())
    )
  );

DROP POLICY IF EXISTS "Public read sellable concurso modulos" ON public.concurso_modulos;
CREATE POLICY "Public read sellable concurso modulos"
  ON public.concurso_modulos FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concursos c
      WHERE c.id = concurso_modulos.concurso_id
        AND c.status = 'ativo'
        AND c.price_cents IS NOT NULL
        AND c.price_cents > 0
    )
  );

DROP POLICY IF EXISTS "Matriculated users view modulos_estudo" ON public.modulos_estudo;
CREATE POLICY "Matriculated users view modulos_estudo"
  ON public.modulos_estudo FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_modulos cm
      INNER JOIN public.concurso_matriculas mat ON mat.concurso_id = cm.concurso_id
      WHERE cm.modulo_id = modulos_estudo.id
        AND mat.user_id = auth.uid()
        AND mat.status = 'ativo'
        AND (mat.expires_at IS NULL OR mat.expires_at > now())
    )
  );

DROP POLICY IF EXISTS "Public read modulos of sellable concursos" ON public.modulos_estudo;
CREATE POLICY "Public read modulos of sellable concursos"
  ON public.modulos_estudo FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.concurso_modulos cm
      INNER JOIN public.concursos c ON c.id = cm.concurso_id
      WHERE cm.modulo_id = modulos_estudo.id
        AND c.status = 'ativo'
        AND c.price_cents IS NOT NULL
        AND c.price_cents > 0
    )
  );

CREATE OR REPLACE FUNCTION public.fulfill_concurso_purchase(purchase_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $$
DECLARE
  v_purchase public.concurso_purchases%ROWTYPE;
  v_expires_at timestamptz;
BEGIN
  SELECT *
  INTO v_purchase
  FROM public.concurso_purchases
  WHERE id = purchase_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'concurso_purchase not found: %', purchase_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_purchase.status = 'paid' THEN
    RETURN v_purchase.id;
  END IF;

  IF v_purchase.status <> 'pending' THEN
    RAISE EXCEPTION 'concurso_purchase % is not pending (status=%)', purchase_id, v_purchase.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT COALESCE(c.data_prova::timestamptz, now()) + interval '30 days'
  INTO v_expires_at
  FROM public.concursos c
  WHERE c.id = v_purchase.concurso_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'concurso not found for purchase %', purchase_id
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.concurso_purchases
  SET
    status = 'paid',
    paid_at = now()
  WHERE id = purchase_id;

  INSERT INTO public.concurso_matriculas (
    user_id,
    concurso_id,
    origem,
    expires_at,
    status
  )
  VALUES (
    v_purchase.user_id,
    v_purchase.concurso_id,
    'purchase',
    v_expires_at,
    'ativo'
  )
  ON CONFLICT (user_id, concurso_id) DO UPDATE
  SET
    origem = EXCLUDED.origem,
    expires_at = EXCLUDED.expires_at,
    status = 'ativo';

  RETURN purchase_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_concurso_matriculas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.concurso_matriculas
  SET status = 'expirado'
  WHERE status = 'ativo'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_concurso_purchase(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_concurso_matriculas() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fulfill_concurso_purchase(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_concurso_matriculas() TO service_role;

COMMENT ON FUNCTION public.fulfill_concurso_purchase(uuid) IS
  'Marca compra como paid e concede/renova matrícula purchase com expires_at; idempotente se já paid.';
COMMENT ON FUNCTION public.expire_concurso_matriculas() IS
  'Marca matrículas ativas vencidas como expirado; agendar via pg_cron ou rota protegida no app.';
