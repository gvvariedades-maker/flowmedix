import {
  getAnalyticsPeriodBounds,
  isTimestampInAnalyticsPeriod,
  loadSimuladoAnalyticsSummary,
  normalizeSessionMode,
  normalizeSimuladoAnalyticsFilters,
} from '@/lib/simulado/analyticsSummary';

type QueryResult = { data: unknown[] };

function createSupabaseMock(dataByTable: Record<string, unknown[]>) {
  return {
    from(table: string) {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: (dataByTable[table] ?? []) as QueryResult['data'] }),
      };
      return chain;
    },
  } as any;
}

describe('lib/simulado/analyticsSummary', () => {
  it('normaliza filtros com fallback seguro', () => {
    const result = normalizeSimuladoAnalyticsFilters({
      periodoRaw: 'invalid',
      modoRaw: 'invalid',
      bancaRaw: '  FGV  ',
      assuntoRaw: '  Urgências  ',
      subtopicoRaw: '  RCP  ',
      topicoRaw: null,
    });

    expect(result).toEqual({
      periodo: '30d',
      modo: 'todos',
      banca: 'FGV',
      topico: 'Urgências',
      subtopico: 'RCP',
    });
  });

  it('aceita periodo 1d (Hoje) na normalização', () => {
    expect(
      normalizeSimuladoAnalyticsFilters({ periodoRaw: '1d', modoRaw: 'treino' }),
    ).toEqual({
      periodo: '1d',
      modo: 'treino',
      banca: null,
      topico: null,
      subtopico: null,
    });
  });

  it('periodo 1d limita ao dia civil de Brasília', () => {
    const now = new Date('2026-05-30T18:00:00.000Z');
    const bounds = getAnalyticsPeriodBounds('1d', now);
    expect(bounds.start.toISOString()).toBe('2026-05-30T03:00:00.000Z');
    expect(bounds.endExclusive.toISOString()).toBe('2026-05-31T03:00:00.000Z');
    expect(isTimestampInAnalyticsPeriod('2026-05-29T22:00:00.000Z', bounds)).toBe(false);
    expect(isTimestampInAnalyticsPeriod('2026-05-30T12:00:00.000Z', bounds)).toBe(true);
  });

  it('periodo 1d exclui simulados concluídos em dias anteriores', async () => {
    const now = new Date('2026-05-30T18:00:00.000Z');
    const todayIso = '2026-05-30T12:00:00.000Z';
    const yesterdayIso = '2026-05-29T12:00:00.000Z';

    const supabase = createSupabaseMock({
      simulado_sessions: [
        {
          id: 's1',
          status: 'concluido',
          modo: 'treino',
          percentual_acerto: 80,
          tempo_medio_ms: 40000,
          created_at: todayIso,
          concluida_em: todayIso,
        },
        {
          id: 's2',
          status: 'concluido',
          modo: 'treino',
          percentual_acerto: 60,
          tempo_medio_ms: 50000,
          created_at: yesterdayIso,
          concluida_em: yesterdayIso,
        },
      ],
      simulado_analytics_daily: [],
      simulado_analytics_session_dims: [
        {
          session_id: 's1',
          data_ref: '2026-05-30',
          modo: 'treino',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
          total_questoes: 10,
          acertos: 8,
          erros: 2,
          tempo_total_ms: 400000,
        },
        {
          session_id: 's2',
          data_ref: '2026-05-29',
          modo: 'treino',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
          total_questoes: 10,
          acertos: 6,
          erros: 4,
          tempo_total_ms: 500000,
        },
      ],
    });

    jest.useFakeTimers();
    jest.setSystemTime(now);
    try {
      const summary = await loadSimuladoAnalyticsSummary(supabase, 'user-1', {
        periodo: '1d',
        modo: 'todos',
        banca: null,
        topico: null,
        subtopico: null,
      });
      expect(summary.totalSimulados).toBe(1);
      expect(summary.mediaAcerto).toBe(80);
    } finally {
      jest.useRealTimers();
    }
  });

  it('calcula KPIs, evolução e metas de forma consistente', async () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);

    const supabase = createSupabaseMock({
      simulado_sessions: [
        {
          id: 's1',
          status: 'concluido',
          modo: 'treino',
          percentual_acerto: 80,
          tempo_medio_ms: 40000,
          created_at: `${today}T10:00:00.000Z`,
          concluida_em: `${today}T10:10:00.000Z`,
        },
        {
          id: 's2',
          status: 'concluido',
          filtros: { modo: 'prova' },
          percentual_acerto: 60,
          tempo_medio_ms: 50000,
          created_at: `${yesterday}T10:00:00.000Z`,
          concluida_em: `${yesterday}T10:10:00.000Z`,
        },
      ],
      simulado_analytics_daily: [
        {
          data_ref: yesterday,
          modo: 'prova',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
          total_questoes: 10,
          acertos: 6,
          erros: 4,
          tempo_total_ms: 500000,
        },
        {
          data_ref: today,
          modo: 'treino',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
          total_questoes: 10,
          acertos: 8,
          erros: 2,
          tempo_total_ms: 400000,
        },
      ],
      simulado_analytics_session_dims: [
        {
          session_id: 's1',
          data_ref: today,
          modo: 'treino',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'RCP',
          total_questoes: 10,
          acertos: 8,
          erros: 2,
          tempo_total_ms: 400000,
        },
        {
          session_id: 's2',
          data_ref: yesterday,
          modo: 'prova',
          banca: 'FGV',
          topico: 'Urgências',
          subtopico: 'AVC',
          total_questoes: 10,
          acertos: 6,
          erros: 4,
          tempo_total_ms: 500000,
        },
      ],
    });

    const summary = await loadSimuladoAnalyticsSummary(supabase, 'user-1', {
      periodo: '30d',
      modo: 'todos',
      banca: null,
      topico: null,
      subtopico: null,
    });

    expect(summary.totalSimulados).toBe(2);
    expect(summary.mediaAcerto).toBe(70);
    expect(summary.melhorScore).toBe(80);
    expect(summary.tempoMedioMs).toBe(45000);
    expect(summary.evolucaoTemporal).toHaveLength(2);
    expect(summary.desempenhoPorBanca[0]).toMatchObject({
      nome: 'FGV',
      total_questoes: 20,
      acertos: 14,
      erros: 6,
      percentual_acerto: 70,
    });
    expect(summary.errorPatterns.length).toBeGreaterThan(0);
    expect(summary.goals.progresso_meta_mensal).toBeGreaterThan(0);
  });

  it('normaliza modo da sessão com compatibilidade legado', () => {
    expect(
      normalizeSessionMode({
        id: 'x',
        status: 'concluido',
        modo: 'prova',
        created_at: new Date().toISOString(),
      }),
    ).toBe('prova');

    expect(
      normalizeSessionMode({
        id: 'y',
        status: 'concluido',
        filtros: { modo: 'prova' },
        created_at: new Date().toISOString(),
      }),
    ).toBe('prova');
  });
});
