import { resolveSlideTitle } from '@/components/slides/core/slideTitleResolve';

describe('resolveSlideTitle', () => {
  it('remove prefixo redundante MAPA do slide_title explícito', () => {
    expect(
      resolveSlideTitle({
        type: 'concept_map',
        slide_title: 'MAPA – VERIFICAÇÃO DE SINAIS VITAIS',
      }),
    ).toBe('VERIFICAÇÃO DE SINAIS VITAIS');
  });

  it('remove prefixo REFERÊNCIA do slide_title explícito', () => {
    expect(
      resolveSlideTitle({
        type: 'golden_rule',
        slide_title: 'REFERÊNCIA – VERIFICAÇÃO DE SINAIS VITAIS',
      }),
    ).toBe('VERIFICAÇÃO DE SINAIS VITAIS');
  });

  it('mantém título sem prefixo redundante', () => {
    expect(
      resolveSlideTitle({
        type: 'golden_rule',
        slide_title: 'Higienização com álcool 70%',
      }),
    ).toBe('Higienização com álcool 70%');
  });

  it('deriva título de subtopico quando slide_title ausente', () => {
    expect(
      resolveSlideTitle({
        type: 'concept_map',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
      }),
    ).toBe('Mapa — Verificação de Sinais Vitais');
  });
});
