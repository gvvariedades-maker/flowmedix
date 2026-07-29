/**
 * Canonicalização + semantic_fingerprint (SHA-256) para FSRS R2.
 * Puro e determinístico — sem Date.now(), aleatoriedade ou I/O.
 * Proibido importar lib/evidence/**.
 *
 * Spec: docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md §7
 */

import { createHash } from 'node:crypto';

import type { FsrsMvpSerializedCard } from '@/lib/fsrs/types';
import type { FsrsPersistableContext } from '@/lib/fsrs/persistenceTypes';
import type { FsrsMvpRating } from '@/lib/fsrs/types';

export type FsrsFingerprintInput = {
  userId: string;
  reviewUnitId: string;
  questionId: string;
  attemptContext: FsrsPersistableContext;
  isCorrect: boolean;
  rating: FsrsMvpRating;
  reviewedAt: Date;
  expectedRevision: number | null;
  serializedBefore: FsrsMvpSerializedCard | null;
  serializedAfter: FsrsMvpSerializedCard;
};

/** Normaliza instante para ISO UTC com milissegundos fixos. */
export function normalizeReviewedAtIso(reviewedAt: Date): string {
  if (!(reviewedAt instanceof Date) || Number.isNaN(reviewedAt.getTime())) {
    throw new Error('reviewedAt inválido para fingerprint');
  }
  return reviewedAt.toISOString();
}

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    out[key] = sortKeysDeep(obj[key]);
  }
  return out;
}

/**
 * Representação canônica do conjunto fechado do fingerprint.
 * `null` é distinguível de ausente; expectedRevision null ≠ 0.
 */
export function canonicalizeFingerprintPayload(
  input: FsrsFingerprintInput,
): string {
  const payload = {
    user_id: input.userId,
    review_unit_id: input.reviewUnitId,
    question_id: input.questionId,
    attempt_context: input.attemptContext,
    is_correct: input.isCorrect,
    rating: input.rating,
    reviewed_at: normalizeReviewedAtIso(input.reviewedAt),
    expected_revision: input.expectedRevision,
    fsrs_state_before: input.serializedBefore,
    fsrs_state_after: input.serializedAfter,
  };
  return JSON.stringify(sortKeysDeep(payload));
}

export function computeSemanticFingerprint(input: FsrsFingerprintInput): string {
  const canonical = canonicalizeFingerprintPayload(input);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}
