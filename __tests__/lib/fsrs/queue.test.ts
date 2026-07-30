/**
 * @jest-environment node
 */
import {
  buildFsrsTodayQueue,
  selectQuestionForUnit,
  type FsrsQueueClient,
} from '@/lib/fsrs/queue';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('selectQuestionForUnit', () => {
  it('prefere outro enunciado', () => {
    const res = selectQuestionForUnit({
      inventorySlugs: ['a-slug', 'b-slug'],
      lastQuestionId: 'a-slug',
    });
    expect(res).toEqual({
      modulo_slug: 'b-slug',
      same_stem_fallback: false,
      inventory_missing: false,
    });
  });

  it('same_stem_fallback quando só resta o mesmo', () => {
    const res = selectQuestionForUnit({
      inventorySlugs: ['a-slug'],
      lastQuestionId: 'a-slug',
    });
    expect(res.same_stem_fallback).toBe(true);
    expect(res.modulo_slug).toBe('a-slug');
  });

  it('inventory_missing quando vazio', () => {
    const res = selectQuestionForUnit({
      inventorySlugs: [],
      lastQuestionId: null,
    });
    expect(res.inventory_missing).toBe(true);
    expect(res.modulo_slug).toBeNull();
  });
});

describe('buildFsrsTodayQueue', () => {
  function clientWith(cards: Array<Record<string, unknown>>): FsrsQueueClient {
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

  it('monta itens e conta inventory_missing / same_stem_fallback', async () => {
    const built = await buildFsrsTodayQueue({
      client: clientWith([
        {
          review_unit_id: 'u-ok',
          review_unit_kind: 'subtopico',
          due_at: '2026-07-28T00:00:00.000Z',
          last_question_id: 'only',
          revision: 1,
        },
        {
          review_unit_id: 'u-missing',
          review_unit_kind: 'subtopico',
          due_at: '2026-07-28T01:00:00.000Z',
          last_question_id: null,
          revision: 0,
        },
      ]),
      userId: 'user-1',
      now: new Date('2026-07-29T00:00:00.000Z'),
      resolveInventory: async (id) => (id === 'u-ok' ? ['only'] : []),
    });

    expect(built.items).toEqual([
      {
        modulo_slug: 'only',
        review_unit_id: 'u-ok',
        same_stem_fallback: true,
        inventory_missing: false,
      },
    ]);
    expect(built.telemetry).toEqual({
      same_stem_fallback: 1,
      inventory_missing: 1,
    });
  });
});
