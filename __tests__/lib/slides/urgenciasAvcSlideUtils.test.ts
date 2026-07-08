import {
  cincinnatiSignLabel,
  inferCincinnatiSign,
  inferUrgenciasStrokeTrapSlot,
} from '@/lib/slides/urgenciasAvcSlideUtils';

describe('urgenciasAvcSlideUtils', () => {
  it('inferCincinnatiSign classifica F·A·S·T', () => {
    expect(inferCincinnatiSign('Face', 'sorriso assimétrico')).toBe('face');
    expect(inferCincinnatiSign('Braços', 'queda de MMSS')).toBe('arms');
    expect(inferCincinnatiSign('Fala', 'disartria')).toBe('speech');
    expect(inferCincinnatiSign('Acionar', '192 SAMU tempo')).toBe('time');
  });

  it('inferUrgenciasStrokeTrapSlot distingue escalas', () => {
    expect(
      inferUrgenciasStrokeTrapSlot('Letra B', 'cefaleia vômito nuca', 'meníngea não é Cincinnati'),
    ).toBe('meningeal');
    expect(
      inferUrgenciasStrokeTrapSlot('Letra C', 'dor torácica', 'quadro IAM'),
    ).toBe('iam');
    expect(
      inferUrgenciasStrokeTrapSlot('Letra D', 'consciência motor verbal', 'Glasgow'),
    ).toBe('glasgow');
    expect(
      inferUrgenciasStrokeTrapSlot('Letra E', 'PA FC FR', 'sinais vitais'),
    ).toBe('ssvv');
  });

  it('expõe labels legíveis', () => {
    expect(cincinnatiSignLabel('face')).toBe('Face');
  });
});
