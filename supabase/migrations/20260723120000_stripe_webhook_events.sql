-- Ledger de idempotência Stripe: um row por event.id (service_role only).
-- Handler: INSERT status=processing → dispatch → UPDATE processed | DELETE se falha retriável.
-- Conflito com status=processing → HTTP 503 (Stripe retry); processed → 200 no-op.

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'processed')),
  processed_at timestamptz,
  payload_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stripe_webhook_events_event_id_nonempty CHECK (char_length(event_id) > 0),
  CONSTRAINT stripe_webhook_events_type_nonempty CHECK (char_length(type) > 0),
  CONSTRAINT stripe_webhook_events_processed_at_when_done CHECK (
    (status = 'processing' AND processed_at IS NULL)
    OR (status = 'processed' AND processed_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.stripe_webhook_events IS
  'Idempotência de webhooks Stripe por event.id. RLS: só service_role (createServerSupabase).';
COMMENT ON COLUMN public.stripe_webhook_events.event_id IS
  'Stripe Event.id (ex.: evt_...); PK — conflito = claim ativo ou já processado.';
COMMENT ON COLUMN public.stripe_webhook_events.type IS
  'Stripe Event.type no momento do claim.';
COMMENT ON COLUMN public.stripe_webhook_events.status IS
  'processing = claim em voo; processed = dispatch concluído (sucesso ou ignorado não-retriável).';
COMMENT ON COLUMN public.stripe_webhook_events.processed_at IS
  'Preenchido ao marcar status=processed.';
COMMENT ON COLUMN public.stripe_webhook_events.payload_hash IS
  'SHA-256 hex opcional do raw body (auditoria; não substitui assinatura Stripe).';

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_status_created
  ON public.stripe_webhook_events (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type
  ON public.stripe_webhook_events (type);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stripe_webhook_events_service_all" ON public.stripe_webhook_events;
CREATE POLICY "stripe_webhook_events_service_all"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON TABLE public.stripe_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.stripe_webhook_events TO service_role;
