import {
  getE2eDesempenhoEstudoData,
  getE2eDesempenhoEstudoPlacarZeradoComSerie,
} from '@/lib/e2e/desempenhoSeed';
import {
  E2E_DESEMPENHO_TITULO_AULA,
  E2E_DESEMPENHO_TITULO_LONGO,
} from '@/lib/e2e/constants';
import { DESEMPENHO_COACH_UNLOCK } from '@/lib/desempenho/types';

describe('getE2eDesempenhoEstudoData', () => {
  it('libera coach, mapa e foco no assunto E2E sem o título longo roubar nextPractice', () => {
    const data = getE2eDesempenhoEstudoData({
      periodo: 'all',
      banca: null,
      areaId: null,
      disciplina: null,
    });

    expect(data.placar.respondidas).toBeGreaterThanOrEqual(DESEMPENHO_COACH_UNLOCK);
    expect(data.placar.coachUnlocked).toBe(true);
    expect(data.assuntos.some((a) => a.tituloAula === E2E_DESEMPENHO_TITULO_AULA)).toBe(true);
    expect(data.nextPractice[0]?.tituloAula).toBe(E2E_DESEMPENHO_TITULO_AULA);
    expect(data.nextPractice[0]?.deepLinkAssunto).toBe(E2E_DESEMPENHO_TITULO_AULA);
    expect(data.recentAttempts[0]?.tituloAula).toBe(E2E_DESEMPENHO_TITULO_LONGO);
    expect(data.recentAttempts[0]?.acertou).toBe(false);
    expect(data.recentAttempts[0]?.estudoReversoConcluido).toBe(true);
  });
});

describe('getE2eDesempenhoEstudoPlacarZeradoComSerie', () => {
  it('zera o placar e mantém a série de tentativas visível', () => {
    const data = getE2eDesempenhoEstudoPlacarZeradoComSerie({
      periodo: 'all',
      banca: null,
      areaId: null,
      disciplina: null,
    });

    expect(data.placar.respondidas).toBe(0);
    expect(data.attemptSeries.available).toBe(true);
    expect(data.attemptSeries.daily.some((d) => d.attempts > 0)).toBe(true);
  });
});
