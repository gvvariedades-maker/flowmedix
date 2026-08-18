-- FSRS MVP R2: spaced_review_cards + spaced_review_logs + fsrs_persist_review.
-- Spec: docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md
-- Apply ONLY local/CI during the R2 PR — no remote apply in this PR.

-- ---------------------------------------------------------------------------
-- spaced_review_cards
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spaced_review_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  review_unit_id text NOT NULL,
  review_unit_kind text NOT NULL,
  revision bigint NOT NULL,
  fsrs_state jsonb NOT NULL,
  due_at timestamptz NOT NULL,
  last_review_at timestamptz,
  stability double precision NOT NULL,
  difficulty double precision NOT NULL,
  reps integer NOT NULL,
  lapses integer NOT NULL,
  last_rating text,
  last_question_id text,
  last_attempt_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT spaced_review_cards_revision_check CHECK (revision >= 1),
  CONSTRAINT spaced_review_cards_kind_check CHECK (review_unit_kind IN ('cluster', 'subtopico')),
  CONSTRAINT spaced_review_cards_reps_lapses_check CHECK (reps >= 0 AND lapses >= 0),
  CONSTRAINT spaced_review_cards_last_rating_check
    CHECK (last_rating IS NULL OR last_rating IN ('again', 'good')),
  CONSTRAINT spaced_review_cards_fsrs_state_object_check
    CHECK (jsonb_typeof(fsrs_state) = 'object'),
  CONSTRAINT spaced_review_cards_unit_id_check
    CHECK (review_unit_id <> '' AND length(review_unit_id) <= 512),
  CONSTRAINT spaced_review_cards_unit_id_prefix_check
    CHECK (review_unit_id LIKE 'fsrs:v1:%')
);

CREATE UNIQUE INDEX IF NOT EXISTS spaced_review_cards_user_unit_uidx
  ON public.spaced_review_cards (user_id, review_unit_id);

CREATE INDEX IF NOT EXISTS spaced_review_cards_user_due_idx
  ON public.spaced_review_cards (user_id, due_at);

CREATE INDEX IF NOT EXISTS spaced_review_cards_user_updated_idx
  ON public.spaced_review_cards (user_id, updated_at DESC);

COMMENT ON TABLE public.spaced_review_cards IS
  'FSRS MVP: estado atual do card por (user_id, review_unit_id). Escrita somente via fsrs_persist_review.';

