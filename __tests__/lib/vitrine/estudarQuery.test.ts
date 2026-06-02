import { buildVitrineEstudarQuery, buildVitrineSlugComQueryFromList } from '@/lib/vitrine/estudarQuery';
import { vitrineListQueryKey } from '@/lib/vitrine/parseListQuery';
import { normalizeSearchForCacheKey } from '@/lib/estudar/navigation';

describe('buildVitrineEstudarQuery', () => {
  it('monta query com banca, assunto, q e page', () => {
    expect(
      buildVitrineEstudarQuery({
        bancas: ['FGV', 'CESPE'],
        assuntos: ['Urgências'],
        q: 'rcp',
        page: 2,
      }),
    ).toBe('?banca=FGV&banca=CESPE&assunto=Urg%C3%AAncias&q=rcp&page=2');
  });

  it('omite page quando é 1', () => {
    expect(
      buildVitrineEstudarQuery({
        bancas: [],
        assuntos: [],
        q: undefined,
        page: 1,
      }),
    ).toBe('');
  });

  it('alinha chave de prefetch com lista (debounced q + page efetiva)', () => {
    const listQuery = {
      page: 3,
      bancas: ['IBFC'],
      assuntos: ['Farmacologia'],
      q: 'dose',
    };
    const estudarQuery = buildVitrineEstudarQuery(listQuery);
    const slugComQuery = buildVitrineSlugComQueryFromList('slug-x', listQuery);

    expect(slugComQuery).toBe(`slug-x${estudarQuery}`);
    expect(normalizeSearchForCacheKey(estudarQuery.slice(1))).toBe(
      normalizeSearchForCacheKey(
        new URLSearchParams({
          banca: 'IBFC',
          assunto: 'Farmacologia',
          q: 'dose',
          page: '3',
        }).toString(),
      ),
    );
    expect(vitrineListQueryKey(listQuery)).toContain('"page":3');
  });
});
