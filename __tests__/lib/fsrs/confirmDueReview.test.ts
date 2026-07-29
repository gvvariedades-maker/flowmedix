/**
 * @jest-environment node
 */
import {
  confirmDueScheduledReview,
  parseFromRevisoesIntention,
  type ConfirmDueReviewClient,
} from '@/lib/fsrs/confirmDueReview';
import { resolveReviewUnitId } from '@/lib/fsrs/reviewUnit';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const SLUG = 'questao-imunizacao-1';
const OTHER_SLUG = 'questao-imunizacao-2';

const unit = resolveReviewUnitId({
  discipline: 'Enfermagem',
  subtopico: 'Imunização',
});
if (!unit.ok) {
  throw new Error('fixture unit must resolve');
}

function clientWithCard(row: Record<string, unknown> | null, error: { message?: string } | null = null): ConfirmDueReviewClient {
  return {
    from(table: string) {
      expect(table).toBe('spaced_review_cards');
      return {
        select() {
          return {
            eq() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({ data: row, error }),
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

describe('parseFromRevisoesIntention', () => {
  it('aceita true / "1" / "true"', () => {
    expect(parseFromRevisoesIntention({ from_revisoes: true })).toBe(true);
    expect(parseFromRevisoesIntention({ from_revisoes: '1' })).toBe(true);
    expect(parseFromRevisoesIntention({ from_revisoes: 'true' })).toBe(true);
  });

  it('rejeita ausência e valores inválidos', () => {
    expect(parseFromRevisoesIntention({})).toBe(false);
    expect(parseFromRevisoesIntention({ from_revisoes: false })).toBe(false);
    expect(parseFromRevisoesIntention({ from_revisoes: 'yes' })).toBe(false);
  });
});

describe('confirmDueScheduledReview', () => {
  const now = new Date('2026-07-29T12:00:00.000Z');

  it('unit_unresolved quando subtópico genérico', async () => {
    const res = await confirmDueScheduledReview({
      client: clientWithCard(null),
      userId: USER_ID,
      questionId: SLUG,
      discipline: 'Enfermagem',
      subtopico: 'Geral',
      now,
    });
    expect(res).toEqual({ confirmed: false, reason: 'unit_unresolved' });
  });

  it('card_missing quando não há linha', async () => {
    const res = await confirmDueScheduledReview({
      client: clientWithCard(null),
      userId: USER_ID,
      questionId: SLUG,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      now,
    });
    expect(res).toEqual({ confirmed: false, reason: 'card_missing' });
  });

  it('not_due quando due_at no futuro', async () => {
    const res = await confirmDueScheduledReview({
      client: clientWithCard({
        review_unit_id: unit.reviewUnitId,
        review_unit_kind: 'subtopico',
        due_at: '2026-07-30T12:00:00.000Z',
        last_question_id: OTHER_SLUG,
        revision: 2,
      }),
      userId: USER_ID,
      questionId: SLUG,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      now,
    });
    expect(res).toEqual({ confirmed: false, reason: 'not_due' });
  });

  it('load_failed em erro de query', async () => {
    const res = await confirmDueScheduledReview({
      client: clientWithCard(null, { message: 'db down' }),
      userId: USER_ID,
      questionId: SLUG,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      now,
    });
    expect(res).toEqual({ confirmed: false, reason: 'load_failed' });
  });

  it('confirmed + sameStemFallback false quando outro enunciado', async () => {
    const res = await confirmDueScheduledReview({
      client: clientWithCard({
        review_unit_id: unit.reviewUnitId,
        review_unit_kind: 'subtopico',
        due_at: '2026-07-28T12:00:00.000Z',
        last_question_id: OTHER_SLUG,
        revision: 3,
      }),
      userId: USER_ID,
      questionId: SLUG,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      now,
    });
    expect(res).toEqual({
      confirmed: true,
      reviewUnitId: unit.reviewUnitId,
      reviewUnitKind: 'subtopico',
      dueAt: '2026-07-28T12:00:00.000Z',
      lastQuestionId: OTHER_SLUG,
      revision: 3,
      sameStemFallback: false,
    });
  });

  it('confirmed + sameStemFallback true quando mesmo enunciado', async () => {
    const res = await confirmDueScheduledReview({
      client: clientWithCard({
        review_unit_id: unit.reviewUnitId,
        review_unit_kind: 'subtopico',
        due_at: '2026-07-28T12:00:00.000Z',
        last_question_id: SLUG,
        revision: 1,
      }),
      userId: USER_ID,
      questionId: SLUG,
      discipline: 'Enfermagem',
      subtopico: 'Imunização',
      now,
    });
    expect(res.confirmed).toBe(true);
    if (res.confirmed) {
      expect(res.sameStemFallback).toBe(true);
    }
  });
});
