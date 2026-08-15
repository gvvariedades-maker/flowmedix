/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { SimuladosAnalyticsDashboard } from '@/components/simulados/SimuladosAnalyticsDashboard';
import type { SimuladoAnalyticsResponse } from '@/lib/simulado/types';

const mockGetSimuladoAnalytics = jest.fn();

jest.mock('@/lib/simulado/client', () => ({
  getSimuladoAnalytics: (...args: unknown[]) => mockGetSimuladoAnalytics(...args),
  SimuladoApiError: class SimuladoApiError extends Error {},
}));

jest.mock('@/lib/simulado/analyticsTelemetry', () => ({
  createRequestTimer: () => ({ done: () => 1 }),
  trackSimuladoAnalyticsEvent: jest.fn(),
}));

function buildResponse(
  overrides: Partial<SimuladoAnalyticsResponse> = {},
): SimuladoAnalyticsResponse {
  return {
    filters: { periodo: '30d', modo: 'todos', banca: null, topico: null, subtopico: null },
    kpis: {
      total_simulados: 3,
      media_acerto: 52,
      melhor_score: 80,
      tempo_medio_ms: 45_000,
      questoes_concluidas: 62,
      acertos_concluidos: 32,
    },
    evolucao_temporal: [
      {
        data_ref: '2026-08-10',
        total_questoes: 30,
        acertos: 15,
        erros: 15,
        percentual_acerto: 50,
        tempo_total_ms: 900_000,
        tempo_medio_ms: 30_000,
      },
      {
        data_ref: '2026-08-11',
        total_questoes: 32,
        acertos: 17,
        erros: 15,
        percentual_acerto: 53,
        tempo_total_ms: 960_000,
        tempo_medio_ms: 30_000,
      },
    ],
    desempenho: {
      por_banca: [],
      por_topico: [],
      por_subtopico: [
        {
          nome: 'Amostra suficiente',
          total_questoes: 10,
          acertos: 3,
          erros: 7,
          percentual_acerto: 30,
        },
        {
          nome: 'Amostra baixa',
          total_questoes: 2,
          acertos: 0,
          erros: 2,
          percentual_acerto: 0,
        },
      ],
    },
    padroes_erro: [],
    metas_streaks: {
      streaks: { dias_ativos_periodo: 2, streak_atual_dias: 2, melhor_streak_dias: 4 },
      metas: {
        meta_semanal_sessoes: 3,
        sessoes_ultimos_7d: 2,
        progresso_meta_semanal: 66,
        meta_mensal_questoes: 120,
        questoes_ultimos_30d: 62,
        progresso_meta_mensal: 51,
      },
    },
    history_preview: [],
    ...overrides,
  } as SimuladoAnalyticsResponse;
}

function renderDashboard(props: Partial<Parameters<typeof SimuladosAnalyticsDashboard>[0]> = {}) {
  return render(
    <SimuladosAnalyticsDashboard
      periodoAtual="30d"
      modoAtual="todos"
      bancaAtual={null}
      topicoAtual={null}
      subtopicoAtual={null}
      {...props}
    />,
  );
}

