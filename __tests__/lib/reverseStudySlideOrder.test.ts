import {
  getReverseStudySlideOrder,
  getReverseStudySlideOrderProfile,
  REVERSE_STUDY_SLIDE_ORDER_LEGACY,
  REVERSE_STUDY_SLIDE_ORDER_V2,
  sortReverseStudySlides,
} from '@/lib/reverseStudySlideOrder';

describe('reverseStudySlideOrder', () => {
  const legacyJson = [
    { type: 'concept_map', id: 'cm' },
    { type: 'golden_rule', id: 'gr' },
    { type: 'logic_flow', id: 'lf' },
    { type: 'danger_zone', id: 'dz' },
  ] as const;

  it('legacy profile mantém ordem histórica', () => {
    expect(getReverseStudySlideOrder('legacy')).toEqual(REVERSE_STUDY_SLIDE_ORDER_LEGACY);
    expect(sortReverseStudySlides([...legacyJson], 'legacy').map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);
  });

  it('v2 profile coloca logic_flow antes de golden_rule', () => {
    expect(getReverseStudySlideOrder('v2')).toEqual(REVERSE_STUDY_SLIDE_ORDER_V2);
    expect(sortReverseStudySlides([...legacyJson], 'v2').map((s) => s.type)).toEqual([
      'concept_map',
      'logic_flow',
      'golden_rule',
      'danger_zone',
    ]);
  });

  it('reordena JSON fora de ordem canônica', () => {
    const shuffled = [
      { type: 'danger_zone' },
      { type: 'logic_flow' },
      { type: 'golden_rule' },
      { type: 'concept_map' },
    ];
    expect(sortReverseStudySlides(shuffled, 'v2').map((s) => s.type)).toEqual([
      'concept_map',
      'logic_flow',
      'golden_rule',
      'danger_zone',
    ]);
  });

  it('preserva ordem relativa de tipos desconhecidos no final', () => {
    const slides = [
      { type: 'golden_rule', id: 'a' },
      { type: 'versus_arena', id: 'x' },
      { type: 'concept_map', id: 'b' },
      { type: 'custom_unknown', id: 'y' },
    ];
    expect(sortReverseStudySlides(slides, 'legacy').map((s) => s.id)).toEqual([
      'b',
      'a',
      'x',
      'y',
    ]);
  });

  describe('getReverseStudySlideOrderProfile', () => {
    it('default v2 quando env ausente ou explícita', () => {
      expect(getReverseStudySlideOrderProfile(undefined)).toBe('v2');
      expect(getReverseStudySlideOrderProfile('')).toBe('v2');
      expect(getReverseStudySlideOrderProfile('v2')).toBe('v2');
      expect(getReverseStudySlideOrderProfile(' V2 ')).toBe('v2');
    });

    it('legacy só quando env pede explicitamente', () => {
      expect(getReverseStudySlideOrderProfile('legacy')).toBe('legacy');
      expect(getReverseStudySlideOrderProfile('unexpected')).toBe('v2');
    });
  });
});
