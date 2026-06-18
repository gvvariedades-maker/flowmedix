import {
  assignWeeklyBucket,
  buildWeeklyQuestionPoolFromScored,
  buildWeeklySimuladoTitulo,
  getIsoWeekInfo,
  resolveWeeklyFocoPrincipal,
  resolveWeeklySimuladoStatus,
  weeklyFiltrosMatchWeek,
  WEEKLY_POOL_BUCKET_SHARES,
} from '@/lib/simulado/weeklySimuladoCore';

describe('getIsoWeekInfo', () => {
  it('retorna semana ISO consistente para uma data fixa', () => {
    const info = getIsoWeekInfo(new Date('2026-06-18T12:00:00'));
    expect(info.isoYear).toBe(2026);
    expect(info.isoWeek).toBeGreaterThanOrEqual(1);
    expect(info.isoWeek).toBeLessThanOrEqual(53);
    expect(info.weekEndsAt.getTime()).toBeGreaterThan(info.weekStart.getTime());
  });
});

describe('buildWeeklySimuladoTitulo', () => {
  it('formata título com número da semana e foco', () => {
    expect(buildWeeklySimuladoTitulo(25, 'Farmacologia')).toBe(
      'Simulado da Semana #25 - Farmacologia',
    );
  });
});

describe('weeklyFiltrosMatchWeek', () => {
  it('identifica sessão semanal da semana correta', () => {
    expect(
      weeklyFiltrosMatchWeek(
        { origem: 'weekly', iso_year: 2026, iso_week: 25 },
        2026,
        25,
      ),
    ).toBe(true);
    expect(
      weeklyFiltrosMatchWeek(
        { origem: 'weekly', iso_year: 2026, iso_week: 24 },
        2026,
        25,
      ),
    ).toBe(false);
  });
});

describe('assignWeeklyBucket', () => {
  const baseContext = {
    historicoSlugs: new Set<string>(['slug-a']),
    wrongSlugs: new Set<string>(),
    preferences: {
      topicos_afinidade: ['Processo de Enfermagem'],
      topicos_dificuldade: ['Farmacologia'],
      bancas_foco: ['CPCON'],
    },
    weakAreas: [],
  };

  it('prioriza revisão para questões erradas', () => {
    expect(
      assignWeeklyBucket(
        {
          modulo_slug: 'slug-erro',
          topico: 'Geral',
          subtopico: 'Teste',
          category: 'weak_area',
        },
        {
          ...baseContext,
          wrongSlugs: new Set(['slug-erro']),
        },
      ),
    ).toBe('review');
  });

  it('classifica fraqueza por tópico declarado', () => {
    expect(
      assignWeeklyBucket(
        {
          modulo_slug: 'slug-farma',
          topico: 'Farmacologia',
          subtopico: 'Doses',
          category: 'not_attempted',
        },
        baseContext,
      ),
    ).toBe('weakness');
  });

  it('classifica não tentadas', () => {
    expect(
      assignWeeklyBucket(
        {
          modulo_slug: 'slug-novo',
          topico: 'Anatomia',
          subtopico: 'Sistema ósseo',
          category: 'not_attempted',
        },
        baseContext,
      ),
    ).toBe('not_attempted');
  });
});

describe('buildWeeklyQuestionPoolFromScored', () => {
  it('monta pool com proporções aproximadas dos buckets', () => {
    const scored = Array.from({ length: 40 }, (_, i) => ({
      modulo_id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      modulo_slug: `slug-${i}`,
      topico: 'T',
      subtopico: 'S',
      banca: 'CPCON',
      priority: i,
      category: 'not_attempted',
      bucket: (['weakness', 'affinity', 'not_attempted', 'review'] as const)[i % 4]!,
    }));

    const pool = buildWeeklyQuestionPoolFromScored(scored, 20);
    expect(pool).toHaveLength(20);
    expect(new Set(pool.map((p) => p.modulo_slug)).size).toBe(20);
    pool.forEach((item, idx) => {
      expect(item.ordem).toBe(idx + 1);
    });
  });

  it('soma das frações alvo é 100%', () => {
    const total = Object.values(WEEKLY_POOL_BUCKET_SHARES).reduce((acc, v) => acc + v, 0);
    expect(total).toBeCloseTo(1, 5);
  });
});

describe('resolveWeeklyFocoPrincipal', () => {
  it('prefere área fraca do analytics', () => {
    expect(
      resolveWeeklyFocoPrincipal(
        [],
        [{ topico: 'Farmacologia', subtopico: 'Doses', total: 10, acertos: 2, percentual: 20 }],
        { topicos_afinidade: [], topicos_dificuldade: ['Imunização'], bancas_foco: [] },
      ),
    ).toBe('Doses');
  });
});

describe('resolveWeeklySimuladoStatus', () => {
  it('mapeia status da sessão', () => {
    expect(resolveWeeklySimuladoStatus({ status: 'concluido' }, 0)).toBe('concluido');
    expect(resolveWeeklySimuladoStatus({ status: 'aberto' }, 0)).toBe('pendente');
    expect(resolveWeeklySimuladoStatus({ status: 'aberto' }, 3)).toBe('em_andamento');
  });
});
