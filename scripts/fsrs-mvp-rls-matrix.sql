-- FSRS MVP R2 — matriz RLS §12.D
-- Spec: docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md §11.3 / §12.D
-- Executar contra banco local após `supabase db reset --local`:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f scripts/fsrs-mvp-rls-matrix.sql
--   (CI: job fsrs-rpc-integration)
--
-- Evita assinar JWT: usa SET LOCAL ROLE + set_config de claims.

\set ON_ERROR_STOP on

DO $$
DECLARE
  v_owner uuid := gen_random_uuid();
  v_other uuid := gen_random_uuid();
  v_attempt uuid := gen_random_uuid();
  v_run text := replace(gen_random_uuid()::text, '-', '');
  v_unit text := 'fsrs:v1:discipline=enfermagem:subtopico=rls-matrix-' || v_run;
  v_state jsonb := jsonb_build_object(
    'schemaVersion', 1,
    'algorithm', 'ts-fsrs',
    'algorithmVersion', '5.4.1',
    'due', '2026-07-20T12:00:00.000Z',
    'stability', 1.5,
    'difficulty', 5.0,
    'elapsedDays', 0,
    'scheduledDays', 1,
    'learningSteps', 0,
    'reps', 1,
    'lapses', 0,
    'state', 'Review',
    'lastReview', '2026-07-19T12:00:00.000Z'
  );
  -- Fingerprint válido (64 hex); conteúdo semântico irrelevante para a matriz RLS
  v_fp text := rpad(replace(v_run, '-', ''), 64, 'a');
  v_rpc jsonb;
  v_cnt integer;
  v_err_code text;
BEGIN
  -- Seed auth.users (mínimo local Supabase / GoTrue)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES
    (
      '00000000-0000-0000-0000-000000000000',
      v_owner,
      'authenticated',
      'authenticated',
      'fsrs-rls-owner-' || v_run || '@example.com',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      v_other,
      'authenticated',
      'authenticated',
      'fsrs-rls-other-' || v_run || '@example.com',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

  -- Seed card do owner via RPC (superuser / bypass RLS)
  v_rpc := public.fsrs_persist_review(
    v_owner,
    v_attempt,
    v_unit,
    'subtopico',
    'slug-rls-seed',
    'cold_practice',
    true,
    'good',
    timestamptz '2026-07-19T12:00:00.000Z',
    NULL,
    NULL,
    v_state,
    false,
    v_fp
  );
  IF v_rpc ->> 'outcome' IS DISTINCT FROM 'created' THEN
    RAISE EXCEPTION 'seed RPC expected created, got %', v_rpc;
  END IF;

  -- 1) anon EXECUTE → 42501
  BEGIN
    EXECUTE 'SET LOCAL ROLE anon';
    BEGIN
      PERFORM public.fsrs_persist_review(
        v_owner, gen_random_uuid(), v_unit, 'subtopico', 'slug-anon',
        'cold_practice', true, 'good', now(), NULL, NULL, v_state, false, v_fp
      );
      RAISE EXCEPTION 'anon EXECUTE should fail with 42501';
    EXCEPTION
      WHEN insufficient_privilege THEN
        NULL;
      WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_err_code = RETURNED_SQLSTATE;
        IF v_err_code = '42501' THEN
          NULL;
        ELSE
          RAISE;
        END IF;
    END;
    EXECUTE 'RESET ROLE';
  END;

  -- 2) authenticated EXECUTE → 42501
  BEGIN
    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', v_other::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    PERFORM set_config(
      'request.jwt.claims',
      json_build_object('sub', v_other::text, 'role', 'authenticated')::text,
      true
    );
    BEGIN
      PERFORM public.fsrs_persist_review(
        v_owner, gen_random_uuid(), v_unit, 'subtopico', 'slug-auth',
        'cold_practice', true, 'good', now(), NULL, NULL, v_state, false, v_fp
      );
      RAISE EXCEPTION 'authenticated EXECUTE should fail with 42501';
    EXCEPTION
      WHEN insufficient_privilege THEN
        NULL;
      WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_err_code = RETURNED_SQLSTATE;
        IF v_err_code = '42501' THEN
          NULL;
        ELSE
          RAISE;
        END IF;
    END;
    EXECUTE 'RESET ROLE';
  END;

  -- 3) authenticated (other) SELECT owner rows → 0
  BEGIN
    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', v_other::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    PERFORM set_config(
      'request.jwt.claims',
      json_build_object('sub', v_other::text, 'role', 'authenticated')::text,
      true
    );
    SELECT count(*)::integer INTO v_cnt
    FROM public.spaced_review_cards
    WHERE user_id = v_owner;
    IF v_cnt <> 0 THEN
      RAISE EXCEPTION 'cross-user SELECT cards expected 0, got %', v_cnt;
    END IF;
    SELECT count(*)::integer INTO v_cnt
    FROM public.spaced_review_logs
    WHERE user_id = v_owner;
    IF v_cnt <> 0 THEN
      RAISE EXCEPTION 'cross-user SELECT logs expected 0, got %', v_cnt;
    END IF;
    EXECUTE 'RESET ROLE';
  END;

  -- 4) authenticated (owner) SELECT own → >= 1
  BEGIN
    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', v_owner::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    PERFORM set_config(
      'request.jwt.claims',
      json_build_object('sub', v_owner::text, 'role', 'authenticated')::text,
      true
    );
    SELECT count(*)::integer INTO v_cnt
    FROM public.spaced_review_cards
    WHERE user_id = v_owner;
    IF v_cnt < 1 THEN
      RAISE EXCEPTION 'owner SELECT cards expected >=1, got %', v_cnt;
    END IF;
    EXECUTE 'RESET ROLE';
  END;

  -- 5) authenticated WRITE negado
  BEGIN
    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', v_owner::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    BEGIN
      INSERT INTO public.spaced_review_cards (
        user_id, review_unit_id, review_unit_kind, revision, fsrs_state,
        due_at, stability, difficulty, reps, lapses
      ) VALUES (
        v_owner, v_unit || '-write', 'subtopico', 1, v_state,
        now(), 1, 5, 0, 0
      );
      RAISE EXCEPTION 'authenticated INSERT cards should fail';
    EXCEPTION
      WHEN insufficient_privilege THEN
        NULL;
      WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_err_code = RETURNED_SQLSTATE;
        IF v_err_code IN ('42501', '42503') THEN
          NULL;
        ELSE
          RAISE;
        END IF;
    END;
    BEGIN
      UPDATE public.spaced_review_logs SET question_id = 'tamper' WHERE attempt_id = v_attempt;
      RAISE EXCEPTION 'UPDATE logs should fail';
    EXCEPTION
      WHEN insufficient_privilege THEN
        NULL;
      WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_err_code = RETURNED_SQLSTATE;
        IF v_err_code IN ('42501', '42503') THEN
          NULL;
        ELSE
          RAISE;
        END IF;
    END;
    EXECUTE 'RESET ROLE';
  END;

  RAISE NOTICE 'FSRS RLS matrix §12.D PASS (run=%)', v_run;
END $$;
