import {
  getE2eDesempenhoEstudoData,
  getE2eDesempenhoEstudoPlacarZeradoComSerie,
  getE2eDesempenhoHistoricoCursor,
  getE2eDesempenhoLeituraTruncada,
  getE2eDesempenhoLoadError,
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
    expect(data.areas.some((area) => area.areaLabel === 'Doenças Transmissíveis')).toBe(
      true,
    );
  });
});

describe('capturas E2E de desempenho', () => {
  const limpo = {
    periodo: 'all' as const,
    banca: null,
    areaId: null,
    disciplina: null,
    assunto: null,
  };

  it('historico-cursor gera mais itens que uma página', () => {
    const data = getE2eDesempenhoHistoricoCursor(limpo, 5000);
    expect(data.recentAttempts).toHaveLength(25);
    const slugs = new Set(data.recentAttempts.map((a) => a.moduloSlug));
    expect(slugs.size).toBe(25);
  });

  it('leitura-truncada substitui o universo completo', () => {
    const data = getE2eDesempenhoLeituraTruncada(limpo);
    expect(data.leituraTruncada).toBe(true);
    expect(data.placar.respondidas).toBeGreaterThan(0);
  });

  it('erro não zera o placar como se fosse vazio', () => {
    const data = getE2eDesempenhoLoadError(limpo);
    expect(data.loadState).toBe('error');
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
