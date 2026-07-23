import {
  buildPtCliticPositionBoard,
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

describe('ptCliticRailSlideUtils — position board', () => {
  const positionSteps = [
    'Antes de tocar: em «levou-me», o pronome está antes, dentro ou depois do verbo?',
    'Depois do verbo: o modelo pedido é ênclise.',
    'A «Acender-se-ão»: pronome no meio do futuro → mesóclise. Elimine.',
    'B «Deitou-se»: deitou + se; pronome depois do verbo → ênclise.',
    'O «porque» vem depois; não atrai o pronome do verbo anterior.',
    'C «Que nos trouxe»: o relativo «que» puxa «nos» → próclise. Elimine.',
    'D «Não se salvaram»: a negação puxa «se» → próclise. Elimine.',
    'E «Jamais me esquecerei»: «jamais» atrai → próclise. Elimine.',
    'Gabarito B: «Deitou-se porque não estava bem.»',
    'Em similares: ache a mesma posição do modelo; não classifique só pelo hífen.',
  ];

  it('monta as três posições e o gabarito sem hardcode da questão', () => {
    const board = buildPtCliticPositionBoard(positionSteps);

    expect(board).toMatchObject({
      modelExample: 'levou-me',
      modelPosition: 'enclise',
      answerLetter: 'B',
    });
    expect(board?.options).toEqual([
      { letter: 'A', example: 'Acender-se-ão', position: 'mesoclise' },
      { letter: 'B', example: 'Deitou-se', position: 'enclise' },
      { letter: 'C', example: 'Que nos trouxe', position: 'proclise' },
      { letter: 'D', example: 'Não se salvaram', position: 'proclise' },
      { letter: 'E', example: 'Jamais me esquecerei', position: 'proclise' },
    ]);
  });

  it('preserva o trilho em questões normativas sem matching espacial', () => {
    expect(
      buildPtCliticPositionBoard([
        'Comando: só uma reescrita coloca o átono no lugar certo.',
        'B: «Já bebia-se» — Já atrai → precisa próclise.',
        'Gabarito A — única que embarca.',
        'Em similares: há atrativo? → pró.',
      ]),
    ).toBeNull();
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
