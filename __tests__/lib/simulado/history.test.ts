import { loadSimuladoHistory } from '@/lib/simulado/history';

describe('loadSimuladoHistory', () => {
  it('propaga erro quando a query de sessões falha', async () => {
    const supabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'connection refused', code: 'PGRST000' },
        }),
      })),
    };

    await expect(
      loadSimuladoHistory(supabase as never, 'user-1', {
        periodo: '30d',
        modo: 'todos',
        status: 'todos',
        page: 1,
        pageSize: 20,
        banca: null,
        topico: null,
        subtopico: null,
      }),
    ).rejects.toEqual(expect.objectContaining({ message: 'connection refused' }));
  });

  it('propaga erro quando a query de dimensões falha', async () => {
    const dimsResult = {
      data: null,
      error: { message: 'dims query failed', code: 'PGRST000' },
    };
    const dimsChain: {
      select: jest.Mock;
      eq: jest.Mock;
      gte: jest.Mock;
      limit: jest.Mock;
      then: Promise<typeof dimsResult>['then'];
    } = {
      select: jest.fn(),
      eq: jest.fn(),
      gte: jest.fn(),
      limit: jest.fn(),
      then: (onFulfilled, onRejected) =>
        Promise.resolve(dimsResult).then(onFulfilled, onRejected),
    };
    dimsChain.select.mockReturnValue(dimsChain);
    dimsChain.eq.mockReturnValue(dimsChain);
    dimsChain.gte.mockReturnValue(dimsChain);
    dimsChain.limit.mockReturnValue(dimsChain);

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === 'simulado_analytics_session_dims') {
          return dimsChain;
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    };

    await expect(
      loadSimuladoHistory(supabase as never, 'user-1', {
        periodo: '30d',
        modo: 'todos',
        status: 'todos',
        page: 1,
        pageSize: 20,
        banca: 'FGV',
        topico: null,
        subtopico: null,
      }),
    ).rejects.toEqual(expect.objectContaining({ message: 'dims query failed' }));
  });
});
