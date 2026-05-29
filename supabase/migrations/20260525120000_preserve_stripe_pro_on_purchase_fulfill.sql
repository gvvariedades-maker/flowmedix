-- Preserva matrícula stripe_pro quando compra avulsa conflita no mesmo (user_id, concurso_id).

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
    status = CASE
      WHEN concurso_matriculas.origem = 'stripe_pro' THEN concurso_matriculas.status
      ELSE EXCLUDED.status
    END,
    origem = CASE
      WHEN concurso_matriculas.origem = 'stripe_pro' THEN 'stripe_pro'
      ELSE EXCLUDED.origem
    END,
    expires_at = CASE
      WHEN concurso_matriculas.origem = 'stripe_pro' THEN concurso_matriculas.expires_at
      ELSE EXCLUDED.expires_at
    END;

  RETURN purchase_id;
END;
$$;
COMMENT ON FUNCTION public.fulfill_concurso_purchase(uuid) IS
  'Marca compra como paid e concede/renova matrícula purchase com expires_at; idempotente se já paid. Compra avulsa não rebaixa matrícula stripe_pro existente.';
