import {
  inferRailStation,
  inferRowBoardBadge,
  inferStepRole,
} from '@/lib/slides/ptCliticRailSlideUtils';

describe('ptCliticRailSlideUtils — inferStepRole', () => {
  it('corta B (Já atrai) e E (particípio)', () => {
    expect(
      inferStepRole('B: «Já bebia-se» — Já atrai → precisa próclise: Já se bebia.'),
    ).toBe('eliminar_letra');
    expect(
      inferStepRole('E: «tem dedicado-se» — particípio não admite ênclise → tem-se dedicado.'),
    ).toBe('eliminar_letra');
  });

  it('valida A com ênclise ok no infinitivo', () => {
    expect(
      inferStepRole('A: «a manifestar-se» — infinitivo após a; sem atrativo no átono → ênclise ok.'),
    ).toBe('validar_letra');
  });

  it('reconhece gabarito e transferência', () => {
    expect(inferStepRole('Gabarito A — única que embarca na estação certa do trilho.')).toBe(
      'gabarito',
    );
    expect(
      inferStepRole('Em similares: há atrativo? → pró. Sem? → ên. Particípio? sem ênclise.'),
    ).toBe('transferencia');
  });
});

describe('ptCliticRailSlideUtils — estações e badge do board', () => {
  it('infere próclise / ênclise / pegadinha', () => {
    expect(inferRailStation('Próclise — antes do verbo com atrativo')).toBe('proclise');
    expect(inferRailStation('Ênclise — depois do verbo; diga-me')).toBe('enclise');
    expect(inferRailStation('Ênclise automática — enclisar sem perguntar')).toBe('pegadinha');
  });

  it('highlight → portátil; success → pró; alert → barra', () => {
    expect(
      inferRowBoardBadge({
        label: 'Pergunta-chave',
        value: 'há atrativo? → próclise',
        emphasis: 'highlight',
      }),
    ).toBe('portátil');
    expect(
      inferRowBoardBadge({
        label: 'Próclise',
        value: 'não, já, quando…',
        emphasis: 'success',
      }),
    ).toBe('pró');
    expect(
      inferRowBoardBadge({
        label: 'Cuidado especial',
        value: 'particípio sem ênclise',
        emphasis: 'alert',
      }),
    ).toBe('barra');
  });
});
