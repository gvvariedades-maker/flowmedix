import {
  resolveDangerZoneLayoutVariant,
  dangerZoneHasCompareItems,
} from '@/components/slides/core/dangerZoneLayout';

describe('dangerZoneLayout', () => {
  it('retorna list sem items.correct (legado)', () => {
    const slide = {
      items: [{ label: 'Erro', detail: 'Descrição' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined)).toBe('list');
    expect(dangerZoneHasCompareItems(slide.items)).toBe(false);
  });

  it('retorna compare quando há correct não vazio', () => {
    const slide = {
      items: [
        { label: 'Trap', detail: 'X', correct: 'Conduta certa' },
      ],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined)).toBe('compare');
    expect(dangerZoneHasCompareItems(slide.items)).toBe(true);
  });

  it('ignora correct só com espaços', () => {
    const slide = {
      items: [{ label: 'Trap', detail: 'X', correct: '   ' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, undefined)).toBe('list');
    expect(dangerZoneHasCompareItems(slide.items)).toBe(false);
  });

  it('força compare com layout_variant explícito', () => {
    expect(resolveDangerZoneLayoutVariant({ items: [] }, 'compare')).toBe('compare');
  });

  it('respeita override cards quando não é legado list/compare', () => {
    const slide = {
      items: [{ label: 'T', detail: 'D', correct: 'C' }],
    };
    expect(resolveDangerZoneLayoutVariant(slide, 'cards')).toBe('cards');
  });
});
