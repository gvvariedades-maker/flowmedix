import { fireEvent, render, screen, within } from '@testing-library/react';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import type { DesempenhoEstudoData } from '@/lib/desempenho/types';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function buildData(overrides: Partial<DesempenhoEstudoData> = {}): DesempenhoEstudoData {
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
    ],
    riskBands: [
      {
        riskBandId: 'alta_incidencia_protocolo',
        label: 'Protocolo e rotina assistencial',
        respondidas: 6,
        acertos: 2,
        erros: 4,
        percentual: 33,
        coberturaPct: 40,
        totalDisponivel: 15,
        amostraSuficiente: true,
        confidenceId: 'evidencia_moderada',
      },
    ],
    weakAreas: [],
    nextPractice: [
      {
        tituloAula: 'Vias de Administração',
        reason: 'weak_accuracy',
        percentual: 33,
        respondidas: 6,
        acertos: 2,
        erros: 4,
        errosSemReverso: 3,
        coberturaPct: 40,
        totalDisponivel: 15,
        confidenceId: 'evidencia_moderada',
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
    periodoResumo: {
      periodo: 'all',
      startYmd: null,
      endYmdInclusive: '2026-08-11',
      civilDays: null,
    },
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

describe('DesempenhoEstudoDashboard', () => {
  it('mostra placar, ação, panoramas e recentes quando o coach está liberado', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    expect(screen.getByLabelText('Filtros de desempenho')).toBeInTheDocument();
    expect(screen.getByLabelText('Placar de estudo')).toBeInTheDocument();
    expect(screen.getAllByText('Questões analisadas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Praticadas hoje')).toBeInTheDocument();
    expect(
      screen.getByText(/Considerando o período e os filtros selecionados/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hábitos e estudo reverso ficam na aba Atividade/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no histórico/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximos focos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Panorama por áreas' })).toBeInTheDocument();
    expect(screen.getAllByText('Farmacologia e Medicamentos').length).toBeGreaterThan(0);
    expect(screen.getByText('Protocolo e rotina assistencial')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Questões praticadas recentemente' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Evolução de tentativas')).not.toBeInTheDocument();
  });

  it('decide antes de detalhar: ação vem antes da taxonomia', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    const titulos = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent?.trim() ?? '');

    expect(titulos).toEqual([
      'Próximos focos',
      'Panorama por áreas',
      'Panorama por tipo de conteúdo',
      'Questões praticadas recentemente',
    ]);
  });

  it('usa CTA curto com nome do assunto fora do rótulo visível', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    const cta = screen.getByRole('link', {
      name: 'Testar em outra questão de Vias de Administração',
    });
    expect(cta).toHaveTextContent('Testar em outra questão');
    expect(cta).toHaveAttribute(
      'href',
      '/estudar?assunto=Vias%20de%20Administra%C3%A7%C3%A3o&status=pending',
    );
    expect(screen.queryByRole('link', { name: /Praticar agora/ })).not.toBeInTheDocument();
  });

  it('expande a área por controle nativo focável, com aria-expanded e painel oculto', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    const toggle = screen.getByRole('button', { name: /Farmacologia e Medicamentos/ });
    // `<button>` real: Enter/Espaço e Tab funcionam sem handler de teclado próprio.
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).not.toHaveAttribute('tabindex', '-1');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const painel = document.getElementById(toggle.getAttribute('aria-controls')!);
    expect(painel).not.toBeNull();
    expect(painel).toHaveAttribute('hidden');

    toggle.focus();
    expect(toggle).toHaveFocus();
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(painel).not.toHaveAttribute('hidden');
    expect(within(painel as HTMLElement).getByText(/cobertura 40%/)).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(painel).toHaveAttribute('hidden');
  });

  it('abre o mapa completo em um toque', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver mapa completo' }));

    expect(screen.getByRole('button', { name: /Farmacologia e Medicamentos/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Recolher mapa' })).toBeInTheDocument();
  });

  it('mostra evolução P4 quando a série está disponível', () => {
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
            truncated: false,
            limiteRegistros: null,
          },
        })}
      />,
    );

    expect(screen.getByLabelText('Evolução de tentativas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Evolução das tentativas' })).toBeInTheDocument();
    expect(screen.getByText(/Dados a partir de/)).toBeInTheDocument();
    expect(screen.getByText('Tempo médio')).toBeInTheDocument();
    expect(screen.getByText('Acerto na primeira tentativa do período')).toBeInTheDocument();
    expect(screen.queryByText(/Evidence Engine|ledger|upsert/i)).not.toBeInTheDocument();
  });

  it('mantém a série de tentativas visível quando o placar está zerado', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          placar: {
            respondidas: 0,
            acertos: 0,
            erros: 0,
            percentual: null,
            metaDoDia: { respondidasHoje: 0, meta: 10 },
            coachUnlocked: false,
            confidenceId: 'sem_dados',
          },
          areas: [],
          riskBands: [],
          nextPractice: [],
          recentAttempts: [],
          attemptSeries: {
            available: true,
            unavailableReason: null,
            daily: [{ date: '2026-08-10', attempts: 4, acertos: 2, percentual: 50 }],
            tempoMedioMs: 4000,
            firstAttemptAccuracyPct: 50,
            attemptsPerQuestionAvg: 1.2,
            totalEvents: 4,
            distinctQuestions: 3,
            dadosDesde: '2026-08-10T10:00:00.000Z',
            coberturaParcial: false,
            truncated: false,
            limiteRegistros: null,
          },
        })}
      />,
    );

    expect(screen.getByLabelText('Placar de estudo')).toBeInTheDocument();
    expect(screen.getByLabelText('Evolução de tentativas')).toBeInTheDocument();
    expect(
      screen.getByText(/Esta curva conta tentativas registradas no período/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Evidence Engine|ledger/i)).not.toBeInTheDocument();
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
            confidenceId: 'tendencia_inicial',
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
    expect(screen.queryByRole('heading', { name: 'Panorama por áreas' })).not.toBeInTheDocument();
  });

  it('mostra empty state honesto quando não há atividade no recorte', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          placar: {
            respondidas: 0,
            acertos: 0,
            erros: 0,
            percentual: null,
            metaDoDia: { respondidasHoje: 0, meta: 10 },
            coachUnlocked: false,
            confidenceId: 'sem_dados',
          },
          areas: [],
          riskBands: [],
          nextPractice: [],
          recentAttempts: [],
        })}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Nenhuma questão neste período' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Sem questões com alternativa marcada neste período.'),
    ).toBeInTheDocument();
  });

  it('erro de leitura não aparece como desempenho zerado', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          loadState: 'error',
          placar: {
            respondidas: 0,
            acertos: 0,
            erros: 0,
            percentual: null,
            metaDoDia: { respondidasHoje: 0, meta: 10 },
            coachUnlocked: false,
            confidenceId: 'sem_dados',
          },
          areas: [],
          riskBands: [],
          nextPractice: [],
          recentAttempts: [],
        })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /Não conseguimos carregar seu desempenho/,
    );
    expect(screen.getByRole('link', { name: 'Tentar novamente' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Placar de estudo')).not.toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
