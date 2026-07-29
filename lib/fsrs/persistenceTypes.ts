/**
 * Contratos de persistência FSRS MVP (R2).
 * Resultados estruturados — adapters não lançam para outcomes esperados.
 *
 * Spec: docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md
 */

import type {
  FsrsAttemptContext,
  FsrsMvpRating,
  FsrsMvpReviewUnitKind,
  FsrsMvpSerializedCard,
} from '@/lib/fsrs/types';

export type SpacedReviewCardRow = {
  id: string;
  user_id: string;
  review_unit_id: string;
  review_unit_kind: FsrsMvpReviewUnitKind;
  revision: number;
  fsrs_state: FsrsMvpSerializedCard;
  due_at: string;
  last_review_at: string | null;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  last_rating: FsrsMvpRating | null;
  last_question_id: string | null;
  last_attempt_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SpacedReviewLogRow = {
  id: string;
  user_id: string;
  review_unit_id: string;
  review_unit_kind: FsrsMvpReviewUnitKind;
  attempt_id: string;
  question_id: string;
  attempt_context: FsrsPersistableContext;
  is_correct: boolean;
  rating: FsrsMvpRating;
  reviewed_at: string;
  expected_revision: number | null;
  resulting_revision: number;
  scheduled_days: number;
  due_at_before: string | null;
  due_at_after: string;
  fsrs_state_before: FsrsMvpSerializedCard | null;
  fsrs_state_after: FsrsMvpSerializedCard;
  semantic_fingerprint: string;
  same_stem_fallback: boolean;
  created_at: string;
};

/** Subconjunto elegível de FsrsAttemptContext. */
export type FsrsPersistableContext = Extract<
  FsrsAttemptContext,
  'cold_practice' | 'scheduled_review'
>;

export type FsrsPersistReviewInput = {
  userId: string;
  attemptId: string;
  reviewUnitId: string;
  reviewUnitKind: FsrsMvpReviewUnitKind;
  questionId: string;
  attemptContext: FsrsPersistableContext;
  isCorrect: boolean;
  rating: FsrsMvpRating;
  reviewedAt: Date;
  expectedRevision: number | null;
  serializedBefore: FsrsMvpSerializedCard | null;
  serializedAfter: FsrsMvpSerializedCard;
  sameStemFallback?: boolean;
};

export type FsrsWriteStatus = 'none' | 'committed' | 'unknown';

export type FsrsInvalidStateReason =
  | 'invalid_serialized_after'
  | 'invalid_serialized_before'
  | 'rating_correct_mismatch'
  | 'revision_before_pair_mismatch'
  | 'unsafe_revision'
  | 'returned_state_invalid';

export type FsrsPersistReviewResult =
  | {
      outcome: 'created';
      writeStatus: 'committed';
      attemptId: string;
      resultingRevision: number;
    }
  | {
      outcome: 'duplicate_equivalent';
      writeStatus: 'none';
      attemptId: string;
      resultingRevision: number;
    }
  | { outcome: 'conflict'; writeStatus: 'none'; attemptId: string }
  | {
      outcome: 'revision_conflict';
      writeStatus: 'none';
      attemptId: string;
      currentRevision: number;
    }
  | {
      outcome: 'invalid_state';
      writeStatus: 'none';
      attemptId: string;
      reason: FsrsInvalidStateReason;
    }
  | { outcome: 'persistence_failed'; writeStatus: 'none'; attemptId: string }
  | { outcome: 'persistence_unknown'; writeStatus: 'unknown'; attemptId: string };

export type FsrsReviewPersistence = {
  persistReview(input: FsrsPersistReviewInput): Promise<FsrsPersistReviewResult>;
  loadCard(params: {
    userId: string;
    reviewUnitId: string;
  }): Promise<
    | { ok: true; card: SpacedReviewCardRow | null }
    | { ok: false; error: 'persistence_failed' | 'invalid_state' }
  >;
};

export type FsrsRpcOutcomePayload = {
  outcome: string;
  resulting_revision?: number;
  current_revision?: number | null;
  attempt_id?: string;
};
