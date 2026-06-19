import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SimuladoRunnerClient } from '@/components/simulados/SimuladoRunnerClient';

const mockGetSimuladoSession = jest.fn();
const mockAnswerSimuladoQuestion = jest.fn();
const mockGetSimuladoQuestionPayload = jest.fn();

const mockIniciarSimuladoProva = jest.fn();
const mockFinalizeSimuladoSession = jest.fn();

jest.mock('@/lib/simulado/client', () => ({
  getSimuladoSession: (...args: unknown[]) => mockGetSimuladoSession(...args),
  answerSimuladoQuestion: (...args: unknown[]) => mockAnswerSimuladoQuestion(...args),
  getSimuladoQuestionPayload: (...args: unknown[]) => mockGetSimuladoQuestionPayload(...args),
  iniciarSimuladoProva: (...args: unknown[]) => mockIniciarSimuladoProva(...args),
  finalizeSimuladoSession: (...args: unknown[]) => mockFinalizeSimuladoSession(...args),
  SimuladoApiError: class SimuladoApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/components/simulados/SimuladoResumoClient', () => ({
  SimuladoResumoClient: ({ resumo }: { resumo: { percentual_acerto: number } }) => (
    <div data-testid="simulado-resumo">Resumo {resumo.percentual_acerto}%</div>
  ),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.scrollBy = jest.fn();
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('min-width: 768px'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

const abertaInicial = {
  session: {
    id: '44444444-4444-4444-4444-444444444444',
    status: 'aberto' as const,
    modo: 'treino' as const,
    titulo: '',
    ritmo_meta_segundos_por_questao: null,
    prova_iniciada_em: null,
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
    tempo_total_ms: 0,
    tempo_medio_ms: 0,
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
    modo: 'treino' as const,
    concluida_em: '2026-05-27T00:10:00.000Z',
  },
  resumo: {
    respondidas: 1,
    pendentes: 0,
    acertos: 1,
    erros: 0,
    percentual_acerto: 100,
    tempo_total_ms: 60000,
    tempo_medio_ms: 60000,
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
      tempo_ms: 60000,
    },
  ],
};

describe('SimuladoRunnerClient', () => {
  beforeEach(() => {
    mockGetSimuladoSession.mockReset();
    mockAnswerSimuladoQuestion.mockReset();
    mockGetSimuladoQuestionPayload.mockReset();
    mockIniciarSimuladoProva.mockReset();
    mockFinalizeSimuladoSession.mockReset();
  });

  it('renderiza enunciado completo e exige feedback final antes do resumo', async () => {
    mockGetSimuladoSession.mockResolvedValueOnce(abertaInicial);
    mockGetSimuladoQuestionPayload.mockResolvedValue({
      dados: {
        meta: {
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
        },
        question_data: {
          text_fragment: '<p>Texto base clínico.</p>',
          instruction: '1) Enunciado da questão',
          options: [
            { id: 'A', text: 'Alternativa A' },
            { id: 'B', text: 'Alternativa B' },
          ],
        },
      },
    });
    mockAnswerSimuladoQuestion.mockResolvedValue({
      success: true,
      acertou: true,
      opcao_correta_id: 'A',
      session_status: 'concluido',
      questao_atualizada: concluidaFinal.questoes[0],
      resumo: concluidaFinal.resumo,
    });

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    expect(await screen.findByText('FGV')).toBeInTheDocument();
    expect(await screen.findByText('Urgências - RCP')).toBeInTheDocument();
    expect(await screen.findByText('Texto base clínico.')).toBeInTheDocument();
    expect(await screen.findByText('Enunciado da questão')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /A\) Alternativa A/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar resposta' }));

    await waitFor(() =>
      expect(mockAnswerSimuladoQuestion).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: '44444444-4444-4444-4444-444444444444',
          modulo_slug: 'questao-simulada',
          opcao_id: 'A',
        }),
      ),
    );

    await waitFor(() => expect(mockGetSimuladoSession).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Ver resultado' })).toBeInTheDocument();
    expect(screen.queryByTestId('simulado-resumo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }));
    expect(await screen.findByTestId('simulado-resumo')).toHaveTextContent('Resumo 100%');
  });

  it('mostra gabarito com texto da alternativa quando resposta está incorreta', async () => {
    mockGetSimuladoSession.mockResolvedValueOnce(abertaInicial);
    mockGetSimuladoQuestionPayload.mockResolvedValue({
      dados: {
        meta: {
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
        },
        question_data: {
          instruction: 'Enunciado da questão',
          options: [
            { id: 'A', text: 'Alternativa correta' },
            { id: 'B', text: 'Alternativa incorreta' },
          ],
        },
      },
    });
    mockAnswerSimuladoQuestion.mockResolvedValue({
      success: true,
      acertou: false,
      opcao_correta_id: 'A',
      session_status: 'concluido',
      questao_atualizada: {
        ordem: 1,
        modulo_slug: 'questao-simulada',
        respondida: true as const,
        meta: abertaInicial.questoes[0].meta,
        acertou: false,
        opcao_id: 'B',
        opcao_correta_id: 'A',
        respondida_em: '2026-05-27T00:05:00.000Z',
        tempo_ms: 60000,
      },
      resumo: {
        ...abertaInicial.resumo,
        respondidas: 1,
        pendentes: 0,
        erros: 1,
        percentual_acerto: 0,
        tempo_total_ms: 60000,
        tempo_medio_ms: 60000,
      },
    });

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    await screen.findByText('Enunciado da questão');

    fireEvent.click(screen.getByRole('radio', { name: /B\) Alternativa incorreta/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar resposta' }));

    expect(await screen.findByText('Resposta incorreta.')).toBeInTheDocument();
    expect(await screen.findByText('Gabarito: A — Alternativa correta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver resultado' })).toBeInTheDocument();
  });

  it('modo prova: exibe instruções, inicia cronômetro e oculta gabarito imediato', async () => {
    const provaAberta = {
      ...abertaInicial,
      session: {
        ...abertaInicial.session,
        modo: 'prova' as const,
        titulo: 'Prova Urgências',
        ritmo_meta_segundos_por_questao: 180,
        prova_iniciada_em: null,
      },
    };

    const provaIniciada = {
      ...provaAberta,
      session: {
        ...provaAberta.session,
        prova_iniciada_em: '2026-06-01T12:00:00.000Z',
      },
    };

    mockGetSimuladoSession
      .mockResolvedValueOnce(provaAberta)
      .mockResolvedValueOnce(provaIniciada);
    mockIniciarSimuladoProva.mockResolvedValue(provaIniciada);
    mockGetSimuladoQuestionPayload.mockResolvedValue({
      dados: {
        meta: abertaInicial.questoes[0].meta,
        question_data: {
          instruction: 'Enunciado da prova',
          options: [
            { id: 'A', text: 'Alternativa A' },
            { id: 'B', text: 'Alternativa B' },
          ],
        },
      },
    });
    mockAnswerSimuladoQuestion.mockResolvedValue({
      success: true,
      acertou: true,
      opcao_correta_id: 'A',
      session_status: 'aberto',
      questao_atualizada: {
        ...provaIniciada.questoes[0],
        respondida: true as const,
        acertou: true,
        opcao_id: 'A',
        opcao_correta_id: 'A',
        respondida_em: '2026-06-01T12:01:00.000Z',
        tempo_ms: 5000,
      },
      resumo: {
        ...provaAberta.resumo,
        respondidas: 1,
        pendentes: 0,
        acertos: 1,
        percentual_acerto: 100,
      },
    });

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    expect(await screen.findByRole('heading', { name: 'Prova Urgências' })).toBeInTheDocument();
    const iniciarBtn = screen.getByRole('button', { name: 'Iniciar prova' });
    expect(iniciarBtn).toBeDisabled();
    expect(screen.queryByText(/Meta:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      fireEvent.click(iniciarBtn);
    });

    await waitFor(() => expect(mockIniciarSimuladoProva).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Meta: 00:03:00/)).toBeInTheDocument());

    await screen.findByText('Enunciado da prova');
    fireEvent.click(screen.getByRole('radio', { name: /A\) Alternativa A/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar resposta' }));

    await waitFor(() => expect(mockAnswerSimuladoQuestion).toHaveBeenCalled());
    expect(screen.queryByText('Resposta correta!')).not.toBeInTheDocument();
    expect(
      screen.getAllByText('Resposta registrada. Gabarito disponível no resumo final.').length,
    ).toBeGreaterThan(0);

    const answeredCell = await screen.findByRole('button', { name: 'Questão 1, respondida' });
    expect(answeredCell.className).not.toContain('emerald');
  });

  it('mantém Finalizar simulado no topo junto a Reportar erro', async () => {
    mockGetSimuladoSession.mockResolvedValueOnce(abertaInicial);
    mockGetSimuladoQuestionPayload.mockResolvedValue({
      dados: {
        meta: abertaInicial.questoes[0].meta,
        question_data: {
          instruction: 'Enunciado da questão',
          options: [
            { id: 'A', text: 'Alternativa A' },
            { id: 'B', text: 'Alternativa B' },
          ],
        },
      },
    });

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    await screen.findByText('Enunciado da questão');
    expect(screen.getByRole('button', { name: 'Finalizar simulado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reportar erro' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar resposta' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /A\) Alternativa A/i }));
    expect(screen.getByRole('button', { name: 'Confirmar resposta' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Finalizar simulado' })).toHaveLength(1);
  });

  it('sessão weekly: exibe chip Avaliação semanal no runner', async () => {
    const weeklyAberta = {
      ...abertaInicial,
      session: {
        ...abertaInicial.session,
        modo: 'prova' as const,
        titulo: 'Simulado da Semana #25',
        prova_iniciada_em: '2026-06-01T12:00:00.000Z',
        ritmo_meta_segundos_por_questao: 180,
        filtros: { origem: 'weekly', iso_week: 25 },
      },
    };

    mockGetSimuladoSession.mockResolvedValueOnce(weeklyAberta);
    mockGetSimuladoQuestionPayload.mockResolvedValue({
      dados: {
        meta: abertaInicial.questoes[0].meta,
        question_data: {
          instruction: 'Enunciado da missão',
          options: [
            { id: 'A', text: 'Alternativa A' },
            { id: 'B', text: 'Alternativa B' },
          ],
        },
      },
    });

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    await screen.findByText('Enunciado da missão');
    expect(screen.getByText('Avaliação semanal')).toBeInTheDocument();
  });

  it('sessão diagnóstico: exibe chip na tela de instruções', async () => {
    const diagnosticoAberta = {
      ...abertaInicial,
      session: {
        ...abertaInicial.session,
        modo: 'prova' as const,
        titulo: 'Simulado Diagnóstico Inicial',
        prova_iniciada_em: null,
        ritmo_meta_segundos_por_questao: 180,
        filtros: { tipo: 'diagnostico_inicial', modo: 'prova' },
      },
    };

    mockGetSimuladoSession.mockResolvedValueOnce(diagnosticoAberta);

    render(<SimuladoRunnerClient sessionId="44444444-4444-4444-4444-444444444444" />);

    expect(await screen.findByText('Diagnóstico inicial')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar prova' })).toBeInTheDocument();
  });

});
