/**
 * @jest-environment node
 *
 * FSRS R2 — persistence unit tests (mocked RPC client).
 */
import { createHash } from 'node:crypto';

import {
  createFsrsScheduler,
  createFsrsReviewPersistence,
  computeSemanticFingerprint,
  serializeFsrsMvpCard,
  type FsrsPersistRpcClient,
  type FsrsPersistReviewInput,
  type FsrsMvpSerializedCard,
} from '@/lib/fsrs';
import { classifyFsrsRpcTransportError } from '@/lib/fsrs/supabasePersistence';

const T0 = new Date('2026-07-01T15:00:00.000Z');

function sampleAfter(): FsrsMvpSerializedCard {
  const scheduler = createFsrsScheduler();
  const initial = scheduler.createInitialCard(T0);
  const out = scheduler.review({
    card: initial,
    rating: 'good',
    reviewedAt: T0,
  });
  return serializeFsrsMvpCard(out.card);
}

function baseInput(
  overrides: Partial<FsrsPersistReviewInput> = {},
): FsrsPersistReviewInput {
  const after = sampleAfter();
  return {
    userId: '11111111-1111-1111-1111-111111111111',
    attemptId: '22222222-2222-2222-2222-222222222222',
    reviewUnitId: 'fsrs:v1:discipline=enfermagem:subtopico=imuniza%C3%A7%C3%A3o',
    reviewUnitKind: 'subtopico',
    questionId: 'questao-slug-exemplo',
    attemptContext: 'cold_practice',
    isCorrect: true,
    rating: 'good',
    reviewedAt: T0,
    expectedRevision: null,
    serializedBefore: null,
    serializedAfter: after,
    sameStemFallback: false,
    ...overrides,
  };
}