describe('SimuladosAnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSimuladoAnalytics.mockResolvedValue(buildResponse());
  });

  it('mostra skeleton antes dos dados e KPIs com a fração da amostra', async () => {
    renderDashboard();

    expect(screen.getAllByTestId('simulados-skeleton').length).toBeGreaterThan(0);

    // 32/62 = 51,6% → mesmo valor aparece no KPI e no resumo do período.
    await waitFor(() => {
      expect(screen.getAllByText('52%').length).toBeGreaterThan(0);
    });
    expect(
      screen.getByText('32 acertos em 62 respondidas · Simulado com 62 questões'),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId('simulados-skeleton')).toHaveLength(0);
  });

  it('mostra 0%, 2 respondidas e 10 questões da prova juntas, sem mudar o denominador', async () => {
    mockGetSimuladoAnalytics.mockResolvedValue(
      buildResponse({
        kpis: {
          total_simulados: 1,
          media_acerto: 0,
          melhor_score: 0,
          tempo_medio_ms: null,
          questoes_concluidas: 10,
          acertos_concluidos: 0,
        },
        evolucao_temporal: [
          {
            data_ref: '2026-08-10',
            total_questoes: 2,
            acertos: 0,
            erros: 2,
            percentual_acerto: 0,
            tempo_total_ms: 60_000,
            tempo_medio_ms: 30_000,
          },
        ],
      }),
    );

    renderDashboard();

    expect(await screen.findByText('0%')).toBeInTheDocument();
    expect(
      screen.getByText(/0 acertos em 2 respondidas · Simulado com 10 questões/),
    ).toBeInTheDocument();
    const respondidasCard = screen
      .getByText(/não é o tamanho da prova/)
      .closest('.metric-card');
    expect(respondidasCard).not.toBeNull();
    expect(within(respondidasCard as HTMLElement).getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/em branco/i)).not.toBeInTheDocument();
  });

  it('mostra 10% quando 1 acerto em 2 respondidas numa prova de 10 (denominador da prova)', async () => {
    mockGetSimuladoAnalytics.mockResolvedValue(
      buildResponse({
        kpis: {
          total_simulados: 1,
          media_acerto: 10,
          melhor_score: 10,
          tempo_medio_ms: null,
          questoes_concluidas: 10,
          acertos_concluidos: 1,
        },
        evolucao_temporal: [
          {
            data_ref: '2026-08-10',
            total_questoes: 2,
            acertos: 1,
            erros: 1,
            percentual_acerto: 50,
            tempo_total_ms: 60_000,
            tempo_medio_ms: 30_000,
          },
        ],
      }),
    );

    renderDashboard();

    expect(await screen.findByText('10%')).toBeInTheDocument();
    const desempenhoCard = screen.getByText('Desempenho no período').closest('.metric-card');
    expect(desempenhoCard).not.toBeNull();
    expect(within(desempenhoCard as HTMLElement).getByText('10%')).toBeInTheDocument();
    expect(
      screen.getByText(/1 acerto em 2 respondidas · Simulado com 10 questões/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Percentual sobre o total das provas/)).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.queryByText(/em branco/i)).not.toBeInTheDocument();
  });

  it('envia banca, tópico e subtópico na chamada da API', async () => {
    renderDashboard({ bancaAtual: 'FGV', topicoAtual: 'Urgências', subtopicoAtual: 'RCP' });

    await waitFor(() => {
      expect(mockGetSimuladoAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          periodo: '30d',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
        }),
      );
    });
  });

  it('mostra os filtros aplicados com link para remover, preservando os outros', async () => {
    renderDashboard({ bancaAtual: 'FGV', subtopicoAtual: 'RCP' });

    const grupo = await screen.findByRole('group', { name: 'Filtros aplicados' });
    const remover = within(grupo).getByRole('link', { name: /Remover filtro de Banca/ });
    expect(remover).toHaveAttribute('href', '/desempenho/simulados?periodo=30d&modo=todos&subtopico=RCP');
    expect(within(grupo).getByText(/Subtópico: RCP/)).toBeInTheDocument();
  });

  it('trocar de período mantém as dimensões no href', async () => {
    renderDashboard({ bancaAtual: 'FGV' });

    await waitFor(() => expect(mockGetSimuladoAnalytics).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: '7 dias' })).toHaveAttribute(
      'href',
      '/desempenho/simulados?periodo=7d&modo=todos&banca=FGV',
    );
  });

  it('não ranqueia prioridade com amostra abaixo do piso', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Amostra suficiente')).toBeInTheDocument();
    });
    expect(screen.queryByText('Amostra baixa')).not.toBeInTheDocument();
    expect(screen.getByText(/3\/10 questões/)).toBeInTheDocument();
  });

  it('0% com amostra pequena não recebe tom positivo nem percentual', async () => {
    mockGetSimuladoAnalytics.mockResolvedValue(
      buildResponse({
        kpis: {
          total_simulados: 1,
          media_acerto: 0,
          melhor_score: 0,
          tempo_medio_ms: null,
          questoes_concluidas: 2,
          acertos_concluidos: 0,
        },
        evolucao_temporal: [],
        desempenho: { por_banca: [], por_topico: [], por_subtopico: [] },
      }),
    );

    renderDashboard();

    const valor = await screen.findByText('0/2 questões');
    expect(valor.className).not.toContain('success');
    expect(screen.getByText(/% a partir de 5 questões/)).toBeInTheDocument();
  });

  it('tendência com menos de 4 pontos não afirma "Estável"', async () => {
    mockGetSimuladoAnalytics.mockResolvedValue(buildResponse());
    renderDashboard();

    expect(await screen.findByText('Tendência ainda indisponível')).toBeInTheDocument();
    expect(screen.queryByText('Estável')).not.toBeInTheDocument();
    expect(screen.getByText(/Faltam 2 dias com simulado/)).toBeInTheDocument();
  });

  it('erro mostra alerta com retry e não exibe KPI zerado', async () => {
    mockGetSimuladoAnalytics.mockRejectedValueOnce(new Error('boom'));
    mockGetSimuladoAnalytics.mockResolvedValue(buildResponse());

    renderDashboard();

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(/Não foi possível carregar o analytics de simulados/);

    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));

    await waitFor(() => {
      expect(screen.getAllByText('52%').length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('compara com "Últimos 12 meses", sem rótulo "Geral (histórico)"', async () => {
    renderDashboard();

    expect(await screen.findByText('Últimos 12 meses')).toBeInTheDocument();
    expect(screen.queryByText(/Geral \(histórico\)/)).not.toBeInTheDocument();
  });
});
