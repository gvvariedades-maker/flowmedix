import {
  formatAcertoErroAria,
  resolveAcertoDisplay,
  splitAcertoErroPct,
} from '@/lib/vitrine/resolveAcertoDisplay';

describe('splitAcertoErroPct', () => {
  it('1/13 arredonda acerto e o resto vai para erro', () => {
    expect(splitAcertoErroPct(1, 13)).toEqual({ acertoPct: 8, erroPct: 92 });
  });

  it('0/13 vira donut 100% erro', () => {
    expect(splitAcertoErroPct(0, 13)).toEqual({ acertoPct: 0, erroPct: 100 });
  });

  it('13/13 vira donut 100% acerto', () => {
    expect(splitAcertoErroPct(13, 13)).toEqual({ acertoPct: 100, erroPct: 0 });
  });

  it('sem respondidas não inventa fatias', () => {
    expect(splitAcertoErroPct(0, 0)).toEqual({ acertoPct: 0, erroPct: 0 });
  });

  it('1/3 e 2/3 arredondam para fatias que somam 100', () => {
    expect(splitAcertoErroPct(1, 3)).toEqual({ acertoPct: 33, erroPct: 67 });
    expect(splitAcertoErroPct(2, 3)).toEqual({ acertoPct: 67, erroPct: 33 });
  });

  it('percentuais de fatia sempre somam 100 quando há respondidas', () => {
    const samples: Array<[number, number]> = [
      [1, 3],
      [2, 3],
      [1, 13],
      [7, 13],
      [1, 7],
      [5, 8],
    ];
    for (const [acertos, respondidas] of samples) {
      const split = splitAcertoErroPct(acertos, respondidas);
      expect(split.acertoPct + split.erroPct).toBe(100);
      expect(split.acertoPct).toBeGreaterThanOrEqual(0);
      expect(split.erroPct).toBeGreaterThanOrEqual(0);
      expect(split.acertoPct).toBeLessThanOrEqual(100);
      expect(split.erroPct).toBeLessThanOrEqual(100);
    }
  });

  it('valores inconsistentes não geram % negativo nem acima de 100', () => {
    expect(splitAcertoErroPct(20, 13)).toEqual({ acertoPct: 100, erroPct: 0 });
    expect(splitAcertoErroPct(-4, 13)).toEqual({ acertoPct: 0, erroPct: 100 });
    expect(splitAcertoErroPct(-1, 0)).toEqual({ acertoPct: 0, erroPct: 0 });
    expect(splitAcertoErroPct(3, -2)).toEqual({ acertoPct: 0, erroPct: 0 });
  });
});

describe('formatAcertoErroAria', () => {
  it('descreve acerto e erro em números absolutos', () => {
    expect(formatAcertoErroAria(1, 12, 13, 8)).toBe(
      'Taxa de acerto: 8%. 1 acerto e 12 erros entre 13 respondidas.',
    );
  });
});

describe('resolveAcertoDisplay', () => {
  it('mostra Não iniciado sem tentativas e sem 0%', () => {
    expect(
      resolveAcertoDisplay({
        acertos: 0,
        totalResolvidas: 0,
        totalQuestoes: 40,
        percentual: 0,
      }),
    ).toMatchObject({
      label: 'Não iniciado',
      ariaLabel: 'Nenhuma questão respondida',
      tone: 'muted',
      acertoPct: null,
      coberturaLabel: '0 de 40 respondidas',
      coberturaPct: 0,
    });
  });

  it('abaixo de 5 respondidas ainda mostra % de acerto', () => {
    const display = resolveAcertoDisplay({
      acertos: 3,
      totalResolvidas: 4,
      totalQuestoes: 40,
      percentual: 75,
    });
    expect(display).toMatchObject({
      label: '75%',
      ariaLabel: '75% de acerto',
      tone: 'success',
      acertoPct: 75,
      coberturaPct: 10,
      coberturaLabel: '4 de 40 respondidas',
    });
  });

  it('0% de acerto usa tom success (categoria acerto)', () => {
    expect(
      resolveAcertoDisplay({
        acertos: 0,
        totalResolvidas: 13,
        totalQuestoes: 171,
        percentual: 0,
      }),
    ).toMatchObject({
      label: '0%',
      ariaLabel: '0% de acerto',
      tone: 'success',
      acertoPct: 0,
      coberturaPct: 8,
    });
  });

  it('com respondidas exibe % de acerto, não cobertura no hero', () => {
    const display = resolveAcertoDisplay({
      acertos: 4,
      totalResolvidas: 8,
      totalQuestoes: 40,
      percentual: 50,
    });
    expect(display).toMatchObject({
      label: '50%',
      ariaLabel: '50% de acerto',
      tone: 'success',
      acertoPct: 50,
      coberturaPct: 20,
      coberturaLabel: '8 de 40 respondidas',
    });
  });

  it('100% de acerto mantém tom success', () => {
    expect(
      resolveAcertoDisplay({
        acertos: 10,
        totalResolvidas: 10,
        totalQuestoes: 10,
        percentual: 100,
      }),
    ).toMatchObject({
      label: '100%',
      ariaLabel: '100% de acerto',
      tone: 'success',
      acertoPct: 100,
      coberturaPct: 100,
    });
  });
});
