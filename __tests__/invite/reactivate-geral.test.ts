jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn() },
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

import { createServerSupabase } from '@/lib/supabase/server';
import { reactivateGeralFreeMatricula } from '@/lib/concursos/entitlements';

const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
>;

function buildReactivateSupabaseMock(opts: {
  matricula?: { origem: string; status: string } | null;
  geralId?: string;
}) {
  const update = jest.fn().mockReturnValue({
    eq: () => ({
      eq: async () => ({ error: null }),
    }),
  });

  const from = jest.fn((table: string) => {
    if (table === 'concursos') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: opts.geralId ?? 'geral-id', slug: 'geral' },
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === 'concurso_matriculas') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: opts.matricula ?? null,
                error: null,
              }),
            }),
          }),
        }),
        update,
      };
    }
    throw new Error(`unexpected table ${table}`);
  });

  return { from, update };
}

describe('reactivateGeralFreeMatricula', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reativa matrícula geral expirada de origem invite para cadastro free', async () => {
    const { from, update } = buildReactivateSupabaseMock({
      matricula: { origem: 'invite', status: 'expirado' },
    });
    mockCreateServerSupabase.mockResolvedValue({ from } as never);

    const ok = await reactivateGeralFreeMatricula('user-1');

    expect(ok).toBe(true);
    expect(update).toHaveBeenCalledWith({
      origem: 'cadastro',
      status: 'ativo',
      expires_at: null,
    });
  });

  it('não altera matrícula stripe_pro ativa', async () => {
    const { from, update } = buildReactivateSupabaseMock({
      matricula: { origem: 'stripe_pro', status: 'ativo' },
    });
    mockCreateServerSupabase.mockResolvedValue({ from } as never);

    const ok = await reactivateGeralFreeMatricula('user-1');

    expect(ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('retorna false quando matrícula não está expirada', async () => {
    const { from, update } = buildReactivateSupabaseMock({
      matricula: { origem: 'invite', status: 'ativo' },
    });
    mockCreateServerSupabase.mockResolvedValue({ from } as never);

    const ok = await reactivateGeralFreeMatricula('user-1');

    expect(ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});
