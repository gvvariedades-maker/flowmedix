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
            totalNeuroSlides: 820,
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
        facets: {
          bancas: ['FGV', 'CESPE'],
          assuntos: ['Assunto Denso', 'Outro'],
        },
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
      p_bancas: null,
      p_assuntos: null,
      p_q: 'denso',
      p_disciplina: null,
    });
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].questoes).toHaveLength(2);
    expect(result.groups[0].totalQuestoes).toBe(205);
    expect(result.groups[0].totalNeuroSlides).toBe(820);
    expect(result.totalModulosFiltrados).toBe(205);
    expect(result.facets).toEqual({
      bancas: ['FGV', 'CESPE'],
      assuntos: ['Assunto Denso', 'Outro'],
    });
  });

  it('aceita payload sem facets (migration pendente)', async () => {
    const rpcMock = jest.fn().mockResolvedValue({
      data: {
        groups: [],
        pagination: { page: 1, perPage: 12, totalGroups: 0, totalPages: 1 },
        totalModulosFiltrados: 0,
      },
      error: null,
    });

    createServerSupabaseMock.mockResolvedValue({
      rpc: rpcMock,
    });

    const result = await fetchVitrinePageFromRpc({
      userId: 'user-1',
      page: 1,
    });

    expect(result.facets).toBeUndefined();
    expect(result.disciplinas).toBeUndefined();
  });

  it('passa p_disciplina e aceita disciplinas[] da RPC', async () => {
    const disciplinas = [
      {
        id: 'enfermagem' as const,
        label: 'Enfermagem',
        totalAssuntos: 10,
        totalQuestoes: 100,
        trabalhadas: 20,
        progressoPct: 20,
      },
      {
        id: 'portugues' as const,
        label: 'Português',
        totalAssuntos: 2,
        totalQuestoes: 16,
        trabalhadas: 0,
        progressoPct: 0,
      },
    ];
    const rpcMock = jest.fn().mockResolvedValue({
      data: {
        groups: [],
        pagination: { page: 1, perPage: 12, totalGroups: 0, totalPages: 1 },
        totalModulosFiltrados: 0,
        facets: { bancas: [], assuntos: [] },
        disciplinas,
      },
      error: null,
    });

    createServerSupabaseMock.mockResolvedValue({
      rpc: rpcMock,
    });

    const result = await fetchVitrinePageFromRpc({
      userId: 'user-1',
      page: 1,
      filters: { disciplina: 'portugues' },
    });

    expect(rpcMock).toHaveBeenCalledWith('get_vitrine_page', {
      p_user_id: 'user-1',
      p_page: 1,
      p_banca: null,
      p_assunto: null,
      p_bancas: null,
      p_assuntos: null,
      p_q: null,
      p_disciplina: 'portugues',
    });
    expect(result.disciplinas).toEqual(disciplinas);
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
