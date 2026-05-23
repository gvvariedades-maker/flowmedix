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
