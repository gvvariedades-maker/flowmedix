import { vitrineListQueryKey, type VitrineListQuery } from '@/lib/vitrine/parseListQuery';
import type { VitrinePageResponse } from '@/lib/vitrine/types';

/**
 * Espelha a lógica de `useVitrineListSwr` / VitrineClient:
 * dados com keepPreviousData só são seguros se `listQueryKey` bater com a query atual.
 */
function dataMatchesListQuery(
  data: (VitrinePageResponse & { listQueryKey: string }) | null,
  query: VitrineListQuery,
): boolean {
  return data != null && data.listQueryKey === vitrineListQueryKey(query);
}

const enfermagemPage: VitrinePageResponse & { listQueryKey: string } = {
  groups: [
    {
      titulo_aula: 'Verificação de Sinais Vitais',
      modulo_nome: 'Procedimentos de Enfermagem',
      banca: 'IBFC',
      questoes: [],
      acertos: 0,
      erros: 0,
      totalResolvidas: 0,
      totalQuestoes: 10,
      totalNeuroSlides: 40,
      trabalhadas: 0,
      percentual: 0,
      firstSlug: 'sinais-vitais-1',
    },
  ],
  facets: { bancas: [], assuntos: [] },
  pagination: { page: 1, perPage: 12, totalGroups: 46, totalPages: 4 },
  totalModulosFiltrados: 100,
  listQueryKey: vitrineListQueryKey({
    page: 1,
    bancas: [],
    assuntos: [],
    disciplina: 'enfermagem',
  }),
};

describe('vitrine listQueryKey anti-flash (disciplina)', () => {
  it('detecta payload de Enfermagem enquanto a query já é Português', () => {
    const portuguesQuery: VitrineListQuery = {
      page: 1,
      bancas: [],
      assuntos: [],
      status: 'all',
      view: 'grid',
      disciplina: 'portugues',
    };

    expect(dataMatchesListQuery(enfermagemPage, portuguesQuery)).toBe(false);
  });

  it('aceita payload quando listQueryKey bate com a disciplina pedida', () => {
    const enfermagemQuery: VitrineListQuery = {
      page: 1,
      bancas: [],
      assuntos: [],
      status: 'all',
      view: 'grid',
      disciplina: 'enfermagem',
    };

    expect(dataMatchesListQuery(enfermagemPage, enfermagemQuery)).toBe(true);
  });

  it('chaves de página iguais sem disciplina ainda diferem de portugues', () => {
    const hubKey = vitrineListQueryKey({
      page: 1,
      bancas: [],
      assuntos: [],
      disciplina: null,
    });
    const ptKey = vitrineListQueryKey({
      page: 1,
      bancas: [],
      assuntos: [],
      disciplina: 'portugues',
    });
    expect(hubKey).not.toBe(ptKey);
  });
});
