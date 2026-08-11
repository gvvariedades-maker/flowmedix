import { render, screen } from '@testing-library/react';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import type { DesempenhoEstudoData } from '@/lib/desempenho/types';

function buildData(overrides: Partial<DesempenhoEstudoData> = {}): DesempenhoEstudoData {
  return {
    placar: {
      respondidas: 12,
      acertos: 7,
      erros: 5,
      percentual: 58,
      metaDoDia: { respondidasHoje: 3, meta: 10 },
      coachUnlocked: true,
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
            bancas: ['CPCON'],
          },
        ],
      },
    ],
    riskBands: [
      {
        riskBandId: 'alta_incidencia_protocolo',
        label: 'Alta incidência / protocolo',
        respondidas: 6,
        acertos: 2,
        erros: 4,
        percentual: 33,
        coberturaPct: 40,
        totalDisponivel: 15,
        amostraSuficiente: true,
      },
    ],
    weakAreas: [],
    nextPractice: [
      {
        tituloAula: 'Vias de Administração',
        reason: 'weak_accuracy',
        percentual: 33,
        respondidas: 6,
        erros: 4,
        deepLinkAssunto: 'Vias de Administração',
      },
    ],
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
    },
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
    },
    ...overrides,
  };
}

describe('DesempenhoEstudoDashboard', () => {
  it('mostra placar, mapa, radar, focos e recentes quando o coach está liberado', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    expect(screen.getByLabelText('Placar de estudo')).toBeInTheDocument();
    expect(screen.getAllByText('Respondidas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'Mapa por assunto' })).toBeInTheDocument();
    expect(screen.getAllByText('Farmacologia e Medicamentos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vias de Administração').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Radar de prova' })).toBeInTheDocument();
    expect(screen.getByText('Alta incidência / protocolo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximos focos' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Praticar agora: Vias de Administração/ }),
    ).toHaveAttribute('href', '/estudar?assunto=Vias%20de%20Administra%C3%A7%C3%A3o&status=pending');
    expect(screen.getByRole('heading', { name: 'Tentativas recentes' })).toBeInTheDocument();
    expect(screen.getByText('Reverso')).toBeInTheDocument();
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.queryByLabelText('Evolução de tentativas')).not.toBeInTheDocument();
  });

  it('mostra evolução P4 quando o ledger está disponível', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          attemptSeries: {
            available: true,
            unavailableReason: null,
            daily: [
              { date: '2026-08-10', attempts: 4, acertos: 2, percentual: 50 },
              { date: '2026-08-11', attempts: 2, acertos: 2, percentual: 100 },
            ],
            tempoMedioMs: 4500,
            firstAttemptAccuracyPct: 60,
            attemptsPerQuestionAvg: 1.4,
            totalEvents: 6,
            distinctQuestions: 4,
            dadosDesde: '2026-08-10T10:00:00.000Z',
            coberturaParcial: true,
          },
        })}
      />,
    );

    expect(screen.getByLabelText('Evolução de tentativas')).toBeInTheDocument();
    expect(screen.getByText(/Dados a partir de/)).toBeInTheDocument();
    expect(screen.getByText('Tempo médio')).toBeInTheDocument();
    expect(screen.getByText('Acerto na 1ª tentativa')).toBeInTheDocument();
  });

  it('mostra empty state de coach abaixo de 10 respondidas', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          placar: {
            respondidas: 3,
            acertos: 2,
            erros: 1,
            percentual: null,
            metaDoDia: { respondidasHoje: 1, meta: 10 },
            coachUnlocked: false,
          },
          areas: [],
          riskBands: [],
          nextPractice: [],
        })}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /Responda 10 questões para liberar seu mapa/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para a vitrine' })).toHaveAttribute(
      'href',
      '/estudar',
    );
    expect(screen.queryByRole('heading', { name: 'Mapa por assunto' })).not.toBeInTheDocument();
  });
});
