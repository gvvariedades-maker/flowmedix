/**
 * @jest-environment node
 */
import type { ReviewItem } from '@/lib/spaced-repetition';
import type { FsrsQueueClient } from '@/lib/fsrs/queue';

const mockIsFsrsMvpEnabled = jest.fn(() => false);
const mockIsFsrsMvpBetaEmail = jest.fn((_email?: string | null) => false);

jest.mock('@/lib/env', () => ({
  isFsrsMvpEnabled: () => mockIsFsrsMvpEnabled(),
  isFsrsMvpBetaEmail: (email?: string | null) => mockIsFsrsMvpBetaEmail(email),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => {
    throw new Error('createServerSupabase should not be called in unit tests');
  }),
}));

import {
  getReviewsToday,
  reviewsTodaySlugs,
  shouldUseFsrsTodayQueue,
} from '@/lib/fsrs/reviewsToday';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const BETA_EMAIL = 'beta@avant.test';

function sm2Item(slug: string): ReviewItem {
  return {
    modulo_slug: slug,
    nextReview: new Date('2026-07-29T12:00:00.000Z'),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    priority: 10,
  };
}

function queueClientWithCards(
  cards: Array<Record<string, unknown>>,
): FsrsQueueClient {
  return {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                lte() {
                  return {
                    order: async () => ({ data: cards, error: null }),
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

describe('shouldUseFsrsTodayQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exige flag on + allowlist', () => {
    mockIsFsrsMvpEnabled.mockReturnValue(true);
    mockIsFsrsMvpBetaEmail.mockReturnValue(true);
    expect(shouldUseFsrsTodayQueue(BETA_EMAIL)).toBe(true);

    mockIsFsrsMvpBetaEmail.mockReturnValue(false);
    expect(shouldUseFsrsTodayQueue('outro@avant.test')).toBe(false);

    mockIsFsrsMvpEnabled.mockReturnValue(false);
    mockIsFsrsMvpBetaEmail.mockReturnValue(true);
    expect(shouldUseFsrsTodayQueue(BETA_EMAIL)).toBe(false);
  });
});

describe('getReviewsToday', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFsrsMvpEnabled.mockReturnValue(false);
    mockIsFsrsMvpBetaEmail.mockReturnValue(false);
  });

  it('retorna SM-2 quando flag off', async () => {
    const getSm2Reviews = jest.fn(async () => [sm2Item('sm2-slug')]);

    const result = await getReviewsToday({
      userId: USER_ID,
      email: BETA_EMAIL,
      getSm2Reviews,
    });

    expect(result.source).toBe('sm2');
    expect(result.reviews).toEqual([sm2Item('sm2-slug')]);
    expect(getSm2Reviews).toHaveBeenCalledWith(USER_ID);
  });

  it('retorna SM-2 quando fora da allowlist', async () => {
    mockIsFsrsMvpEnabled.mockReturnValue(true);
    mockIsFsrsMvpBetaEmail.mockReturnValue(false);
    const getSm2Reviews = jest.fn(async () => [sm2Item('off-cohort')]);

    const result = await getReviewsToday({
      userId: USER_ID,
      email: 'aluno@avant.test',
      getSm2Reviews,
    });

    expect(result).toEqual({
      source: 'sm2',
      reviews: [sm2Item('off-cohort')],
    });
  });

  it('retorna fila FSRS para beta com telemetria', async () => {
    mockIsFsrsMvpEnabled.mockReturnValue(true);
    mockIsFsrsMvpBetaEmail.mockReturnValue(true);

    const unit =
      'fsrs:v1:discipline=enfermagem:subtopico=' +
      encodeURIComponent('Imunização');
    const client = queueClientWithCards([
      {
        review_unit_id: unit,
        review_unit_kind: 'subtopico',
        due_at: '2026-07-28T00:00:00.000Z',
        last_question_id: 'slug-a',
        revision: 1,
      },
      {
        review_unit_id: 'fsrs:v1:discipline=enfermagem:subtopico=vazio',
        review_unit_kind: 'subtopico',
        due_at: '2026-07-28T01:00:00.000Z',
        last_question_id: null,
        revision: 0,
      },
    ]);

    const result = await getReviewsToday({
      userId: USER_ID,
      email: BETA_EMAIL,
      now: new Date('2026-07-29T12:00:00.000Z'),
      queueClient: client,
      resolveInventory: async (reviewUnitId) => {
        if (reviewUnitId.includes('vazio')) return [];
        return ['slug-a', 'slug-b'];
      },
      getSm2Reviews: async () => {
        throw new Error('SM-2 should not run for beta success path');
      },
    });

    expect(result.source).toBe('fsrs');
    if (result.source !== 'fsrs') return;
    expect(result.reviews).toEqual([
      {
        modulo_slug: 'slug-b',
        review_unit_id: unit,
        same_stem_fallback: false,
        inventory_missing: false,
      },
    ]);
    expect(result.telemetry).toEqual({
      same_stem_fallback: 0,
      inventory_missing: 1,
    });
  });

  it('faz fallback SM-2 quando FSRS falha', async () => {
    mockIsFsrsMvpEnabled.mockReturnValue(true);
    mockIsFsrsMvpBetaEmail.mockReturnValue(true);
    const getSm2Reviews = jest.fn(async () => [sm2Item('fallback')]);

    const result = await getReviewsToday({
      userId: USER_ID,
      email: BETA_EMAIL,
      queueClient: {
        from() {
          throw new Error('db down');
        },
      } as unknown as FsrsQueueClient,
      getSm2Reviews,
    });

    expect(result).toEqual({
      source: 'sm2',
      reviews: [sm2Item('fallback')],
    });
    expect(getSm2Reviews).toHaveBeenCalledWith(USER_ID);
  });
});

describe('reviewsTodaySlugs', () => {
  it('extrai modulo_slug de ambos os sources', () => {
    expect(
      reviewsTodaySlugs({
        source: 'sm2',
        reviews: [sm2Item('a'), sm2Item('b')],
      }),
    ).toEqual(['a', 'b']);
    expect(
      reviewsTodaySlugs({
        source: 'fsrs',
        reviews: [
          {
            modulo_slug: 'x',
            review_unit_id: 'u',
            same_stem_fallback: false,
            inventory_missing: false,
          },
        ],
        telemetry: { same_stem_fallback: 0, inventory_missing: 0 },
      }),
    ).toEqual(['x']);
  });
});
