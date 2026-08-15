import { fireEvent, render, screen, within } from '@testing-library/react';
import { DesempenhoEstudoDashboard } from '@/components/dashboard/desempenho/DesempenhoEstudoDashboard';
import type {
  AreaPerformance,
  AssuntoPerformance,
  DesempenhoEstudoData,
  PracticeFocus,
  RecentAttempt,
} from '@/lib/desempenho/types';
import type { GrandeAreaId } from '@/lib/desempenho/taxonomiaEnfermagem';

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
      assunto: null,
    },
    periodoResumo: {
      periodo: 'all',
      startYmd: null,
      endYmdInclusive: '2026-08-11',
      civilDays: null,
    },
    universoRespondidas: 12,
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

function buildAssunto(
  tituloAula: string,
  areaId: GrandeAreaId,
  areaLabel: string,
  overrides: Partial<AssuntoPerformance> = {},
): AssuntoPerformance {
  return {
    tituloAula,
    canonicalSubtopico: tituloAula,
    areaId,
    areaLabel,
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
    ...overrides,
  };
}

function buildArea(
  areaId: GrandeAreaId,
  areaLabel: string,
  overrides: Partial<AreaPerformance> = {},
): AreaPerformance {
  const respondidas = overrides.respondidas ?? 6;
  const acertos = overrides.acertos ?? 2;
  const amostraSuficiente = overrides.amostraSuficiente ?? respondidas >= 5;
  const percentual =
    overrides.percentual !== undefined
      ? overrides.percentual
      : amostraSuficiente
        ? Math.round((acertos / respondidas) * 100)
        : null;
  return {
    areaId,
    areaLabel,
    riskBandId: 'alta_incidencia_protocolo',
    respondidas,
    acertos,
    erros: respondidas - acertos,
    percentual,
    coberturaPct: 40,
    totalDisponivel: 15,
    amostraSuficiente,
    confidenceId: amostraSuficiente ? 'evidencia_moderada' : 'tendencia_inicial',
    assuntos: [
      buildAssunto(areaLabel, areaId, areaLabel, {
        respondidas,
        acertos,
        erros: respondidas - acertos,
        percentual,
        amostraSuficiente,
      }),
    ],
    ...overrides,
  };
}

function buildFocus(tituloAula: string, overrides: Partial<PracticeFocus> = {}): PracticeFocus {
  return {
    tituloAula,
    reason: 'weak_accuracy',
    percentual: 33,
    respondidas: 6,
    acertos: 2,
    erros: 4,
    errosSemReverso: 3,
    coberturaPct: 40,
    totalDisponivel: 15,
    confidenceId: 'evidencia_moderada',
    deepLinkAssunto: tituloAula,
    ...overrides,
  };
}

function buildAttempt(id: string, tituloAula: string): RecentAttempt {
  return {
    id,
    moduloSlug: id,
    tituloAula,
    acertou: false,
    estudoReversoConcluido: false,
    createdAt: '2026-08-10T12:00:00.000Z',
  };
}

const AREAS_HOME = [
  buildArea('farmacologia', 'Farmacologia e Medicamentos', {
    respondidas: 8,
    acertos: 2,
    percentual: 25,
  }),
  buildArea('biosseguranca', 'Biossegurança e Controle de Infecção', {
    respondidas: 7,
    acertos: 2,
    percentual: 29,
  }),
  buildArea('procedimentos', 'Procedimentos de Enfermagem', {
    respondidas: 6,
    acertos: 3,
    percentual: 50,
  }),
  buildArea('saude_publica', 'Saúde Pública e Epidemiologia', {
    respondidas: 12,
    acertos: 10,
    percentual: 83,
  }),
];

