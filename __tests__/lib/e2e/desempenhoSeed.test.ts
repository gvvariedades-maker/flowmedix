import { getE2eDesempenhoEstudoData } from '@/lib/e2e/desempenhoSeed';
import { E2E_DESEMPENHO_TITULO_AULA } from '@/lib/e2e/constants';
import { DESEMPENHO_COACH_UNLOCK } from '@/lib/desempenho/types';

describe('getE2eDesempenhoEstudoData', () => {
  it('libera coach, mapa e foco no assunto E2E', () => {
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
  });
});
