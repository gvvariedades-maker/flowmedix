jest.mock('@/lib/cache', () => ({
  getModulosEstudoCached: jest.fn().mockResolvedValue([]),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: () => [],
    set: jest.fn(),
  }),
}));

import {
  computeHybridWeights,
  calculateHybridPriorityScore,
  topicMatchesDeclared,
  HYBRID_WEIGHT_CONFIG,
  type UserDeclaredPreferences,
} from '@/lib/recommendations';
import type { HistoricoQuestao, TopicPerformance, ErrorPattern } from '@/lib/analytics';

describe('computeHybridWeights', () => {
  it('inicia com 50% declarado e reparte o restante entre desempenho e revisão', () => {
    const w = computeHybridWeights(0);
    expect(w.declared).toBe(HYBRID_WEIGHT_CONFIG.INITIAL_DECLARED);
    expect(w.declared + w.performance + w.spacedRepetition).toBeCloseTo(1, 5);
    expect(w.performance).toBeGreaterThan(w.spacedRepetition);
  });

  it('reduz 10 p.p. do peso declarado a cada tentativa', () => {
    expect(computeHybridWeights(1).declared).toBeCloseTo(0.4, 5);
    expect(computeHybridWeights(3).declared).toBeCloseTo(0.2, 5);
    expect(computeHybridWeights(5).declared).toBe(0);
  });

  it('zera peso declarado após 5+ tentativas e concentra em desempenho', () => {
    const w = computeHybridWeights(10);
    expect(w.declared).toBe(0);
    expect(w.performance).toBeCloseTo(0.75, 5);
    expect(w.spacedRepetition).toBeCloseTo(0.25, 5);
  });
});

describe('topicMatchesDeclared', () => {
  it('faz match case-insensitive em tópico e subtópico', () => {
    expect(
      topicMatchesDeclared('Farmacologia', 'farmacologia', null),
    ).toBe(true);
    expect(
      topicMatchesDeclared(
        'Imunização',
        'Saúde Pública',
        'Imunização',
      ),
    ).toBe(true);
  });
});

describe('calculateHybridPriorityScore', () => {
  const emptyHistorico: HistoricoQuestao[] = [];
  const lastAttempts = new Map<string, string>();

  const preferences: UserDeclaredPreferences = {
    topicos_afinidade: ['Processo de Enfermagem'],
    topicos_dificuldade: ['Farmacologia'],
    bancas_foco: ['CPCON'],
  };

  function scoreFor(
    question: {
      modulo_slug: string;
      topico?: string | null;
      subtopico?: string | null;
      banca?: string | null;
    },
    historico: HistoricoQuestao[] = emptyHistorico,
    weakAreas: TopicPerformance[] = [],
    errorPatterns: ErrorPattern[] = [],
    hybridWeights = computeHybridWeights(historico.length),
    declaredPreferences: UserDeclaredPreferences | null = preferences,
  ) {
    return calculateHybridPriorityScore(question, {
      weakAreas,
      errorPatterns,
      historico,
      lastAttempts,
      declaredPreferences,
      hybridWeights,
    });
  }

  it('prioriza tópico de dificuldade declarada quando histórico é vazio', () => {
    const farmaco = scoreFor({
      modulo_slug: 'q-farma',
      topico: 'Farmacologia',
      subtopico: 'Vias de Administração',
      banca: 'CPCON',
    });
    const outro = scoreFor({
      modulo_slug: 'q-outro',
      topico: 'História da Enfermagem',
      banca: 'FGV',
    });

    expect(farmaco.score).toBeGreaterThan(outro.score);
    expect(farmaco.reason).toContain('[declarado]');
    expect(farmaco.reason).toContain('50% declarado');
  });

  it('com histórico extenso, desempenho real supera preferências declaradas na ordenação', () => {
    const historico: HistoricoQuestao[] = Array.from({ length: 6 }, (_, i) => ({
      id: `h-${i}`,
      user_id: 'u1',
      modulo_slug: `slug-${i}`,
      topico: 'Farmacologia',
      subtopico: null,
      banca: 'CPCON',
      acertou: false,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    const weakAreas: TopicPerformance[] = [
      {
        topico: 'Farmacologia',
        total: 6,
        acertos: 1,
        erros: 5,
        percentual: 17,
      },
    ];

    const weightsLate = computeHybridWeights(historico.length);
    expect(weightsLate.declared).toBe(0);

    const farmaco = calculateHybridPriorityScore(
      { modulo_slug: 'slug-0', topico: 'Farmacologia', banca: 'CPCON' },
      {
        weakAreas,
        errorPatterns: [],
        historico,
        lastAttempts,
        declaredPreferences: preferences,
        hybridWeights: weightsLate,
      },
    );

    const outro = calculateHybridPriorityScore(
      { modulo_slug: 'slug-outro', topico: 'História da Enfermagem', banca: 'FGV' },
      {
        weakAreas,
        errorPatterns: [],
        historico,
        lastAttempts,
        declaredPreferences: preferences,
        hybridWeights: weightsLate,
      },
    );

    expect(farmaco.score).toBeGreaterThan(outro.score);
    expect(farmaco.reason).toContain('[desempenho]');
  });

  it('incorpora revisão espaçada por erros recentes', () => {
    const historico: HistoricoQuestao[] = [
      {
        id: 'h1',
        user_id: 'u1',
        modulo_slug: 'slug-rev',
        topico: 'Urgências',
        subtopico: null,
        banca: 'EBSERH',
        acertou: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'h2',
        user_id: 'u1',
        modulo_slug: 'slug-rev',
        topico: 'Urgências',
        subtopico: null,
        banca: 'EBSERH',
        acertou: true,
        created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
      },
      {
        id: 'h3',
        user_id: 'u1',
        modulo_slug: 'slug-rev',
        topico: 'Urgências',
        subtopico: null,
        banca: 'EBSERH',
        acertou: true,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'h4',
        user_id: 'u1',
        modulo_slug: 'slug-rev',
        topico: 'Urgências',
        subtopico: null,
        banca: 'EBSERH',
        acertou: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ];

    const last = new Map([['slug-rev', historico[0].created_at]]);

    const result = calculateHybridPriorityScore(
      { modulo_slug: 'slug-rev', topico: 'Urgências', banca: 'EBSERH' },
      {
        weakAreas: [],
        errorPatterns: [],
        historico,
        lastAttempts: last,
        declaredPreferences: null,
        hybridWeights: computeHybridWeights(historico.length),
      },
    );

    expect(result.category).toBe('spaced_repetition');
    expect(result.reason).toContain('[revisão]');
    expect(result.reason).toContain('erro(s) recente(s)');
  });
});
