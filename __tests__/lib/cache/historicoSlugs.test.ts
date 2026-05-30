/**
 * Histórico cirúrgico por slugs do contexto (player / vitrine parcial).
 */
jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: jest.fn(),
}));

const historicoRows = [
  { modulo_slug: 'slug-a', acertou: true, estudo_reverso_concluido: true },
  { modulo_slug: 'slug-b', acertou: false, estudo_reverso_concluido: false },
];

const mockSupabaseChain = {
  select: () => mockSupabaseChain,
  eq: () => mockSupabaseChain,
  in: () => Promise.resolve({ data: historicoRows, error: null }),
  order: () => mockSupabaseChain,
  limit: () => Promise.resolve({ data: [], error: null }),
};

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => ({
    from: () => mockSupabaseChain,
  })),
}));

import {
  aggregateNotebookProgress,
  estudadosSetFromHistorico,
  getHistoricoQuestoesForSlugsCached,
} from '@/lib/cache';

describe('getHistoricoQuestoesForSlugsCached', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  it('retorna vazio sem userId', async () => {
    const result = await getHistoricoQuestoesForSlugsCached(undefined, ['slug-a']);
    expect(result).toEqual([]);
  });

  it('retorna vazio com lista de slugs vazia', async () => {
    const result = await getHistoricoQuestoesForSlugsCached('user-1', []);
    expect(result).toEqual([]);
  });

  it('consulta apenas slugs informados', async () => {
    const result = await getHistoricoQuestoesForSlugsCached('user-1', ['slug-a', 'slug-b', 'slug-a']);
    expect(result).toEqual(historicoRows);
  });
});

describe('estudadosSetFromHistorico', () => {
  it('inclui só módulos com estudo reverso concluído', () => {
    const set = estudadosSetFromHistorico(historicoRows);
    expect(set.has('slug-a')).toBe(true);
    expect(set.has('slug-b')).toBe(false);
    expect(set.size).toBe(1);
  });
});

describe('aggregateNotebookProgress', () => {
  it('conta respondidas e estudo reverso com dedupe por slug no histórico', () => {
    const slugs = ['slug-a', 'slug-b', 'slug-c'];
    const historico = [
      { modulo_slug: 'slug-a', estudo_reverso_concluido: true },
      { modulo_slug: 'slug-a', estudo_reverso_concluido: false },
      { modulo_slug: 'slug-b', estudo_reverso_concluido: false },
    ];

    expect(aggregateNotebookProgress(slugs, historico)).toEqual({
      totalQuestions: 3,
      answeredQuestions: 2,
      reversoCompleted: 1,
    });
  });

  it('retorna zeros com caderno vazio', () => {
    expect(aggregateNotebookProgress([], historicoRows)).toEqual({
      totalQuestions: 0,
      answeredQuestions: 0,
      reversoCompleted: 0,
    });
  });

  it('deduplica slugs repetidos no caderno ao contar totalQuestions', () => {
    expect(
      aggregateNotebookProgress(['slug-a', 'slug-a', 'slug-b'], [
        { modulo_slug: 'slug-a', estudo_reverso_concluido: true },
      ]),
    ).toEqual({
      totalQuestions: 2,
      answeredQuestions: 1,
      reversoCompleted: 1,
    });
  });

  it('ignora histórico de slugs fora do caderno', () => {
    expect(
      aggregateNotebookProgress(['slug-a'], [
        { modulo_slug: 'slug-a', estudo_reverso_concluido: false },
        { modulo_slug: 'slug-outro', estudo_reverso_concluido: true },
      ]),
    ).toEqual({
      totalQuestions: 1,
      answeredQuestions: 1,
      reversoCompleted: 0,
    });
  });

  it('marca estudo reverso se qualquer linha duplicada tiver concluído', () => {
    expect(
      aggregateNotebookProgress(['slug-a'], [
        { modulo_slug: 'slug-a', estudo_reverso_concluido: false },
        { modulo_slug: 'slug-a', estudo_reverso_concluido: true },
      ]),
    ).toEqual({
      totalQuestions: 1,
      answeredQuestions: 1,
      reversoCompleted: 1,
    });
  });
});
