/**
 * Camada de validação + mapeamento de outcomes FSRS R2.
 * Spec: docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md §5
 */

import { deserializeFsrsMvpCard } from '@/lib/fsrs/cardState';
import { computeSemanticFingerprint } from '@/lib/fsrs/fingerprint';
import type {
  FsrsInvalidStateReason,
  FsrsPersistReviewInput,
  FsrsPersistReviewResult,
  FsrsReviewPersistence,
  FsrsRpcOutcomePayload,
  SpacedReviewCardRow,
} from '@/lib/fsrs/persistenceTypes';
import type { FsrsMvpSerializedCard } from '@/lib/fsrs/types';

export type FsrsPersistRpcClient = {
  persistReviewRpc(args: {
    userId: string;
    attemptId: string;
    reviewUnitId: string;
    reviewUnitKind: string;
    questionId: string;
    attemptContext: string;
    isCorrect: boolean;
    rating: string;
    reviewedAtIso: string;
    expectedRevision: number | null;
    fsrsStateBefore: FsrsMvpSerializedCard | null;
    fsrsStateAfter: FsrsMvpSerializedCard;
    sameStemFallback: boolean;
    semanticFingerprint: string;
  }): Promise<
    | { kind: 'ok'; payload: FsrsRpcOutcomePayload }
    | { kind: 'persistence_failed' }
    | { kind: 'persistence_unknown' }
  >;
  loadCardRow(params: {
    userId: string;
    reviewUnitId: string;
  }): Promise<
    | { kind: 'ok'; row: Record<string, unknown> | null }
    | { kind: 'persistence_failed' }
  >;
};

function isSafeRevision(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1;
}

function validateRevisionPair(
  input: FsrsPersistReviewInput,
): FsrsInvalidStateReason | null {
  const beforeNull = input.serializedBefore === null;
  const revNull = input.expectedRevision === null;
  if (beforeNull !== revNull) {
    return 'revision_before_pair_mismatch';
  }
  if (input.expectedRevision !== null && !isSafeRevision(input.expectedRevision)) {
    return 'unsafe_revision';
  }
  return null;
}

function ratingMatchesCorrect(input: FsrsPersistReviewInput): boolean {
  return (
    (input.rating === 'good' && input.isCorrect === true) ||
    (input.rating === 'again' && input.isCorrect === false)
  );
}

function mapRpcPayload(
  attemptId: string,
  payload: FsrsRpcOutcomePayload,
): FsrsPersistReviewResult {
  switch (payload.outcome) {
    case 'created': {
      const rev = payload.resulting_revision;
      if (typeof rev !== 'number' || !isSafeRevision(rev)) {
        return {
          outcome: 'invalid_state',
          writeStatus: 'none',
          attemptId,
          reason: 'unsafe_revision',
        };
      }
      return {
        outcome: 'created',
        writeStatus: 'committed',
        attemptId,
        resultingRevision: rev,
      };
    }
    case 'duplicate_equivalent': {
      const rev = payload.resulting_revision;
      if (typeof rev !== 'number' || !isSafeRevision(rev)) {
        return {
          outcome: 'invalid_state',
          writeStatus: 'none',
          attemptId,
          reason: 'unsafe_revision',
        };
      }
      return {
        outcome: 'duplicate_equivalent',
        writeStatus: 'none',
        attemptId,
        resultingRevision: rev,
      };
    }
    case 'conflict':
      return { outcome: 'conflict', writeStatus: 'none', attemptId };
    case 'revision_conflict': {
      const cur = payload.current_revision;
      if (typeof cur !== 'number' || !isSafeRevision(cur)) {
        // Card missing → treat as revision_conflict with sentinel 0 mapped carefully.
        // Spec: devolve revision atual; se null (card inexistente no conflito de create),
        // usamos 0 apenas como marcador tipado — callers R3 devem reler.
        return {
          outcome: 'revision_conflict',
          writeStatus: 'none',
          attemptId,
          currentRevision: typeof cur === 'number' && Number.isSafeInteger(cur) ? cur : 0,
        };
      }
      return {
        outcome: 'revision_conflict',
        writeStatus: 'none',
        attemptId,
        currentRevision: cur,
      };
    }
    case 'invalid_state':
      return {
        outcome: 'invalid_state',
        writeStatus: 'none',
        attemptId,
        reason: 'invalid_serialized_after',
      };
    default:
      return { outcome: 'persistence_unknown', writeStatus: 'unknown', attemptId };
  }
}

