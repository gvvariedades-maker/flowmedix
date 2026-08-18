import {
  resolveAcertoDisplay,
  VITRINE_ACERTO_MIN_SAMPLE,
} from '@/lib/vitrine/resolveAcertoDisplay';

describe('resolveAcertoDisplay', () => {
  it('mostra Não iniciado sem tentativas', () => {
    expect(
      resolveAcertoDisplay({
        acertos: 0,
        totalResolvidas: 0,
        totalQuestoes: 40,
        percentual: 0,
      }),
    ).toMatchObject({
      label: 'Não iniciado',
      tone: 'muted',
      amostraSuficiente: false,
      ringValue: 0,
      coberturaLabel: '0/40 respondidas',
      coberturaPct: 0,
    });
  });

  it('abaixo do piso de amostra mostra contagem, não %', () => {
    expect(VITRINE_ACERTO_MIN_SAMPLE).toBe(5);
    const display = resolveAcertoDisplay({
      acertos: 3,
      totalResolvidas: 4,
      totalQuestoes: 40,
      percentual: 75,
    });
    expect(display).toMatchObject({
      label: '3/4 acertos',
      ariaLabel: '3 de 4 acertos',
      tone: 'brand',
      amostraSuficiente: false,
      coberturaPct: 10,
      coberturaLabel: '4/40 respondidas',
      ringValue: 10,
    });
  });

  it('com amostra suficiente exibe % de acerto', () => {
    const display = resolveAcertoDisplay({
      acertos: 4,
      totalResolvidas: 8,
      totalQuestoes: 40,
      percentual: 50,
    });
    expect(display).toMatchObject({
      label: '50%',
      ariaLabel: '50% de acerto',
      tone: 'brand',
      amostraSuficiente: true,
      ringValue: 50,
      coberturaPct: 20,
      coberturaLabel: '8/40 respondidas',
    });
  });

  it('100% de acerto com amostra usa tom success', () => {
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
      coberturaPct: 100,
    });
  });
});
