import {
  answerE2eSimuladoQuestion,
  createE2eSimuladoSession,
  getE2eSimuladoSession,
  resetE2eSimuladoStore,
} from '@/lib/e2e/simuladoSeed';
import { E2E_SIMULADO_SESSION_ID, E2E_SIMULADO_SLUG } from '@/lib/e2e/constants';

describe('lib/e2e/simuladoSeed', () => {
  beforeEach(() => {
    resetE2eSimuladoStore();
  });

  it('cria sessão aberta e conclui após resposta correta', () => {
    createE2eSimuladoSession(1);

    const aberta = getE2eSimuladoSession(E2E_SIMULADO_SESSION_ID);
    expect(aberta?.session.status).toBe('aberto');
    expect(aberta?.resumo.pendentes).toBe(1);

    const answer = answerE2eSimuladoQuestion(E2E_SIMULADO_SESSION_ID, E2E_SIMULADO_SLUG, 'A');
    expect(answer?.session_status).toBe('concluido');

    const concluida = getE2eSimuladoSession(E2E_SIMULADO_SESSION_ID);
    expect(concluida?.session.status).toBe('concluido');
    expect(concluida?.resumo.percentual_acerto).toBe(100);
  });
});
