-- C5: remove FSRS MVP tables + RPC after product discontinuation.
-- Does NOT delete 20260728040000_spaced_review_fsrs_mvp.sql (already applied).
-- Apply ONLY after: backup verified + human authorization.
-- @see docs/DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md
-- @see artifacts/c5-spaced-review-drop-runbook.md

DROP FUNCTION IF EXISTS public.fsrs_persist_review(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  boolean,
  text,
  timestamptz,
  bigint,
  jsonb,
  jsonb,
  boolean,
  text
);

DROP TABLE IF EXISTS public.spaced_review_logs;
DROP TABLE IF EXISTS public.spaced_review_cards;
