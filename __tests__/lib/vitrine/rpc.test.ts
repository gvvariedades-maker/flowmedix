jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

import { createServerSupabase } from '@/lib/supabase/server';
import { fetchVitrinePageFromRpc } from '@/lib/vitrine/rpc';

const createServerSupabaseMock = createServerSupabase as jest.Mock;

describe('fetchVitrinePageFromRpc', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aceita payload truncado em questoes[] preservando totalQuestoes agregado', async () => {
    const rpcMock = jest.fn().mockResolvedValue({
      data: {
        groups: [
          {
            titulo_aula: 'Assunto Denso',
            modulo_nome: 'Fundamentos',
            banca: 'FGV',
            questoes: [
              {
                slug: 'q-1',
                numero: 1,
                status: 'nao_estudada',
                avant_codigo: 1001,
                created_at: '2024-01-01T00:00:00Z',
              },
              {
                slug: 'q-2',
                numero: 2,
                status: 'estudada',
                avant_codigo: 1002,
                created_at: '2024-01-02T00:00:00Z',
              },
            ],
            acertos: 10,
            erros: 5,
            totalResolvidas: 15,
            totalQuestoes: 205,
            trabalhadas: 100,
            percentual: 67,
            firstSlug: 'q-1',
          },
        ],
        pagination: {
          page: 1,
          perPage: 12,
          totalGroups: 1,
          totalPages: 1,
        },
        totalModulosFiltrados: 205,
      },
      error: null,
    });

    createServerSupabaseMock.mockResolvedValue({
      rpc: rpcMock,
    });

    const result = await fetchVitrinePageFromRpc({
      userId: 'user-1',
      page: 1,
      filters: { q: 'denso' },
    });

    expect(rpcMock).toHaveBeenCalledWith('get_vitrine_page', {
      p_user_id: 'user-1',
      p_page: 1,
      p_banca: null,
      p_assunto: null,
      p_q: 'denso',
    });
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].questoes).toHaveLength(2);
    expect(result.groups[0].totalQuestoes).toBe(205);
    expect(result.totalModulosFiltrados).toBe(205);
  });

  it('lança erro quando payload RPC não respeita schema esperado', async () => {
    const rpcMock = jest.fn().mockResolvedValue({
      data: {
        groups: [
          {
            titulo_aula: 'Assunto Inválido',
            modulo_nome: 'Fundamentos',
            banca: 'FGV',
            questoes: [],
            acertos: 0,
            erros: 0,
            totalResolvidas: 0,
            totalQuestoes: 1,
            trabalhadas: 0,
            percentual: 0,
            // firstSlug ausente de propósito para quebrar o schema
          },
        ],
        pagination: {
          page: 1,
          perPage: 12,
          totalGroups: 1,
          totalPages: 1,
        },
        totalModulosFiltrados: 1,
      },
      error: null,
    });

    createServerSupabaseMock.mockResolvedValue({
      rpc: rpcMock,
    });

    await expect(
      fetchVitrinePageFromRpc({
        userId: 'user-1',
        page: 1,
      }),
    ).rejects.toThrow('Resposta RPC get_vitrine_page inválida');
  });
});
