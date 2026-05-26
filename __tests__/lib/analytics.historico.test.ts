/**
 * Regressão: histórico de analytics não usa cookies dentro de unstable_cache.
 */
jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => {
    throw new Error('cookies() não deve ser chamado no fluxo cacheado de analytics');
  }),
}));

const historicoAnalyticsRows = [
  {
    id: '1',
    user_id: 'user-abc',
    modulo_slug: 'mod-1',
    topico: 'Tópico',
    subtopico: null,
    banca: 'Banca',
    acertou: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

const eqCalls: Array<[string, string]> = [];

const mockSupabaseChain = {
  select: () => mockSupabaseChain,
  eq: (column: string, value: string) => {
    eqCalls.push([column, value]);
    return mockSupabaseChain;
  },
  order: () => mockSupabaseChain,
  limit: () => Promise.resolve({ data: historicoAnalyticsRows, error: null }),
};

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => ({
    from: () => mockSupabaseChain,
  })),
}));

import { createServerSupabase } from '@/lib/supabase/server';
import { getHistoricoCompleto, getHistoricoCompletoUncached } from '@/lib/analytics';

describe('getHistoricoCompleto (analytics cache)', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  beforeEach(() => {
    eqCalls.length = 0;
    jest.clearAllMocks();
  });

  it('usa service role e filtra por user_id', async () => {
    const userId = 'user-abc';
    const result = await getHistoricoCompleto(userId);

    expect(createServerSupabase).toHaveBeenCalled();
    expect(eqCalls).toContainEqual(['user_id', userId]);
    expect(result).toEqual(historicoAnalyticsRows);
  });

  it('getHistoricoCompletoUncached reutiliza o mesmo fetch seguro', async () => {
    const userId = 'user-xyz';
    const result = await getHistoricoCompletoUncached(userId);

    expect(createServerSupabase).toHaveBeenCalled();
    expect(eqCalls).toContainEqual(['user_id', userId]);
    expect(result).toEqual(historicoAnalyticsRows);
  });
});
