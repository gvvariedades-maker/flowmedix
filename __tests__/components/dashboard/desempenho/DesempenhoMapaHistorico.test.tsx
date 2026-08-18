/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DesempenhoMapaDashboard } from '@/components/dashboard/desempenho/DesempenhoMapaDashboard';
import { DesempenhoHistoricoDashboard } from '@/components/dashboard/desempenho/DesempenhoHistoricoDashboard';
import type { DesempenhoEstudoData } from '@/lib/desempenho/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/desempenho/mapa',
}));

function baseData(overrides: Partial<DesempenhoEstudoData> = {}): DesempenhoEstudoData {
  return {
    placar: {
      respondidas: 12,
      acertos: 7,
      erros: 5,
      percentual: 58,
      metaDoDia: { respondidasHoje: 3, meta: 10 },
      coachUnlocked: true,
      confidenceId: 'diagnostico_confiavel',
    },
    assuntos: [],
    areas: [
      {
        areaId: 'farmacologia',
        areaLabel: 'Farmacologia e Medicamentos',
        riskBandId: 'alta_incidencia_protocolo',
        respondidas: 6,
        acertos: 2,
        erros: 4,
        percentual: 33,
        coberturaPct: 40,
        totalDisponivel: 15,
        amostraSuficiente: true,
        confidenceId: 'evidencia_moderada',
        assuntos: [
          {
            tituloAula: 'Vias de Administração',
            canonicalSubtopico: 'Vias de Administração',
            areaId: 'farmacologia',
            areaLabel: 'Farmacologia e Medicamentos',
            riskBandId: 'alta_incidencia_protocolo',
            disciplina: 'enfermagem',
            respondidas: 6,
            acertos: 2,
            erros: 4,
            percentual: 33,
            coberturaPct: 40,
            totalDisponivel: 15,
            ultimaPratica: '2026-08-10T12:00:00.000Z',
            amostraSuficiente: true,
            confidenceId: 'evidencia_moderada',
            errosSemReverso: 3,
            bancas: ['CPCON'],
          },
        ],
      },
      {
        areaId: 'saude_publica',
        areaLabel: 'Saúde Pública e Epidemiologia',
        riskBandId: 'alta_incidencia_protocolo',
        respondidas: 6,
        acertos: 5,
        erros: 1,
        percentual: 83,
        coberturaPct: 50,
        totalDisponivel: 12,
        amostraSuficiente: true,
        confidenceId: 'evidencia_moderada',
        assuntos: [
          {
            tituloAula: 'Imunização',
            canonicalSubtopico: 'Imunização',
            areaId: 'saude_publica',
            areaLabel: 'Saúde Pública e Epidemiologia',
            riskBandId: 'alta_incidencia_protocolo',
            disciplina: 'enfermagem',
            respondidas: 6,
            acertos: 5,
            erros: 1,
            percentual: 83,
            coberturaPct: 50,
            totalDisponivel: 12,
            ultimaPratica: '2026-08-10T12:00:00.000Z',
            amostraSuficiente: true,
            confidenceId: 'evidencia_moderada',
            errosSemReverso: 0,
            bancas: ['CPCON'],
          },
        ],
      },
    ],
    riskBands: [
      {
        riskBandId: 'alta_incidencia_protocolo',
        label: 'Protocolo e rotina assistencial',
        respondidas: 12,
        acertos: 7,
        erros: 5,
        percentual: 58,
        coberturaPct: 40,
        totalDisponivel: 30,
        amostraSuficiente: true,
        confidenceId: 'evidencia_moderada',
      },
    ],
    weakAreas: [],
    nextPractice: [],
    recentAttempts: [
      {
        id: 'h1',
        moduloSlug: 'vias-1',
        tituloAula: 'Vias de Administração',
        acertou: false,
        estudoReversoConcluido: true,
        createdAt: '2026-08-10T12:00:00.000Z',
      },
    ],
    filtersApplied: {
      periodo: 'all',
      banca: null,
      areaId: null,
      disciplina: null,
      assunto: null,
    },
    periodoResumo: {
      periodo: 'all',
      startYmd: null,
      endYmdInclusive: '2026-08-11',
      civilDays: null,
    },
    universoRespondidas: 18,
    assuntoOpcoes: ['Vias de Administração'],
    leituraTruncada: false,
    loadState: 'ok',
    attemptSeries: {
      available: false,
      unavailableReason: 'flag_off',
      daily: [],
      tempoMedioMs: null,
      firstAttemptAccuracyPct: null,
      attemptsPerQuestionAvg: null,
      totalEvents: 0,
      distinctQuestions: 0,
      dadosDesde: null,
      coberturaParcial: false,
      truncated: false,
      limiteRegistros: null,
    },
    ...overrides,
  };
}

describe('DesempenhoMapaDashboard', () => {
  it('mostra todas as áreas e o radar aberto, sem CTA de revelar na home', () => {
    render(<DesempenhoMapaDashboard data={baseData()} />);

    expect(screen.getByRole('link', { name: 'Voltar ao resumo' })).toHaveAttribute(
      'href',
      '/desempenho',
    );
    expect(screen.getByRole('heading', { name: 'Mapa por áreas' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Farmacologia e Medicamentos/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Saúde Pública e Epidemiologia/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver mapa completo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ocultar detalhes' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByTestId('desempenho-universo')).toHaveTextContent(
      'Exibindo 12 de 18 questões',
    );
  });
});

describe('DesempenhoHistoricoDashboard', () => {
  it('filtra resultado por links e pagina com cursor', () => {
    render(
      <DesempenhoHistoricoDashboard
        data={baseData()}
        resultado="erro"
        nextCursor="2026-08-10T12:00:00.000Z|h1"
        totalFiltrado={10}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Histórico de questões' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Erros' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Erros' })).toHaveAttribute(
      'href',
      '/desempenho/historico?resultado=erro',
    );
    expect(screen.getByRole('link', { name: 'Próxima página' })).toHaveAttribute(
      'href',
      '/desempenho/historico?resultado=erro&cursor=2026-08-10T12%3A00%3A00.000Z%7Ch1',
    );
    expect(screen.getByText(/10 questões neste resultado/)).toBeInTheDocument();
    expect(screen.getByTestId('desempenho-universo')).toHaveTextContent(
      'Exibindo 12 de 18 questões',
    );
  });
});
