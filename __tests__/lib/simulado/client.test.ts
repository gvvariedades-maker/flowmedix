import {
  answerSimuladoQuestion,
  createSimuladoSession,
  getSimuladoSession,
  SimuladoApiError,
} from '@/lib/simulado/client';
import { isSimuladoQuestaoRespondida } from '@/lib/simulado/types';

const mockFetchWithAuth = jest.fn();

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('lib/simulado/client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria sessão com payload validado e retorna resultado', async () => {
    mockFetchWithAuth.mockResolvedValue(
      jsonResponse({
        success: true,
        session: {
          id: '11111111-1111-1111-1111-111111111111',
          total_questoes: 20,
          status: 'aberto',
          created_at: '2026-05-27T00:00:00.000Z',
        },
        questoes: [{ modulo_slug: 'questao-a', ordem: 1 }],
      }),
    );

    const result = await createSimuladoSession({
      quantidade: 20,
      banca: 'FGV',
      assunto: 'Urgências',
      q: 'reanimação',
    });

    expect(mockFetchWithAuth).toHaveBeenCalledWith('/api/simulado/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantidade: 20,
        banca: 'FGV',
        assunto: 'Urgências',
        q: 'reanimação',
      }),
    });
    expect(result.session.id).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('lança SimuladoApiError com detalhes no erro do backend', async () => {
    mockFetchWithAuth.mockResolvedValue(
      jsonResponse(
        {
          error: 'Payload inválido',
          details: { fieldErrors: { quantidade: ['Mínimo 1'] } },
        },
        400,
      ),
    );

    await expect(createSimuladoSession({ quantidade: 0 })).rejects.toMatchObject({
      name: 'SimuladoApiError',
      status: 400,
      message: 'Payload inválido',
      details: { fieldErrors: { quantidade: ['Mínimo 1'] } },
    });
  });

  it('busca sessão por id e responde questão com rotas corretas', async () => {
    mockFetchWithAuth
      .mockResolvedValueOnce(
        jsonResponse({
          session: {
            id: '22222222-2222-2222-2222-222222222222',
            status: 'aberto',
            total_questoes: 2,
            filtros: {},
            created_at: '2026-05-27T00:00:00.000Z',
            concluida_em: null,
          },
          resumo: { respondidas: 1, pendentes: 1, acertos: 1, erros: 0, percentual_acerto: 100 },
          questoes: [],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          acertou: false,
          opcao_correta_id: 'B',
          session_status: 'aberto',
        }),
      );

    const session = await getSimuladoSession('22222222-2222-2222-2222-222222222222');
    const answer = await answerSimuladoQuestion({
      session_id: '22222222-2222-2222-2222-222222222222',
      modulo_slug: 'questao-b',
      opcao_id: 'A',
    });

    expect(mockFetchWithAuth).toHaveBeenNthCalledWith(
      1,
      '/api/simulado/sessions/22222222-2222-2222-2222-222222222222',
    );
    expect(mockFetchWithAuth).toHaveBeenNthCalledWith(2, '/api/simulado/responder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: '22222222-2222-2222-2222-222222222222',
        modulo_slug: 'questao-b',
        opcao_id: 'A',
      }),
    });
    expect(session.session.status).toBe('aberto');
    expect(answer.opcao_correta_id).toBe('B');
  });
});

describe('lib/simulado/types guards', () => {
  it('diferencia questão respondida e não respondida', () => {
    const naoRespondida = {
      ordem: 1,
      modulo_slug: 'q1',
      respondida: false as const,
      meta: { banca: null, topico: null, subtopico: null },
    };
    const respondida = {
      ordem: 2,
      modulo_slug: 'q2',
      respondida: true as const,
      meta: { banca: 'FGV', topico: 'Urgências', subtopico: 'RCP' },
      acertou: true,
      opcao_id: 'A',
      opcao_correta_id: 'A',
      respondida_em: '2026-05-27T00:00:00.000Z',
    };

    expect(isSimuladoQuestaoRespondida(naoRespondida)).toBe(false);
    expect(isSimuladoQuestaoRespondida(respondida)).toBe(true);
  });
});
