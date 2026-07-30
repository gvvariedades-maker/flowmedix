import {
  E2E_ESTUDAR_SLUG_1,
  isE2eEstudarSlug,
} from '@/lib/e2e/constants';
import {
  E2E_FSRS_REVIEW_UNIT_ID,
  E2E_REVISOES_FSRS_MODE_PARAM,
  E2E_REVISOES_QUEUE_SLUGS,
  getE2eRevisoesQueueItems,
  getE2eRevisoesQueueSlugs,
  isE2eRevisoesQueueSlug,
  parseE2eRevisoesFsrsMode,
} from '@/lib/e2e/revisoesHojeSeed';

describe('revisoesHojeSeed E2E', () => {
  it('parseia modos do query param (default empty)', () => {
    expect(parseE2eRevisoesFsrsMode({})).toBe('empty');
    expect(parseE2eRevisoesFsrsMode({ [E2E_REVISOES_FSRS_MODE_PARAM]: 'queue' })).toBe(
      'queue',
    );
    expect(parseE2eRevisoesFsrsMode({ [E2E_REVISOES_FSRS_MODE_PARAM]: 'off' })).toBe('off');
    expect(parseE2eRevisoesFsrsMode({ [E2E_REVISOES_FSRS_MODE_PARAM]: 'other' })).toBe(
      'empty',
    );
  });

  it('fila determinística com slug E2E e review_unit_id fixo', () => {
    const items = getE2eRevisoesQueueItems();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      modulo_slug: E2E_ESTUDAR_SLUG_1,
      review_unit_id: E2E_FSRS_REVIEW_UNIT_ID,
      same_stem_fallback: false,
      inventory_missing: false,
    });
    expect(getE2eRevisoesQueueSlugs()).toEqual([...E2E_REVISOES_QUEUE_SLUGS]);
    expect(isE2eEstudarSlug(E2E_ESTUDAR_SLUG_1)).toBe(true);
    expect(isE2eRevisoesQueueSlug(E2E_ESTUDAR_SLUG_1)).toBe(true);
    expect(isE2eRevisoesQueueSlug('outro-slug')).toBe(false);
  });
});
