import { resolveConceptMapLayoutVariant } from '@/components/slides/core/conceptMapLayout';
import { CONCEPT_MAP_GEOMETRIC_POOL } from '@/components/slides/core/layoutRotation';

describe('conceptMapLayout', () => {
  const threeItems = { items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] };

  it('retorna morphological com 3+ itens sem override JSON nem slug', () => {
    expect(resolveConceptMapLayoutVariant(threeItems, undefined, 'grid')).toBe('morphological');
  });

  it('rotaciona bridge/grid/molecular com slug e sem override JSON', () => {
    const result = resolveConceptMapLayoutVariant(threeItems, undefined, 'bridge', {
      slug: 'vias-de-administracao-questao-1',
      slideIndex: 0,
    });
    expect(CONCEPT_MAP_GEOMETRIC_POOL).toContain(result);
  });

  it('respeita bridge explícito no JSON', () => {
    expect(resolveConceptMapLayoutVariant(threeItems, 'bridge', 'morphological')).toBe('bridge');
  });

  it('respeita morphological explícito no JSON', () => {
    expect(resolveConceptMapLayoutVariant(threeItems, 'morphological', 'grid')).toBe('morphological');
  });

  it('retorna stack com 1–2 itens', () => {
    const slide = { items: [{ label: 'A' }] };
    expect(resolveConceptMapLayoutVariant(slide, undefined, 'grid')).toBe('stack');
  });

  it('override JSON tem prioridade sobre rotação por slug', () => {
    const result = resolveConceptMapLayoutVariant(threeItems, 'molecular', 'bridge', {
      slug: 'any-slug',
      slideIndex: 0,
    });
    expect(result).toBe('molecular');
  });
});
