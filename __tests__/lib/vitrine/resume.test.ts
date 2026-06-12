jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

const historicoRow = {
  modulo_slug: 'questao-resume-1',
  created_at: '2026-06-01T12:00:00.000Z',
};

const mockHistoricoChain = {
  select: jest.fn(() => mockHistoricoChain),
  eq: jest.fn(() => mockHistoricoChain),
  order: jest.fn(() => mockHistoricoChain),
  limit: jest.fn(() => mockHistoricoChain),
  maybeSingle: jest.fn(async () => ({ data: historicoRow, error: null })),
};

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(async () => ({
    from: jest.fn(() => mockHistoricoChain),
  })),
}));

jest.mock('@/lib/cache', () => {
  const actual = jest.requireActual('@/lib/cache');
  return {
    ...actual,
    getQuestaoBySlugCached: jest.fn(async (slug: string) =>
      slug === 'questao-resume-1'
        ? {
            titulo_aula: 'Verificação de Sinais Vitais',
            avant_codigo: 42,
          }
        : null,
    ),
  };
});

import { createServerSupabase } from '@/lib/supabase/server';
import { getLastStudiedQuestaoCached } from '@/lib/vitrine/resume';

describe('getLastStudiedQuestaoCached', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHistoricoChain.maybeSingle.mockResolvedValue({ data: historicoRow, error: null });
  });

  it('retorna hint com titulo e código da questão', async () => {
    const result = await getLastStudiedQuestaoCached('user-abc');

    expect(createServerSupabase).toHaveBeenCalled();
    expect(mockHistoricoChain.eq).toHaveBeenCalledWith('user_id', 'user-abc');
    expect(result).toEqual({
      moduloSlug: 'questao-resume-1',
      questaoSlug: 'questao-resume-1',
      tituloAula: 'Verificação de Sinais Vitais',
      avantCodigo: 42,
      studiedAt: '2026-06-01T12:00:00.000Z',
    });
  });

  it('retorna null sem userId', async () => {
    await expect(getLastStudiedQuestaoCached('')).resolves.toBeNull();
  });

  it('retorna null quando não há histórico', async () => {
    mockHistoricoChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(getLastStudiedQuestaoCached('user-empty')).resolves.toBeNull();
  });
});