describe('computeSemanticFingerprint', () => {
  it('é determinístico para a mesma entrada', () => {
    const input = baseInput();
    const a = computeSemanticFingerprint({
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
    const b = computeSemanticFingerprint({
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
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('trocar só attempt_id não muda o fingerprint (attempt_id fora do conjunto)', () => {
    const input = baseInput();
    const fpArgs = {
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
    };
    expect(computeSemanticFingerprint(fpArgs)).toBe(
      computeSemanticFingerprint(fpArgs),
    );
  });

  it('mudar reviewed_at muda o hash', () => {
    const input = baseInput();
    const a = computeSemanticFingerprint({
      userId: input.userId,
      reviewUnitId: input.reviewUnitId,
      questionId: input.questionId,
      attemptContext: input.attemptContext,
      isCorrect: input.isCorrect,
      rating: input.rating,
      reviewedAt: T0,
      expectedRevision: null,
      serializedBefore: null,
      serializedAfter: input.serializedAfter,
    });
    const b = computeSemanticFingerprint({
      userId: input.userId,
      reviewUnitId: input.reviewUnitId,
      questionId: input.questionId,
      attemptContext: input.attemptContext,
      isCorrect: input.isCorrect,
      rating: input.rating,
      reviewedAt: new Date('2026-07-01T15:00:00.001Z'),
      expectedRevision: null,
      serializedBefore: null,
      serializedAfter: input.serializedAfter,
    });
    expect(a).not.toBe(b);
  });

  it('usa sha256 hex minúsculo', () => {
    const input = baseInput();
    const fp = computeSemanticFingerprint({
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
    expect(createHash('sha256').update('x').digest('hex')).toHaveLength(64);
    expect(fp).toHaveLength(64);
  });
});

describe('createFsrsReviewPersistence', () => {
  it('state_after inválido → invalid_state sem chamar RPC', async () => {
    const rpc = jest.fn();
    const client: FsrsPersistRpcClient = {
      persistReviewRpc: rpc,
      loadCardRow: jest.fn(),
    };
    const persistence = createFsrsReviewPersistence(client);
    const bad = {
      ...sampleAfter(),
      schemaVersion: 99 as 1,
    };
    const res = await persistence.persistReview(
      baseInput({ serializedAfter: bad }),
    );
    expect(res.outcome).toBe('invalid_state');
    expect(res.writeStatus).toBe('none');
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rating incoerente com isCorrect → invalid_state', async () => {
    const rpc = jest.fn();
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: rpc,
      loadCardRow: jest.fn(),
    });
    const res = await persistence.persistReview(
      baseInput({ isCorrect: false, rating: 'good' }),
    );
    expect(res).toMatchObject({
      outcome: 'invalid_state',
      reason: 'rating_correct_mismatch',
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('expectedRevision sem serializedBefore → invalid_state', async () => {
    const rpc = jest.fn();
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: rpc,
      loadCardRow: jest.fn(),
    });
    const res = await persistence.persistReview(
      baseInput({ expectedRevision: 1, serializedBefore: null }),
    );
    expect(res).toMatchObject({
      outcome: 'invalid_state',
      reason: 'revision_before_pair_mismatch',
    });
  });

  it('mapeia created → writeStatus committed', async () => {
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: async () => ({
        kind: 'ok',
        payload: { outcome: 'created', resulting_revision: 1 },
      }),
      loadCardRow: jest.fn(),
    });
    const res = await persistence.persistReview(baseInput());
    expect(res).toEqual({
      outcome: 'created',
      writeStatus: 'committed',
      attemptId: baseInput().attemptId,
      resultingRevision: 1,
    });
  });

  it('mapeia duplicate_equivalent → writeStatus none', async () => {
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: async () => ({
        kind: 'ok',
        payload: { outcome: 'duplicate_equivalent', resulting_revision: 3 },
      }),
      loadCardRow: jest.fn(),
    });
    const res = await persistence.persistReview(baseInput());
    expect(res).toEqual({
      outcome: 'duplicate_equivalent',
      writeStatus: 'none',
      attemptId: baseInput().attemptId,
      resultingRevision: 3,
    });
  });

  it('persistence_unknown do transporte', async () => {
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: async () => ({ kind: 'persistence_unknown' }),
      loadCardRow: jest.fn(),
    });
    const res = await persistence.persistReview(baseInput());
    expect(res).toEqual({
      outcome: 'persistence_unknown',
      writeStatus: 'unknown',
      attemptId: baseInput().attemptId,
    });
  });

  it('persistence_failed com prova SQL', async () => {
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: async () => ({ kind: 'persistence_failed' }),
      loadCardRow: jest.fn(),
    });
    const res = await persistence.persistReview(baseInput());
    expect(res).toEqual({
      outcome: 'persistence_failed',
      writeStatus: 'none',
      attemptId: baseInput().attemptId,
    });
  });

  it('propriedade extra no payload → invalid_state', async () => {
    const rpc = jest.fn();
    const persistence = createFsrsReviewPersistence({
      persistReviewRpc: rpc,
      loadCardRow: jest.fn(),
    });
    const after = { ...sampleAfter(), extraField: true } as FsrsMvpSerializedCard;
    const res = await persistence.persistReview(
      baseInput({ serializedAfter: after }),
    );
    expect(res.outcome).toBe('invalid_state');
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('classifyFsrsRpcTransportError', () => {
  it('código SQL de constraint → persistence_failed', () => {
    expect(classifyFsrsRpcTransportError({ code: '23505', message: 'duplicate' })).toBe(
      'persistence_failed',
    );
    expect(classifyFsrsRpcTransportError({ code: '42501', message: 'permission' })).toBe(
      'persistence_failed',
    );
  });

  it('timeout / AbortError / socket → persistence_unknown', () => {
    expect(
      classifyFsrsRpcTransportError({ message: 'Timeout waiting for response' }),
    ).toBe('persistence_unknown');
    expect(
      classifyFsrsRpcTransportError({ name: 'AbortError', message: 'aborted' }),
    ).toBe('persistence_unknown');
    expect(
      classifyFsrsRpcTransportError({ message: 'socket hang up / ECONNRESET' }),
    ).toBe('persistence_unknown');
  });

  it('{ error } genérico sem código → persistence_unknown', () => {
    expect(classifyFsrsRpcTransportError({ message: 'something went wrong' })).toBe(
      'persistence_unknown',
    );
  });
});
