import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SimuladoRunnerClient } from '@/components/simulados/SimuladoRunnerClient';

const mockGetSimuladoSession = jest.fn();
const mockAnswerSimuladoQuestion = jest.fn();
const mockFetchWithAuth = jest.fn();

jest.mock('@/lib/simulado/client', () => ({
  getSimuladoSession: (...args: unknown[]) => mockGetSimuladoSession(...args),
  answerSimuladoQuestion: (...args: unknown[]) => mockAnswerSimuladoQuestion(...args),
  SimuladoApiError: class SimuladoApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

jest.mock('@/lib/api/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

jest.mock('@/components/simulados/SimuladoResumoClient', () => ({
  SimuladoResumoClient: ({ resumo }: { resumo: { percentual_acerto: number } }) => (
    <div data-testid="simulado-resumo">Resumo {resumo.percentual_acerto}%</div>
  ),
}));

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const abertaInicial = {
  session: {
    id: '44444444-4444-4444-4444-444444444444',
    status: 'aberto' as const,
    total_questoes: 1,
    filtros: {},
    created_at: '2026-05-27T00:00:00.000Z',
    concluida_em: null,
  },
  resumo: {
    respondidas: 0,
    pendentes: 1,
    acertos: 0,
    erros: 0,
    percentual_acerto: 0,
  },
  questoes: [
    {
      ordem: 1,
      modulo_slug: 'questao-simulada',
      respondida: false as const,
      meta: {
        banca: 'FGV',
        topico: 'Urgências',
        subtopico: 'RCP',
      },
    },
  ],
};

const concluidaFinal = {
  ...abertaInicial,
  session: {
    ...abertaInicial.session,
    status: 'concluido' as const,
    concluida_em: '2026-05-27T00:10:00.000Z',
  },
  resumo: {
    respondidas: 1,
    pendentes: 0,
    acertos: 1,
    erros: 0,
    percentual_acerto: 100,
  },
  questoes: [
    {
      ordem: 1,
      modulo_slug: 'questao-simulada',
      respondida: true as const,
      meta: {
        banca: 'FGV',
        topico: 'Urgências',
        subtopico: 'RCP',
      },
      acertou: true,
      opcao_id: 'A',
      opcao_correta_id: 'A',
      respondida_em: '2026-05-27T00:05:00.000Z',
    },
  ],
};

describe('SimuladoRunnerClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submete resposta, refaz GET da sessão e transiciona para resumo', async () => {
    mockGetSimuladoSession.mockResolvedValueOnce(abertaInicial).mockResolvedValueOnce(concluidaFinal);
    mockFetchWithAuth.mockResolvedValue(
      jsonResponse({
        dados: {
          question_data: {
            instruction: 'Enunciado da questão',
            options: [
              { id: 'A', text: 'Alternativa A', is_correct: true },
              { id: 'B', text: 'Alternativa B', is_correct: false },
            ],
          },
        },
      }),
    );
    mockAnswerSimuladoQuestion.mockResolvedValue({
      success: true,
      acertou: true,
      opcao_correta_id: 'A',
      session_status: 'concluido',
    });

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    expect(await screen.findByText('Enunciado da questão')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /A\) Alternativa A/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar resposta' }));

    await waitFor(() =>
      expect(mockAnswerSimuladoQuestion).toHaveBeenCalledWith({
        session_id: '44444444-4444-4444-4444-444444444444',
        modulo_slug: 'questao-simulada',
        opcao_id: 'A',
      }),
    );

    await waitFor(() => expect(mockGetSimuladoSession).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('simulado-resumo')).toHaveTextContent('Resumo 100%');
  });

});
