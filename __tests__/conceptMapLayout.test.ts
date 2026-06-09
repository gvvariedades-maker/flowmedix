import { resolveConceptMapLayoutVariant } from '@/components/slides/core/conceptMapLayout';

describe('conceptMapLayout', () => {
  it('retorna morphological com 3+ itens sem override JSON', () => {
    const slide = { items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] };
    expect(resolveConceptMapLayoutVariant(slide, undefined, 'grid')).toBe('morphological');
  });

  it('respeita grid explícito no JSON', () => {
    const slide = { items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] };
    expect(resolveConceptMapLayoutVariant(slide, 'grid', 'morphological')).toBe('grid');
  });

  it('retorna stack com 1–2 itens', () => {
    const slide = { items: [{ label: 'A' }] };
    expect(resolveConceptMapLayoutVariant(slide, undefined, 'grid')).toBe('stack');
  });
});
