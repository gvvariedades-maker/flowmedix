/**
 * @jest-environment node
 */
import { applyFsrsReview } from '@/lib/fsrs/applyReview';
import type { FsrsReviewPersistence } from '@/lib/fsrs/persistenceTypes';

describe('applyFsrsReview', () => {
  it('inelegível (contexto) — na prática cold_practice é elegível; unit inválida retorna unit_unresolved', async () => {
    const persistence: FsrsReviewPersistence = {
      persistReview: jest.fn(),
      loadCard: jest.fn().mockResolvedValue({ ok: true, card: null }),
    };
    const res = await applyFsrsReview({
      userId: 'u1',
      attemptId: 'a1',
      questionId: 'q1',
      isCorrect: true,
      discipline: '',
      subtopico: null,
      fromScheduledReview: false,
      persistence,
    });
    expect(res.applied).toBe(false);
    if (!res.applied) {
      expect(res.reason).toBe('unit_unresolved');
    }
  });

  it('cria card quando load vazio e persist created', async () => {
    const persistReview = jest.fn().mockResolvedValue({
      outcome: 'created',
      writeStatus: 'committed',
      attemptId: 'a1',
      resultingRevision: 1,
    });
    const persistence: FsrsReviewPersistence = {
      persistReview,
      loadCard: jest.fn().mockResolvedValue({ ok: true, card: null }),
    };
    const res = await applyFsrsReview({
      userId: '11111111-1111-1111-1111-111111111111',
      attemptId: '22222222-2222-2222-2222-222222222222',
      questionId: 'slug',
      isCorrect: true,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      fromScheduledReview: false,
      reviewedAt: new Date('2026-07-01T12:00:00.000Z'),
      persistence,
    });
    expect(res).toEqual({
      applied: true,
      outcome: 'created',
      writeStatus: 'committed',
    });
    expect(persistReview).toHaveBeenCalledWith(
      expect.objectContaining({ sameStemFallback: false }),
    );
  });

  it('propaga sameStemFallback true em scheduled_review', async () => {
    const persistReview = jest.fn().mockResolvedValue({
      outcome: 'created',
      writeStatus: 'committed',
      attemptId: 'a1',
      resultingRevision: 1,
    });
    const persistence: FsrsReviewPersistence = {
      persistReview,
      loadCard: jest.fn().mockResolvedValue({ ok: true, card: null }),
    };
    const res = await applyFsrsReview({
      userId: '11111111-1111-1111-1111-111111111111',
      attemptId: '22222222-2222-2222-2222-222222222222',
      questionId: 'slug',
      isCorrect: true,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      fromScheduledReview: true,
      sameStemFallback: true,
      reviewedAt: new Date('2026-07-01T12:00:00.000Z'),
      persistence,
    });
    expect(res.applied).toBe(true);
    expect(persistReview).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptContext: 'scheduled_review',
        sameStemFallback: true,
      }),
    );
  });
});
