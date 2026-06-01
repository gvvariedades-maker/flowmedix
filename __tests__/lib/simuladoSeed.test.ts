import {
  answerE2eSimuladoQuestion,
  createE2eSimuladoSession,
  getE2eSimuladoSession,
  iniciarE2eSimuladoProva,
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
    expect(answer?.questao_atualizada.respondida).toBe(true);
    expect(answer?.resumo.respondidas).toBe(1);
    expect(answer?.resumo.pendentes).toBe(0);

    const concluida = getE2eSimuladoSession(E2E_SIMULADO_SESSION_ID);
    expect(concluida?.session.status).toBe('concluido');
    expect(concluida?.resumo.percentual_acerto).toBe(100);
  });

  it('cria sessão prova com titulo e ritmo e inicia prova de forma idempotente', () => {
    createE2eSimuladoSession(1, 'prova', {
      titulo: 'Prova E2E CESPE',
      ritmo_meta_segundos_por_questao: 120,
    });

    const antes = getE2eSimuladoSession(E2E_SIMULADO_SESSION_ID);
    expect(antes?.session.titulo).toBe('Prova E2E CESPE');
    expect(antes?.session.ritmo_meta_segundos_por_questao).toBe(120);
    expect(antes?.session.prova_iniciada_em).toBeNull();

    const first = iniciarE2eSimuladoProva(E2E_SIMULADO_SESSION_ID);
    expect(first?.session.prova_iniciada_em).toBeTruthy();
    const startedAt = first!.session.prova_iniciada_em;

    const second = iniciarE2eSimuladoProva(E2E_SIMULADO_SESSION_ID);
    expect(second?.session.prova_iniciada_em).toBe(startedAt);
  });
});
