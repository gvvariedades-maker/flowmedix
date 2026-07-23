import {
  buildPayloadCacheKey,
  estudarPayloadMatchesRoute,
  payloadMatchesCacheKey,
} from '@/lib/estudar/payloadRouteMatch';

describe('payloadRouteMatch', () => {
  it('estudarPayloadMatchesRoute compara slug e query de contexto', () => {
    const payload = {
      moduloSlug: 'questao-a',
      vitrineQuerySuffix: '?banca=FGV&page=2',
    };

    expect(
      estudarPayloadMatchesRoute(
        payload,
        '/estudar/questao-a',
        new URLSearchParams('banca=FGV&page=2'),
      ),
    ).toBe(true);

    expect(
      estudarPayloadMatchesRoute(
        payload,
        '/estudar/questao-b',
        new URLSearchParams('banca=FGV&page=2'),
      ),
    ).toBe(false);
  });

  it('buildPayloadCacheKey inclui query normalizada', () => {
    expect(
      buildPayloadCacheKey({
        moduloSlug: 'q-1',
        vitrineQuerySuffix: '?page=2&banca=FGV',
      }),
    ).toBe('q-1|banca=FGV&page=2');
  });

  it('casa disciplina da URL com vitrineQuerySuffix (evita SINCRONIZANDO)', () => {
    const payload = {
      moduloSlug: 'questao-pt',
      vitrineQuerySuffix: '?disciplina=portugues',
    };
    expect(
      estudarPayloadMatchesRoute(
        payload,
        '/estudar/questao-pt',
        new URLSearchParams('disciplina=portugues'),
      ),
    ).toBe(true);
    expect(
      estudarPayloadMatchesRoute(
        { moduloSlug: 'questao-pt', vitrineQuerySuffix: '' },
        '/estudar/questao-pt',
        new URLSearchParams('disciplina=portugues'),
      ),
    ).toBe(false);
  });

  it('payloadMatchesCacheKey rejeita chave com disciplina e suffix vazio', () => {
    expect(
      payloadMatchesCacheKey(
        { moduloSlug: 'q-1', vitrineQuerySuffix: '' },
        'q-1|disciplina=portugues',
      ),
    ).toBe(false);
    expect(
      payloadMatchesCacheKey(
        { moduloSlug: 'q-1', vitrineQuerySuffix: '?disciplina=portugues' },
        'q-1|disciplina=portugues',
      ),
    ).toBe(true);
  });
});
