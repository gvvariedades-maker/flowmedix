/**
 * Adapter Supabase para FSRS R2 — chama exclusivamente fsrs_persist_review.
 * Spec: docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md §5.3 / §9.2.1
 */

import 'server-only';

import {
  createFsrsReviewPersistence,
  type FsrsPersistRpcClient,
} from '@/lib/fsrs/persistence';
import type {
  FsrsReviewPersistence,
  FsrsRpcOutcomePayload,
} from '@/lib/fsrs/persistenceTypes';

export type FsrsPostgrestErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  name?: string;
};

export type FsrsSupabaseClientLike = {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): Promise<{ data: unknown; error: FsrsPostgrestErrorLike | null }>;
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          maybeSingle(): Promise<{
            data: unknown;
            error: FsrsPostgrestErrorLike | null;
          }>;
        };
      };
    };
  };
};

const SQL_ROLLBACK_CODES = new Set([
  '23505', // unique
  '23514', // check
  '23503', // fk
  '23502', // not null
  '42501', // insufficient privilege
  '42P01', // undefined table
  '42883', // undefined function
  '22P02', // invalid text representation
  'P0001', // raise exception
]);

function isAbortError(error: FsrsPostgrestErrorLike | null | undefined): boolean {
  if (!error) return false;
  const name = (error.name ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();
  return (
    name === 'aborterror' ||
    message.includes('aborterror') ||
    message.includes('the operation was aborted')
  );
}

function isTimeoutOrTransportAmbiguous(
  error: FsrsPostgrestErrorLike | null | undefined,
): boolean {
  if (!error) return false;
  const message = (error.message ?? '').toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('socket') ||
    message.includes('econnreset') ||
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('failed to fetch') ||
    isAbortError(error)
  );
}

/**
 * Classificação conservadora §9.2.1:
 * - código SQL conhecido de constraint/permissão → persistence_failed
 * - transporte ambíguo / { error } genérico → persistence_unknown
 */
export function classifyFsrsRpcTransportError(
  error: FsrsPostgrestErrorLike | null | undefined,
): 'persistence_failed' | 'persistence_unknown' {
  if (!error) return 'persistence_unknown';
  if (error.code && SQL_ROLLBACK_CODES.has(error.code)) {
    return 'persistence_failed';
  }
  if (isTimeoutOrTransportAmbiguous(error)) {
    return 'persistence_unknown';
  }
  // { error } genérico do supabase-js isoladamente NÃO prova rollback
  return 'persistence_unknown';
}

function isRpcOutcomePayload(value: unknown): value is FsrsRpcOutcomePayload {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return typeof o.outcome === 'string';
}

export function createFsrsPersistRpcClient(
  client: FsrsSupabaseClientLike,
): FsrsPersistRpcClient {
  return {
    async persistReviewRpc(args) {
      let result: { data: unknown; error: FsrsPostgrestErrorLike | null };
      try {
        result = await client.rpc('fsrs_persist_review', {
          p_user_id: args.userId,
          p_attempt_id: args.attemptId,
          p_review_unit_id: args.reviewUnitId,
          p_review_unit_kind: args.reviewUnitKind,
          p_question_id: args.questionId,
          p_attempt_context: args.attemptContext,
          p_is_correct: args.isCorrect,
          p_rating: args.rating,
          p_reviewed_at: args.reviewedAtIso,
          p_expected_revision: args.expectedRevision,
          p_fsrs_state_before: args.fsrsStateBefore,
          p_fsrs_state_after: args.fsrsStateAfter,
          p_same_stem_fallback: args.sameStemFallback,
          p_semantic_fingerprint: args.semanticFingerprint,
        });
      } catch (err) {
        const like: FsrsPostgrestErrorLike =
          err && typeof err === 'object'
            ? {
                message: err instanceof Error ? err.message : String(err),
                name: err instanceof Error ? err.name : undefined,
              }
            : { message: String(err) };
        const kind = classifyFsrsRpcTransportError(like);
        return { kind };
      }

      if (result.error) {
        const kind = classifyFsrsRpcTransportError(result.error);
        return { kind };
      }

      if (!isRpcOutcomePayload(result.data)) {
        return { kind: 'persistence_unknown' };
      }

      return { kind: 'ok', payload: result.data };
    },

    async loadCardRow({ userId, reviewUnitId }) {
      try {
        const { data, error } = await client
          .from('spaced_review_cards')
          .select('*')
          .eq('user_id', userId)
          .eq('review_unit_id', reviewUnitId)
          .maybeSingle();

        if (error) {
          // SELECT failures with SQL codes → failed; ambiguous → treat as failed for load
          if (error.code && SQL_ROLLBACK_CODES.has(error.code)) {
            return { kind: 'persistence_failed' };
          }
          return { kind: 'persistence_failed' };
        }

        if (data === null || data === undefined) {
          return { kind: 'ok', row: null };
        }
        if (typeof data !== 'object') {
          return { kind: 'persistence_failed' };
        }
        return { kind: 'ok', row: data as Record<string, unknown> };
      } catch {
        return { kind: 'persistence_failed' };
      }
    },
  };
}

export function createSupabaseFsrsPersistence(
  client: FsrsSupabaseClientLike,
): FsrsReviewPersistence {
  return createFsrsReviewPersistence(createFsrsPersistRpcClient(client));
}
