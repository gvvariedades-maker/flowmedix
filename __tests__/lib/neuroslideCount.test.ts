import { countNeuroSlidesInConteudoJson } from '@/lib/neuroslideCount';

describe('countNeuroSlidesInConteudoJson', () => {
  it('prioriza reverse_study_slides', () => {
    expect(
      countNeuroSlidesInConteudoJson({
        reverse_study_slides: [{ type: 'concept_map' }, { type: 'golden_rule' }],
        study_slides: [{ type: 'logic_flow' }],
      }),
    ).toBe(2);
  });

  it('usa study_slides quando reverse está vazio', () => {
    expect(
      countNeuroSlidesInConteudoJson({
        reverse_study_slides: [],
        study_slides: [{ type: 'concept_map' }, { type: 'golden_rule' }, { type: 'logic_flow' }],
      }),
    ).toBe(3);
  });

  it('retorna 0 sem slides', () => {
    expect(countNeuroSlidesInConteudoJson({})).toBe(0);
    expect(countNeuroSlidesInConteudoJson(null)).toBe(0);
  });
});
