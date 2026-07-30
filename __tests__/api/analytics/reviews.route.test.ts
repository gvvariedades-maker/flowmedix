/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase/server-auth', () => ({
  getServerUser: jest.fn(),
}));

jest.mock('@/lib/fsrs/reviewsToday', () => ({
  getReviewsToday: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { GET } from '@/app/api/analytics/reviews/route';
import { getServerUser } from '@/lib/supabase/server-auth';
import { getReviewsToday } from '@/lib/fsrs/reviewsToday';

const mockGetServerUser = getServerUser as jest.MockedFunction<typeof getServerUser>;
const mockGetReviewsToday = getReviewsToday as jest.MockedFunction<typeof getReviewsToday>;

describe('GET /api/analytics/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna 401 sem sessão', async () => {
    mockGetServerUser.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(mockGetReviewsToday).not.toHaveBeenCalled();
  });

  it('retorna SM-2 quando serviço escolhe sm2', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'user-1',
      email: 'aluno@avant.test',
    } as Awaited<ReturnType<typeof getServerUser>>);
    mockGetReviewsToday.mockResolvedValue({
      source: 'sm2',
      reviews: [
        {
          modulo_slug: 'sm2-slug',
          nextReview: new Date('2026-07-29T12:00:00.000Z'),
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          priority: 10,
        },
      ],
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe('sm2');
    expect(body.reviews).toHaveLength(1);
    expect(body.reviews[0].modulo_slug).toBe('sm2-slug');
    expect(body.telemetry).toBeUndefined();
    expect(mockGetReviewsToday).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'aluno@avant.test',
    });
  });

  it('retorna FSRS com telemetria para beta', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'user-beta',
      email: 'beta@avant.test',
    } as Awaited<ReturnType<typeof getServerUser>>);
    mockGetReviewsToday.mockResolvedValue({
      source: 'fsrs',
      reviews: [
        {
          modulo_slug: 'fsrs-slug',
          review_unit_id: 'fsrs:v1:discipline=enfermagem:subtopico=imunizacao',
          same_stem_fallback: true,
          inventory_missing: false,
        },
      ],
      telemetry: { same_stem_fallback: 1, inventory_missing: 0 },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      source: 'fsrs',
      reviews: [
        {
          modulo_slug: 'fsrs-slug',
          review_unit_id: 'fsrs:v1:discipline=enfermagem:subtopico=imunizacao',
          same_stem_fallback: true,
          inventory_missing: false,
        },
      ],
      telemetry: { same_stem_fallback: 1, inventory_missing: 0 },
    });
  });

  it('retorna 500 quando getReviewsToday lança (erro não recuperado)', async () => {
    mockGetServerUser.mockResolvedValue({
      id: 'user-1',
      email: 'aluno@avant.test',
    } as Awaited<ReturnType<typeof getServerUser>>);
    mockGetReviewsToday.mockRejectedValue(new Error('boom'));

    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to get reviews' });
  });
});