describe('DesempenhoEstudoDashboard', () => {
  it('mostra placar, ação, panoramas e recentes quando o coach está liberado', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    expect(screen.getByLabelText('Filtros de desempenho')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filtrar/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByTestId('desempenho-universo')).toHaveTextContent(
      'Exibindo 12 de 12 questões',
    );
    expect(screen.getByLabelText('Placar de estudo')).toBeInTheDocument();
    expect(screen.getAllByText('Questões analisadas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Praticadas hoje')).toBeInTheDocument();
    expect(
      screen.getByText(/Considerando o período e os filtros selecionados/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sequência e estudo reverso ficam na aba Hábitos/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no histórico/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximos focos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Panorama por áreas' })).toBeInTheDocument();
    expect(screen.getByText('1 área · 1 com diagnóstico confiável')).toBeInTheDocument();
    expect(screen.getAllByText('Farmacologia e Medicamentos').length).toBeGreaterThan(0);
    expect(screen.getByText(/Menor desempenho: Protocolo e rotina assistencial/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver detalhes' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
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

  it('mostra Exibindo X de Y e aponta Ver mapa completo para a rota dedicada', () => {
    render(<DesempenhoEstudoDashboard data={buildData({ areas: AREAS_HOME })} />);

    expect(screen.getByTestId('desempenho-universo')).toHaveTextContent(
      'Exibindo 12 de 12 questões',
    );
    expect(screen.getByText('4 áreas · 4 com diagnóstico confiável')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Farmacologia e Medicamentos/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Biossegurança e Controle de Infecção/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Procedimentos de Enfermagem/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Saúde Pública e Epidemiologia/ }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Ver mapa completo' })).toHaveAttribute(
      'href',
      '/desempenho/mapa',
    );
  });

  it('mostra 1 foco completo e 2 compactos; o restante abre na seção', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          nextPractice: [
            buildFocus('Vias de Administração'),
            buildFocus('Imunização'),
            buildFocus('Curativos e Manejo de Feridas'),
            buildFocus('Saúde Mental'),
            buildFocus('História da Enfermagem'),
          ],
        })}
      />,
    );

    const focos = screen.getByRole('heading', { name: 'Próximos focos' }).closest('section');
    expect(focos).not.toBeNull();
    const secao = focos as HTMLElement;

    expect(within(secao).getByText('Vias de Administração')).toBeInTheDocument();
    expect(within(secao).getByText('Imunização')).toBeInTheDocument();
    expect(within(secao).getByText('Curativos e Manejo de Feridas')).toBeInTheDocument();
    expect(within(secao).queryByText('Saúde Mental')).not.toBeInTheDocument();
    expect(within(secao).queryByText('História da Enfermagem')).not.toBeInTheDocument();

    fireEvent.click(within(secao).getByRole('button', { name: 'Ver todos os focos (5)' }));

    expect(within(secao).getByText('Saúde Mental')).toBeInTheDocument();
    expect(within(secao).getByText('História da Enfermagem')).toBeInTheDocument();
    expect(within(secao).getByRole('button', { name: 'Recolher focos' })).toBeInTheDocument();
  });

  it('mostra 5 recentes e aponta Ver histórico para a rota dedicada', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          recentAttempts: Array.from({ length: 7 }, (_, i) =>
            buildAttempt(`h-${i + 1}`, `Questão recente ${i + 1}`),
          ),
        })}
      />,
    );

    expect(screen.getByText('Questão recente 1')).toBeInTheDocument();
    expect(screen.getByText('Questão recente 5')).toBeInTheDocument();
    expect(screen.queryByText('Questão recente 6')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver histórico' })).toHaveAttribute(
      'href',
      '/desempenho/historico',
    );
    expect(screen.queryByRole('button', { name: 'Ver histórico' })).not.toBeInTheDocument();
  });

  it('mantém o radar de tipos recolhido até Ver detalhes', () => {
    render(<DesempenhoEstudoDashboard data={buildData()} />);

    const detalhes = screen.getByRole('button', { name: 'Ver detalhes' });
    expect(detalhes).toHaveAttribute('aria-expanded', 'false');
    const painel = document.getElementById(detalhes.getAttribute('aria-controls')!);
    expect(painel).toHaveAttribute('hidden');

    fireEvent.click(detalhes);

    expect(detalhes).toHaveAttribute('aria-expanded', 'true');
    expect(painel).not.toHaveAttribute('hidden');
    expect(screen.getByRole('button', { name: 'Ocultar detalhes' })).toBeInTheDocument();
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

  it('colora o placar: total neutro, acertos verde, erros vermelho, % pelo limiar, meta laranja', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          placar: {
            respondidas: 524,
            acertos: 132,
            erros: 392,
            percentual: 25,
            metaDoDia: { respondidasHoje: 0, meta: 10 },
            coachUnlocked: true,
            confidenceId: 'diagnostico_confiavel',
          },
        })}
      />,
    );

    const placar = screen.getByLabelText('Placar de estudo');
    const card = (label: string) => {
      const node = within(placar).getByText(label).closest('[data-variant]');
      expect(node).not.toBeNull();
      return node as HTMLElement;
    };

    expect(card('Questões analisadas')).toHaveAttribute('data-variant', 'neutral');
    expect(card('Acertos')).toHaveAttribute('data-variant', 'success');
    expect(card('Erros')).toHaveAttribute('data-variant', 'danger');
    expect(card('% acerto')).toHaveAttribute('data-variant', 'danger');
    expect(card('Praticadas hoje')).toHaveAttribute('data-variant', 'warning');
    expect(within(card('% acerto')).getByText('25%')).toBeInTheDocument();
  });

  it('% com amostra pequena não recebe tom conclusivo', () => {
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

    const pct = screen.getByText('% acerto').closest('[data-variant]');
    expect(pct).toHaveAttribute('data-variant', 'neutral');
  });

  it('meta do dia fica verde ao atingir o alvo', () => {
    render(
      <DesempenhoEstudoDashboard
        data={buildData({
          placar: {
            respondidas: 12,
            acertos: 9,
            erros: 3,
            percentual: 75,
            metaDoDia: { respondidasHoje: 10, meta: 10 },
            coachUnlocked: true,
            confidenceId: 'diagnostico_confiavel',
          },
        })}
      />,
    );

    expect(screen.getByText('Praticadas hoje').closest('[data-variant]')).toHaveAttribute(
      'data-variant',
      'success',
    );
    expect(screen.getByText('% acerto').closest('[data-variant]')).toHaveAttribute(
      'data-variant',
      'success',
    );
  });
});
