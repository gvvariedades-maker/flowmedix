import {
  SLIDE_TYPE_CHIP_LABELS,
  SLIDE_ARC_BY_TYPE,
  getSlideChipLabel,
  getSlideArcLabel,
} from '@/components/slides/core/slideLabels';

describe('slideLabels', () => {
  it('expõe rótulos padrão por tipo', () => {
    expect(SLIDE_TYPE_CHIP_LABELS.logic_flow).toBe('FLUXO LÓGICO');
    expect(SLIDE_ARC_BY_TYPE.danger_zone).toBe('Evite as pegadinhas');
  });

  it('getSlideChipLabel usa override em uppercase', () => {
    expect(getSlideChipLabel('logic_flow', 'mnemônico')).toBe('MNEMÔNICO');
  });

  it('getSlideChipLabel usa padrão por type sem override', () => {
    expect(getSlideChipLabel('golden_rule')).toBe('REGRA DE OURO');
  });

  it('getSlideChipLabel retorna NEUROSLIDE para tipo desconhecido', () => {
    expect(getSlideChipLabel('tipo_invalido')).toBe('NEUROSLIDE');
  });

  it('getSlideArcLabel prioriza arco por tipo', () => {
    expect(getSlideArcLabel('concept_map', 2, 4)).toBe('Panorama do tema');
    expect(getSlideArcLabel('logic_flow', 0, 4)).toBe('Raciocínio passo a passo');
  });

  it('getSlideArcLabel usa fallback por posição sem tipo', () => {
    expect(getSlideArcLabel(undefined, 0, 4)).toBe('Panorama do tema');
    expect(getSlideArcLabel(undefined, 3, 4)).toBe('Pegadinhas');
    expect(getSlideArcLabel(undefined, 9, 10)).toBe('Etapa 10');
  });
});
