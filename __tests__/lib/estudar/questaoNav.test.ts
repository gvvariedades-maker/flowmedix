jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
  revalidateTag: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  getQuestoesByAssuntoCached: jest.fn(),
  getHistoricoQuestoesForSlugsCached: jest.fn(),
  estudadosSetFromHistorico: (
    historico: { modulo_slug: string; estudo_reverso_concluido: boolean }[],
  ) =>
    new Set(
      historico
        .filter((h) => h.estudo_reverso_concluido === true)
        .map((h) => h.modulo_slug),
    ),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  fetchAccessibleModulosForNav: jest.fn(),
}));

import {
  getHistoricoQuestoesForSlugsCached,
  getQuestoesByAssuntoCached,
} from '@/lib/cache';
import { fetchAccessibleModulosForNav } from '@/lib/concursos/entitlements';
import {
  getQuestaoNavList,
  vitrineFiltersToSqlNavFilters,
} from '@/lib/estudar/questaoNav';

const mockFetchNav = fetchAccessibleModulosForNav as jest.MockedFunction<
  typeof fetchAccessibleModulosForNav
>;
const mockHistorico = getHistoricoQuestoesForSlugsCached as jest.MockedFunction<
  typeof getHistoricoQuestoesForSlugsCached
>;
const mockByAssunto = getQuestoesByAssuntoCached as jest.MockedFunction<
  typeof getQuestoesByAssuntoCached
>;

describe('vitrineFiltersToSqlNavFilters', () => {
  it('mapeia banca e assunto para filtros SQL', () => {
    expect(
      vitrineFiltersToSqlNavFilters({ banca: 'CESPE', assunto: 'Urgências', q: 'rcp' }),
    ).toEqual({ banca: 'CESPE', titulo_aula: 'Urgências' });
  });

  it('retorna undefined quando só há busca livre (q)', () => {
    expect(vitrineFiltersToSqlNavFilters({ q: 'rcp' })).toBeUndefined();
  });
});

describe('getQuestaoNavList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('modo assunto: busca por titulo_aula no SQL e histórico só da lista', async () => {
    mockFetchNav.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 'a',
        modulo_nome: null,
        titulo_aula: 'Urgências',
        banca: 'X',
        created_at: '2024-01-01',
        avant_codigo: 1,
      },
      {
        id: '2',
        modulo_slug: 'b',
        modulo_nome: null,
        titulo_aula: 'Urgências',
        banca: 'X',
        created_at: '2024-01-02',
        avant_codigo: 2,
      },
    ]);
    mockHistorico.mockResolvedValue([
      { modulo_slug: 'a', acertou: true, estudo_reverso_concluido: true },
    ]);

    const result = await getQuestaoNavList({
      userId: 'user-1',
      slug: 'b',
      tituloAula: 'Urgências',
    });

    expect(mockFetchNav).toHaveBeenCalledWith('user-1', { titulo_aula: 'Urgências' });
    expect(mockHistorico).toHaveBeenCalledWith('user-1', ['a', 'b']);
    expect(result.lista.map((i) => i.modulo_slug)).toEqual(['a', 'b']);
    expect(result.indexAtual).toBe(1);
    expect(result.questoesDoAssunto[0].estudada).toBe(true);
    expect(result.questoesDoAssunto[1].estudada).toBe(false);
  });

  it('vitrine filtrada: não chama getModulosEstudoVitrine; histórico só dos módulos filtrados', async () => {
    mockFetchNav.mockResolvedValue([
      {
        id: '1',
        modulo_slug: 'q-a',
        modulo_nome: null,
        titulo_aula: 'Urgências',
        banca: 'CESPE',
        created_at: '2024-01-01',
        avant_codigo: 10,
      },
      {
        id: '2',
        modulo_slug: 'q-b',
        modulo_nome: null,
        titulo_aula: 'Urgências',
        banca: 'CESPE',
        created_at: '2024-01-02',
        avant_codigo: 11,
      },
    ]);
    mockHistorico.mockResolvedValue([]);

    const result = await getQuestaoNavList({
      userId: 'user-1',
      slug: 'q-a',
      tituloAula: 'Urgências',
      vitrineFilters: { banca: 'CESPE' },
    });

    expect(mockFetchNav).toHaveBeenCalledWith('user-1', { banca: 'CESPE' });
    expect(mockHistorico).toHaveBeenCalledWith('user-1', ['q-a', 'q-b']);
    const historicoSlugArg = mockHistorico.mock.calls[0]?.[1] as string[] | undefined;
    expect(historicoSlugArg?.length).toBe(2);
    expect(result.lista.map((i) => i.modulo_slug)).toEqual(['q-a', 'q-b']);
    expect(result.indexAtual).toBe(0);
  });

  it('sem userId: usa cache global por assunto', async () => {
    mockByAssunto.mockResolvedValue([
      { id: '1', modulo_slug: 'anon-1' },
      { id: '2', modulo_slug: 'anon-2' },
    ]);

    const result = await getQuestaoNavList({
      slug: 'anon-2',
      tituloAula: 'Farmacologia',
    });

    expect(mockFetchNav).not.toHaveBeenCalled();
    expect(mockByAssunto).toHaveBeenCalledWith('Farmacologia');
    expect(result.indexAtual).toBe(1);
    expect(mockHistorico).not.toHaveBeenCalled();
  });
});
