import {
  inferTermMatrixCell,
  inferTermRowBoardBadge,
  inferTermStepRole,
} from '@/lib/slides/ptTermMatrixSlideUtils';

describe('ptTermMatrixSlideUtils — inferTermStepRole', () => {
  it('classifica T1/T2 e eliminação por letra', () => {
    expect(
      inferTermStepRole('T1 «No grupo… folhetos»: circunstância do verbo «foi» — adjunto adverbial deslocado.'),
    ).toBe('classificar_termo');
    expect(inferTermStepRole('A: T1 não é complemento nominal — eliminar.')).toBe('eliminar_letra');
    expect(inferTermStepRole('Gabarito E — adj. adverbial deslocado + loc. adverbial de tempo.')).toBe(
      'gabarito',
    );
    expect(inferTermStepRole('Em similares: matriz — pergunta-teste por termo.')).toBe('transferencia');
  });
});

describe('ptTermMatrixSlideUtils — células e badge do board', () => {
  it('infere células sintáticas', () => {
    expect(inferTermMatrixCell('Modifica verbo? circunstância → adjunto adverbial')).toBe('adj_adv');
    expect(inferTermMatrixCell('Enquanto isso — locução adverbial de tempo')).toBe('loc_adv_tempo');
    expect(inferTermMatrixCell('Pegadinha: rótulo do vizinho')).toBe('pegadinha');
  });

  it('badge barra / célula / portátil', () => {
    expect(
      inferTermRowBoardBadge({
        label: 'Pergunta-chave',
        value: 'Modifica verbo? nome?',
        emphasis: 'highlight',
      }),
    ).toBe('portátil');
    expect(
      inferTermRowBoardBadge({
        label: 'Modifica verbo?',
        value: 'Adjunto adverbial',
        emphasis: 'success',
      }),
    ).toBe('célula');
    expect(
      inferTermRowBoardBadge({
        label: 'Deslocado',
        value: 'Anteposto',
        emphasis: 'alert',
      }),
    ).toBe('barra');
  });
});