-- ---------------------------------------------------------------------------
-- spaced_review_logs (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spaced_review_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  review_unit_id text NOT NULL,
  review_unit_kind text NOT NULL,
  attempt_id uuid NOT NULL,
  question_id text NOT NULL,
  attempt_context text NOT NULL,
  is_correct boolean NOT NULL,
  rating text NOT NULL,
  reviewed_at timestamptz NOT NULL,
  expected_revision bigint,
  resulting_revision bigint NOT NULL,
  scheduled_days integer NOT NULL,
  due_at_before timestamptz,
  due_at_after timestamptz NOT NULL,
  fsrs_state_before jsonb,
  fsrs_state_after jsonb NOT NULL,
  semantic_fingerprint text NOT NULL,
  same_stem_fallback boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT spaced_review_logs_attempt_context_check
    CHECK (attempt_context IN ('cold_practice', 'scheduled_review')),
  CONSTRAINT spaced_review_logs_rating_check CHECK (rating IN ('again', 'good')),
  CONSTRAINT spaced_review_logs_rating_correct_check
    CHECK (
      (rating = 'again' AND is_correct = false)
      OR (rating = 'good' AND is_correct = true)
    ),
  CONSTRAINT spaced_review_logs_resulting_revision_check CHECK (resulting_revision >= 1),
  CONSTRAINT spaced_review_logs_expected_revision_check
    CHECK (expected_revision IS NULL OR expected_revision >= 1),
  CONSTRAINT spaced_review_logs_unit_id_check
    CHECK (review_unit_id <> '' AND length(review_unit_id) <= 512),
  CONSTRAINT spaced_review_logs_kind_check CHECK (review_unit_kind IN ('cluster', 'subtopico')),
  CONSTRAINT spaced_review_logs_scheduled_days_check CHECK (scheduled_days >= 0),
  CONSTRAINT spaced_review_logs_state_after_object_check
    CHECK (jsonb_typeof(fsrs_state_after) = 'object'),
  CONSTRAINT spaced_review_logs_state_before_object_check
    CHECK (fsrs_state_before IS NULL OR jsonb_typeof(fsrs_state_before) = 'object'),
  CONSTRAINT spaced_review_logs_fingerprint_check
    CHECK (semantic_fingerprint ~ '^[0-9a-f]{64}$'),
  CONSTRAINT spaced_review_logs_create_pair_check
    CHECK ((expected_revision IS NULL) = (fsrs_state_before IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS spaced_review_logs_attempt_id_uidx
  ON public.spaced_review_logs (attempt_id);

CREATE INDEX IF NOT EXISTS spaced_review_logs_user_created_idx
  ON public.spaced_review_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS spaced_review_logs_unit_created_idx
  ON public.spaced_review_logs (review_unit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS spaced_review_logs_user_unit_revision_idx
  ON public.spaced_review_logs (user_id, review_unit_id, resulting_revision DESC);

COMMENT ON TABLE public.spaced_review_logs IS
  'FSRS MVP: ledger append-only. Sem UPDATE/DELETE de app; cascade só no ciclo de vida da conta.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.spaced_review_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_review_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spaced_review_cards_owner_select" ON public.spaced_review_cards;
CREATE POLICY "spaced_review_cards_owner_select"
  ON public.spaced_review_cards
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "spaced_review_cards_service_write" ON public.spaced_review_cards;
CREATE POLICY "spaced_review_cards_service_write"
  ON public.spaced_review_cards
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "spaced_review_logs_owner_select" ON public.spaced_review_logs;
CREATE POLICY "spaced_review_logs_owner_select"
  ON public.spaced_review_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "spaced_review_logs_service_insert" ON public.spaced_review_logs;
CREATE POLICY "spaced_review_logs_service_insert"
  ON public.spaced_review_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "spaced_review_logs_service_select" ON public.spaced_review_logs;
CREATE POLICY "spaced_review_logs_service_select"
  ON public.spaced_review_logs
  FOR SELECT
  TO service_role
  USING (true);

REVOKE ALL ON TABLE public.spaced_review_cards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.spaced_review_cards TO authenticated;
GRANT ALL ON TABLE public.spaced_review_cards TO service_role;

REVOKE ALL ON TABLE public.spaced_review_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.spaced_review_logs TO authenticated;
GRANT INSERT, SELECT ON TABLE public.spaced_review_logs TO service_role;

-- ---------------------------------------------------------------------------
-- RPC: fsrs_persist_review (SECURITY INVOKER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fsrs_persist_review(
  p_user_id uuid,
  p_attempt_id uuid,
  p_review_unit_id text,
  p_review_unit_kind text,
  p_question_id text,
  p_attempt_context text,
  p_is_correct boolean,
  p_rating text,
  p_reviewed_at timestamptz,
  p_expected_revision bigint,
  p_fsrs_state_before jsonb,
  p_fsrs_state_after jsonb,
  p_same_stem_fallback boolean,
  p_semantic_fingerprint text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_existing_log public.spaced_review_logs%ROWTYPE;
  v_card public.spaced_review_cards%ROWTYPE;
  v_due_at timestamptz;
  v_last_review_at timestamptz;
  v_stability double precision;
  v_difficulty double precision;
  v_reps integer;
  v_lapses integer;
  v_scheduled_days integer;
  v_due_at_before timestamptz;
  v_resulting_revision bigint;
  v_lock_attempt bigint;
  v_lock_unit bigint;
BEGIN
  -- Step 0: defensive validation (read-only outcomes)
  IF p_user_id IS NULL
     OR p_attempt_id IS NULL
     OR p_review_unit_id IS NULL
     OR p_review_unit_id = ''
     OR length(p_review_unit_id) > 512
     OR p_review_unit_id NOT LIKE 'fsrs:v1:%'
     OR p_review_unit_kind IS NULL
     OR p_review_unit_kind NOT IN ('cluster', 'subtopico')
     OR p_question_id IS NULL
     OR p_question_id = ''
     OR p_attempt_context IS NULL
     OR p_attempt_context NOT IN ('cold_practice', 'scheduled_review')
     OR p_is_correct IS NULL
     OR p_rating IS NULL
     OR p_rating NOT IN ('again', 'good')
     OR NOT (
       (p_rating = 'again' AND p_is_correct = false)
       OR (p_rating = 'good' AND p_is_correct = true)
     )
     OR p_reviewed_at IS NULL
     OR p_fsrs_state_after IS NULL
     OR jsonb_typeof(p_fsrs_state_after) <> 'object'
     OR p_same_stem_fallback IS NULL
     OR p_semantic_fingerprint IS NULL
     OR p_semantic_fingerprint !~ '^[0-9a-f]{64}$'
     OR (p_expected_revision IS NULL) IS DISTINCT FROM (p_fsrs_state_before IS NULL)
     OR (p_expected_revision IS NOT NULL AND p_expected_revision < 1)
     OR (p_fsrs_state_before IS NOT NULL AND jsonb_typeof(p_fsrs_state_before) <> 'object')
  THEN
    RETURN jsonb_build_object('outcome', 'invalid_state');
  END IF;

  IF COALESCE(p_fsrs_state_after ->> 'schemaVersion', '') <> '1'
     OR COALESCE(p_fsrs_state_after ->> 'algorithm', '') <> 'ts-fsrs'
     OR COALESCE(p_fsrs_state_after ->> 'algorithmVersion', '') <> '5.4.1'
  THEN
    RETURN jsonb_build_object('outcome', 'invalid_state');
  END IF;

  BEGIN
    v_due_at := (p_fsrs_state_after ->> 'due')::timestamptz;
    v_stability := (p_fsrs_state_after ->> 'stability')::double precision;
    v_difficulty := (p_fsrs_state_after ->> 'difficulty')::double precision;
    v_reps := (p_fsrs_state_after ->> 'reps')::integer;
    v_lapses := (p_fsrs_state_after ->> 'lapses')::integer;
    v_scheduled_days := (p_fsrs_state_after ->> 'scheduledDays')::integer;
    IF (p_fsrs_state_after ->> 'lastReview') IS NULL
       OR (p_fsrs_state_after ->> 'lastReview') = ''
       OR (p_fsrs_state_after -> 'lastReview') = 'null'::jsonb
    THEN
      v_last_review_at := NULL;
    ELSE
      v_last_review_at := (p_fsrs_state_after ->> 'lastReview')::timestamptz;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object('outcome', 'invalid_state');
  END;

  IF v_due_at IS NULL
     OR v_stability IS NULL
     OR v_difficulty IS NULL
     OR v_reps IS NULL
     OR v_lapses IS NULL
     OR v_reps < 0
     OR v_lapses < 0
     OR v_scheduled_days IS NULL
     OR v_scheduled_days < 0
  THEN
    RETURN jsonb_build_object('outcome', 'invalid_state');
  END IF;

  -- Locks in fixed order: attempt_id then user×unit
  v_lock_attempt := hashtextextended(p_attempt_id::text, 0);
  v_lock_unit := hashtextextended(p_user_id::text || chr(1) || p_review_unit_id, 0);
  PERFORM pg_advisory_xact_lock(v_lock_attempt);
  PERFORM pg_advisory_xact_lock(v_lock_unit);

  SELECT * INTO v_existing_log
  FROM public.spaced_review_logs
  WHERE attempt_id = p_attempt_id;

  IF FOUND THEN
    IF v_existing_log.semantic_fingerprint = p_semantic_fingerprint THEN
      RETURN jsonb_build_object(
        'outcome', 'duplicate_equivalent',
        'resulting_revision', v_existing_log.resulting_revision,
        'attempt_id', p_attempt_id
      );
    END IF;
    RETURN jsonb_build_object(
      'outcome', 'conflict',
      'attempt_id', p_attempt_id
    );
  END IF;

  SELECT * INTO v_card
  FROM public.spaced_review_cards
  WHERE user_id = p_user_id AND review_unit_id = p_review_unit_id
  FOR UPDATE;

  IF p_expected_revision IS NULL THEN
    IF FOUND THEN
      RETURN jsonb_build_object(
        'outcome', 'revision_conflict',
        'current_revision', v_card.revision,
        'attempt_id', p_attempt_id
      );
    END IF;
    v_due_at_before := NULL;
    v_resulting_revision := 1;
  ELSE
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'outcome', 'revision_conflict',
        'current_revision', NULL,
        'attempt_id', p_attempt_id
      );
    END IF;
    IF v_card.revision IS DISTINCT FROM p_expected_revision
       OR v_card.fsrs_state IS DISTINCT FROM p_fsrs_state_before
    THEN
      RETURN jsonb_build_object(
        'outcome', 'revision_conflict',
        'current_revision', v_card.revision,
        'attempt_id', p_attempt_id
      );
    END IF;
    v_due_at_before := v_card.due_at;
    v_resulting_revision := p_expected_revision + 1;
  END IF;

  -- Writes (indivisible)
  INSERT INTO public.spaced_review_logs (
    user_id,
    review_unit_id,
    review_unit_kind,
    attempt_id,
    question_id,
    attempt_context,
    is_correct,
    rating,
    reviewed_at,
    expected_revision,
    resulting_revision,
    scheduled_days,
    due_at_before,
    due_at_after,
    fsrs_state_before,
    fsrs_state_after,
    semantic_fingerprint,
    same_stem_fallback
  ) VALUES (
    p_user_id,
    p_review_unit_id,
    p_review_unit_kind,
    p_attempt_id,
    p_question_id,
    p_attempt_context,
    p_is_correct,
    p_rating,
    p_reviewed_at,
    p_expected_revision,
    v_resulting_revision,
    v_scheduled_days,
    v_due_at_before,
    v_due_at,
    p_fsrs_state_before,
    p_fsrs_state_after,
    p_semantic_fingerprint,
    p_same_stem_fallback
  );

  IF p_expected_revision IS NULL THEN
    INSERT INTO public.spaced_review_cards (
      user_id,
      review_unit_id,
      review_unit_kind,
      revision,
      fsrs_state,
      due_at,
      last_review_at,
      stability,
      difficulty,
      reps,
      lapses,
      last_rating,
      last_question_id,
      last_attempt_id,
      updated_at
    ) VALUES (
      p_user_id,
      p_review_unit_id,
      p_review_unit_kind,
      1,
      p_fsrs_state_after,
      v_due_at,
      v_last_review_at,
      v_stability,
      v_difficulty,
      v_reps,
      v_lapses,
      p_rating,
      p_question_id,
      p_attempt_id,
      now()
    );
  ELSE
    UPDATE public.spaced_review_cards
    SET
      revision = v_resulting_revision,
      fsrs_state = p_fsrs_state_after,
      due_at = v_due_at,
      last_review_at = v_last_review_at,
      stability = v_stability,
      difficulty = v_difficulty,
      reps = v_reps,
      lapses = v_lapses,
      last_rating = p_rating,
      last_question_id = p_question_id,
      last_attempt_id = p_attempt_id,
      review_unit_kind = p_review_unit_kind,
      updated_at = now()
    WHERE id = v_card.id;
  END IF;

  RETURN jsonb_build_object(
    'outcome', 'created',
    'resulting_revision', v_resulting_revision,
    'attempt_id', p_attempt_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fsrs_persist_review(
  uuid, uuid, text, text, text, text, boolean, text, timestamptz, bigint, jsonb, jsonb, boolean, text
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fsrs_persist_review(
  uuid, uuid, text, text, text, text, boolean, text, timestamptz, bigint, jsonb, jsonb, boolean, text
) FROM anon;
REVOKE ALL ON FUNCTION public.fsrs_persist_review(
  uuid, uuid, text, text, text, text, boolean, text, timestamptz, bigint, jsonb, jsonb, boolean, text
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fsrs_persist_review(
  uuid, uuid, text, text, text, text, boolean, text, timestamptz, bigint, jsonb, jsonb, boolean, text
) TO service_role;

COMMENT ON FUNCTION public.fsrs_persist_review IS
  'FSRS MVP R2: atomic card+log persist with CAS, fingerprint idempotency. service_role only.';