function parseCardRow(
  row: Record<string, unknown>,
): SpacedReviewCardRow | null {
  try {
    const fsrsState = deserializeFsrsMvpCard(row.fsrs_state);
    const revision = row.revision;
    if (typeof revision !== 'number' || !isSafeRevision(revision)) {
      return null;
    }
    if (typeof row.id !== 'string' || typeof row.user_id !== 'string') {
      return null;
    }
    if (typeof row.review_unit_id !== 'string') return null;
    if (row.review_unit_kind !== 'cluster' && row.review_unit_kind !== 'subtopico') {
      return null;
    }
    return {
      id: row.id,
      user_id: row.user_id,
      review_unit_id: row.review_unit_id,
      review_unit_kind: row.review_unit_kind,
      revision,
      fsrs_state: {
        schemaVersion: 1,
        algorithm: 'ts-fsrs',
        algorithmVersion: '5.4.1',
        due: fsrsState.due,
        stability: fsrsState.stability,
        difficulty: fsrsState.difficulty,
        elapsedDays: fsrsState.elapsedDays,
        scheduledDays: fsrsState.scheduledDays,
        learningSteps: fsrsState.learningSteps,
        reps: fsrsState.reps,
        lapses: fsrsState.lapses,
        state: fsrsState.state,
        lastReview: fsrsState.lastReview,
      },
      due_at: String(row.due_at),
      last_review_at:
        row.last_review_at === null || row.last_review_at === undefined
          ? null
          : String(row.last_review_at),
      stability: Number(row.stability),
      difficulty: Number(row.difficulty),
      reps: Number(row.reps),
      lapses: Number(row.lapses),
      last_rating:
        row.last_rating === 'again' || row.last_rating === 'good'
          ? row.last_rating
          : null,
      last_question_id:
        typeof row.last_question_id === 'string' ? row.last_question_id : null,
      last_attempt_id:
        typeof row.last_attempt_id === 'string' ? row.last_attempt_id : null,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  } catch {
    return null;
  }
}

export function createFsrsReviewPersistence(
  deps: FsrsPersistRpcClient,
): FsrsReviewPersistence {
  return {
    async persistReview(input) {
      const attemptId = input.attemptId;

      try {
        deserializeFsrsMvpCard(input.serializedAfter);
      } catch {
        return {
          outcome: 'invalid_state',
          writeStatus: 'none',
          attemptId,
          reason: 'invalid_serialized_after',
        };
      }

      if (input.serializedBefore !== null) {
        try {
          deserializeFsrsMvpCard(input.serializedBefore);
        } catch {
          return {
            outcome: 'invalid_state',
            writeStatus: 'none',
            attemptId,
            reason: 'invalid_serialized_before',
          };
        }
      }

      if (!ratingMatchesCorrect(input)) {
        return {
          outcome: 'invalid_state',
          writeStatus: 'none',
          attemptId,
          reason: 'rating_correct_mismatch',
        };
      }

      const pairErr = validateRevisionPair(input);
      if (pairErr) {
        return {
          outcome: 'invalid_state',
          writeStatus: 'none',
          attemptId,
          reason: pairErr,
        };
      }

      const semanticFingerprint = computeSemanticFingerprint({
        userId: input.userId,
        reviewUnitId: input.reviewUnitId,
        questionId: input.questionId,
        attemptContext: input.attemptContext,
        isCorrect: input.isCorrect,
        rating: input.rating,
        reviewedAt: input.reviewedAt,
        expectedRevision: input.expectedRevision,
        serializedBefore: input.serializedBefore,
        serializedAfter: input.serializedAfter,
      });

      const rpc = await deps.persistReviewRpc({
        userId: input.userId,
        attemptId: input.attemptId,
        reviewUnitId: input.reviewUnitId,
        reviewUnitKind: input.reviewUnitKind,
        questionId: input.questionId,
        attemptContext: input.attemptContext,
        isCorrect: input.isCorrect,
        rating: input.rating,
        reviewedAtIso: input.reviewedAt.toISOString(),
        expectedRevision: input.expectedRevision,
        fsrsStateBefore: input.serializedBefore,
        fsrsStateAfter: input.serializedAfter,
        sameStemFallback: input.sameStemFallback ?? false,
        semanticFingerprint,
      });

      if (rpc.kind === 'persistence_failed') {
        return { outcome: 'persistence_failed', writeStatus: 'none', attemptId };
      }
      if (rpc.kind === 'persistence_unknown') {
        return { outcome: 'persistence_unknown', writeStatus: 'unknown', attemptId };
      }

      return mapRpcPayload(attemptId, rpc.payload);
    },

    async loadCard({ userId, reviewUnitId }) {
      const res = await deps.loadCardRow({ userId, reviewUnitId });
      if (res.kind === 'persistence_failed') {
        return { ok: false, error: 'persistence_failed' };
      }
      if (res.row === null) {
        return { ok: true, card: null };
      }
      const card = parseCardRow(res.row);
      if (!card) {
        return { ok: false, error: 'invalid_state' };
      }
      return { ok: true, card };
    },
  };
}
