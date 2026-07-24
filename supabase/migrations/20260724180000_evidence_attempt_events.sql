-- Evidence Engine Fase 1 — Lote 2: event stream append-only (DDL + RLS + grants).
-- Paralelo a historico_questoes; não substitui o histórico legado.
-- Ingestão runtime / flag / outbox / rotas: fora deste lote (Lotes 3+).
--
-- Decisões fechadas neste lote:
--   * started_at / answered_at nullable (instrumentação parcial + response_time_status)
--   * Sem coluna fingerprint (idempotência = partial unique attempt_id + app)
--   * authenticated: SELECT próprio apenas; INSERT via service_role

CREATE TABLE IF NOT EXISTS public.evidence_attempt_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  question_id text NOT NULL,
  question_version text NOT NULL,
  selected_alternative text NOT NULL,
  correct boolean NOT NULL,
  conviction text NOT NULL,
  context text NOT NULL,
  started_at timestamptz,
  answered_at timestamptz,
  response_time_ms integer,
  response_time_status text NOT NULL,
  response_time_invalid_reason text,
  answer_change_count integer NOT NULL DEFAULT 0,
  session_id uuid,
  source text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  event_type text NOT NULL DEFAULT 'attempt',
  -- Reservadas Fase 2+; nullable; sem comportamento funcional nesta migration
  primary_skill_id text,
  experiment_id uuid,
  arm_assignment_id text,
  measurement_window_assignment_id text,
  holdout_assignment_id text,
  measurement_window text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidence_attempt_events_conviction_check
    CHECK (conviction IN ('chute', 'entre_duas', 'certeza', 'unknown')),
  CONSTRAINT evidence_attempt_events_context_check
    CHECK (context IN ('regular_practice', 'diagnostic', 'simulation')),
  CONSTRAINT evidence_attempt_events_response_time_status_check
    CHECK (response_time_status IN ('valid', 'invalid', 'unknown')),
  CONSTRAINT evidence_attempt_events_source_check
    CHECK (source IN (
      'api_registrar_tentativa',
      'api_simulado_responder',
      'reconcile_backfill'
    )),
  CONSTRAINT evidence_attempt_events_event_type_check
    CHECK (event_type IN ('attempt', 'transfer_inventory_missing')),
  CONSTRAINT evidence_attempt_events_answer_change_count_nonneg
    CHECK (answer_change_count >= 0),
  CONSTRAINT evidence_attempt_events_question_version_sha256
    CHECK (question_version ~ '^[0-9a-f]{64}$')
);

COMMENT ON TABLE public.evidence_attempt_events IS
  'Evidence Engine V1: ledger append-only de tentativas. Paralelo a historico_questoes. '
  'Pedagógico: sem UPDATE/DELETE. Escrita via service_role (API/jobs); authenticated SELECT próprio. '
  'Não ativa flag, rotas, outbox nem domínio.';

COMMENT ON COLUMN public.evidence_attempt_events.attempt_id IS
  'UUID da tentativa física; unique parcial quando event_type = attempt (idempotência).';

COMMENT ON COLUMN public.evidence_attempt_events.question_version IS
  'SHA-256 hex minúsculo 64 chars (canonical_json no servidor). Não recalcular no banco.';

COMMENT ON COLUMN public.evidence_attempt_events.started_at IS
  'Nullable: instrumentação parcial / unknown. Semântica client; created_at é server-side.';

COMMENT ON COLUMN public.evidence_attempt_events.answered_at IS
  'Nullable: instrumentação parcial / unknown. Momento do Confirmar quando presente.';

COMMENT ON COLUMN public.evidence_attempt_events.event_type IS
  'Fase 1 emite attempt. transfer_inventory_missing reservado no CHECK; sem produto nesta fase.';

COMMENT ON COLUMN public.evidence_attempt_events.primary_skill_id IS
  'Reservada fases futuras; nullable; sem comportamento funcional na Fase 1.';

COMMENT ON COLUMN public.evidence_attempt_events.experiment_id IS
  'Reservada fases futuras; nullable; sem comportamento funcional na Fase 1.';

COMMENT ON COLUMN public.evidence_attempt_events.arm_assignment_id IS
  'Reservada fases futuras; nullable; sem comportamento funcional na Fase 1.';

COMMENT ON COLUMN public.evidence_attempt_events.measurement_window_assignment_id IS
  'Reservada fases futuras; nullable; sem comportamento funcional na Fase 1.';

COMMENT ON COLUMN public.evidence_attempt_events.holdout_assignment_id IS
  'Reservada fases futuras; nullable; sem comportamento funcional na Fase 1.';

COMMENT ON COLUMN public.evidence_attempt_events.measurement_window IS
  'Reservada fases futuras; nullable; sem comportamento funcional na Fase 1.';

-- Idempotência canônica (spec §1.1): um evento attempt por attempt_id
CREATE UNIQUE INDEX IF NOT EXISTS evidence_attempt_events_attempt_id_attempt_uidx
  ON public.evidence_attempt_events (attempt_id)
  WHERE event_type = 'attempt';

CREATE INDEX IF NOT EXISTS evidence_attempt_events_user_created_idx
  ON public.evidence_attempt_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS evidence_attempt_events_question_created_idx
  ON public.evidence_attempt_events (question_id, created_at DESC);

CREATE INDEX IF NOT EXISTS evidence_attempt_events_user_question_idx
  ON public.evidence_attempt_events (user_id, question_id);

CREATE INDEX IF NOT EXISTS evidence_attempt_events_session_idx
  ON public.evidence_attempt_events (session_id)
  WHERE session_id IS NOT NULL;

ALTER TABLE public.evidence_attempt_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evidence_attempt_events_owner_select" ON public.evidence_attempt_events;
CREATE POLICY "evidence_attempt_events_owner_select"
  ON public.evidence_attempt_events
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "evidence_attempt_events_service_all" ON public.evidence_attempt_events;
CREATE POLICY "evidence_attempt_events_service_all"
  ON public.evidence_attempt_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON TABLE public.evidence_attempt_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.evidence_attempt_events TO authenticated;
GRANT ALL ON TABLE public.evidence_attempt_events TO service_role;
