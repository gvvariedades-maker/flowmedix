import {
  parseVitrineListQuery,
  vitrineFacetsQueryKey,
  vitrineListQueryKey,
} from '@/lib/vitrine/parseListQuery';

describe('parseVitrineListQuery', () => {
  it('defaults when params are empty', () => {
    expect(parseVitrineListQuery({})).toEqual({
      page: 1,
      bancas: [],
      assuntos: [],
      q: undefined,
      status: 'all',
      view: 'grid',
    });
  });

  it('merges banca/assunto aliases like the API', () => {
    expect(
      parseVitrineListQuery({
        page: '2',
        banca: ['FGV', 'CESPE'],
        assunto: 'Urgências',
        q: ' feridas ',
      }),
    ).toEqual({
      page: 2,
      bancas: ['FGV', 'CESPE'],
      assuntos: ['Urgências'],
      q: 'feridas',
      status: 'all',
      view: 'grid',
    });
  });

  it('parseia status e view', () => {
    expect(
      parseVitrineListQuery({
        status: 'pending',
        view: 'compact',
      }),
    ).toEqual({
      page: 1,
      bancas: [],
      assuntos: [],
      q: undefined,
      status: 'pending',
      view: 'compact',
    });
  });
});

describe('vitrine query keys', () => {
  it('list key is stable regardless of array order', () => {
    const a = vitrineListQueryKey({
      page: 1,
      bancas: ['B', 'A'],
      assuntos: ['Y', 'X'],
      q: 'test',
    });
    const b = vitrineListQueryKey({
      page: 1,
      bancas: ['A', 'B'],
      assuntos: ['X', 'Y'],
      q: 'test',
    });
    expect(a).toBe(b);
  });

  it('facets key sorts bancas', () => {
    expect(vitrineFacetsQueryKey(['Z', 'A'])).toBe(vitrineFacetsQueryKey(['A', 'Z']));
  });
});
