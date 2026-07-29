/**
 * @jest-environment node
 */
import { selectQuestionForUnit } from '@/lib/fsrs/queue';

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
