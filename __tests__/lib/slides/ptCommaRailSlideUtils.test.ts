import {
  commaStationBadge,
  inferCommaRowBoardBadge,
  inferCommaStation,
  inferCommaStepRole,
} from '@/lib/slides/ptCommaRailSlideUtils';

describe('ptCommaRailSlideUtils — inferCommaStepRole', () => {
  it('corta D (Eu, farei) e E (você, irá)', () => {
    expect(inferCommaStepRole('D: «Eu, farei» — vírgula entre sujeito e verbo. Proibido.')).toBe(
      'eliminar_letra',
    );
    expect(
      inferCommaStepRole('E: «você, irá» — de novo sujeito|verbo cortado; falta vírgula no vocativo.'),
    ).toBe('eliminar_letra');
  });

  it('valida B com vocativo ok', () => {
    expect(
      inferCommaStepRole('B: «Rita,» chama a pessoa (vocativo) + pergunta. Isola certo.'),
    ).toBe('validar_letra');
  });

  it('reconhece gabarito e transferência', () => {
    expect(
      inferCommaStepRole('Gabarito B — única com vocativo isolado e trilho sujeito|verbo intacto.'),
    ).toBe('gabarito');
    expect(
      inferCommaStepRole('Em similares: o que a vírgula isola? Se for sujeito|verbo → tire.'),
    ).toBe('transferencia');
  });
});

describe('ptCommaRailSlideUtils — estações e badge do board', () => {
  it('infere trilho livre / vocativo / pegadinha', () => {
    expect(inferCommaStation('Trilho livre: sujeito|verbo sem vírgula')).toBe('trilho_livre');
    expect(inferCommaStation('Isola: vocativo — chama o interlocutor')).toBe('vocativo');
    expect(inferCommaStation('Pausa na fala parece justificar a vírgula')).toBe('pegadinha');
  });

  it('highlight → portátil; success → isola; alert → barra', () => {
    expect(
      inferCommaRowBoardBadge({
        label: 'Pergunta-chave',
        value: 'o que a vírgula isola?',
        emphasis: 'highlight',
      }),
    ).toBe('portátil');
    expect(
      inferCommaRowBoardBadge({
        label: 'Pode (vírgula)',
        value: 'Vocativo: Rita, venha.',
        emphasis: 'success',
      }),
    ).toBe('isola');
    expect(
      inferCommaRowBoardBadge({
        label: 'Não pode',
        value: 'Sujeito|verbo: Eu farei',
        emphasis: 'alert',
      }),
    ).toBe('barra');
  });

  it('badge de estação para vocativo e trilho livre', () => {
    expect(commaStationBadge('vocativo')).toBe('VOCATIVO');
    expect(commaStationBadge('trilho_livre')).toBe('TRILHO LIVRE · S|V');
  });
});
