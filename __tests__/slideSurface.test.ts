import { getSlideTypeBgClass, getSlideTypeTitleClass } from '@/components/slides/core/slideSurface';

describe('getSlideTypeBgClass', () => {
  it('retorna gradiente por tipo de slide', () => {
    expect(getSlideTypeBgClass('concept_map')).toContain('FCE7F3');
    expect(getSlideTypeBgClass('golden_rule')).toContain('FEF3C7');
    expect(getSlideTypeBgClass('logic_flow')).toContain('DBEAFE');
    expect(getSlideTypeBgClass('danger_zone')).toContain('FEE2E2');
  });

  it('fallback para slate', () => {
    expect(getSlideTypeBgClass(undefined)).toBe('bg-slate-50');
    expect(getSlideTypeBgClass('unknown')).toBe('bg-slate-50');
  });
});

describe('getSlideTypeTitleClass', () => {
  it('retorna cor de título por tipo', () => {
    expect(getSlideTypeTitleClass('concept_map')).toContain('pink');
    expect(getSlideTypeTitleClass('logic_flow')).toContain('blue');
  });
});
