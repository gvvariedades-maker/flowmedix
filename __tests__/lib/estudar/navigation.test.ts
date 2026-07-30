import {
  applySoftEstudarHistoryUrl,
  buildEstudarCacheKey,
  buildEstudarCacheKeyFromSlugComQuery,
  buildEstudarHref,
  buildEstudarQuestaoApiUrl,
  buildEstudarVitrineHref,
  isEstudarVitrinePathname,
  normalizeSearchForCacheKey,
  parseEstudarSlugFromBrowserPathname,
  parseEstudarSlugFromPathname,
  parseEstudarSlugComQuery,
  shouldSkipEstudarRoutePayloadSync,
  canDismissEstudarViaHistoryBack,
  clearEstudarVitrineReturnEligible,
  markEstudarVitrineReturnEligible,
} from '@/lib/estudar/navigation';

describe('lib/estudar/navigation', () => {
  describe('parseEstudarSlugFromPathname', () => {
    it('retorna slug em /estudar/[slug]', () => {
      expect(parseEstudarSlugFromPathname('/estudar/minha-questao')).toBe('minha-questao');
    });

    it('retorna null na vitrine', () => {
      expect(parseEstudarSlugFromPathname('/estudar')).toBeNull();
      expect(parseEstudarSlugFromPathname('/estudar/')).toBeNull();
    });
  });

  describe('isEstudarVitrinePathname', () => {
    it('identifica vitrine e exclui slug', () => {
      expect(isEstudarVitrinePathname('/estudar')).toBe(true);
      expect(isEstudarVitrinePathname('/estudar/questao-a')).toBe(false);
    });
  });

  describe('parseEstudarSlugFromBrowserPathname', () => {
    it('lê slug da barra de endereço', () => {
      window.history.replaceState(window.history.state, '', '/estudar/q-browser');
      expect(parseEstudarSlugFromBrowserPathname()).toBe('q-browser');
      window.history.replaceState(window.history.state, '', '/estudar');
      expect(parseEstudarSlugFromBrowserPathname()).toBeNull();
    });
  });

  describe('canDismissEstudarViaHistoryBack', () => {
    afterEach(() => {
      clearEstudarVitrineReturnEligible();
    });

    it('permite history.back na vitrine com histórico', () => {
      Object.defineProperty(window.history, 'length', { value: 2, configurable: true });
      window.history.replaceState(window.history.state, '', '/estudar/questao-a');
      markEstudarVitrineReturnEligible();
      expect(canDismissEstudarViaHistoryBack({})).toBe(true);
    });

    it('bloqueia quando há histórico mas sem navegação interna da vitrine', () => {
      Object.defineProperty(window.history, 'length', { value: 2, configurable: true });
      window.history.replaceState(window.history.state, '', '/estudar/questao-a');
      clearEstudarVitrineReturnEligible();
      expect(canDismissEstudarViaHistoryBack({})).toBe(false);
    });

    it('bloqueia quando destino é plano ou caderno', () => {
      Object.defineProperty(window.history, 'length', { value: 2, configurable: true });
      expect(canDismissEstudarViaHistoryBack({ fromPlano: true })).toBe(false);
      expect(canDismissEstudarViaHistoryBack({ fromRevisoes: true })).toBe(false);
      expect(canDismissEstudarViaHistoryBack({ fromCaderno: 'id' })).toBe(false);
    });

    it('bloqueia cold load sem histórico anterior', () => {
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      window.history.replaceState(window.history.state, '', '/estudar/questao-a');
      expect(canDismissEstudarViaHistoryBack({})).toBe(false);
    });
  });

  describe('shouldSkipEstudarRoutePayloadSync', () => {
    it('pula sync quando browser está na vitrine e Next ainda tem slug', () => {
      window.history.replaceState(window.history.state, '', '/estudar?page=2');
      expect(shouldSkipEstudarRoutePayloadSync('questao-a')).toBe(true);
    });

    it('não pula quando browser e Next apontam para a mesma questão', () => {
      window.history.replaceState(window.history.state, '', '/estudar/questao-a');
      expect(shouldSkipEstudarRoutePayloadSync('questao-a')).toBe(false);
    });
  });

  describe('applySoftEstudarHistoryUrl', () => {
    it('retorna pathname e search sem router', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
      const snap = applySoftEstudarHistoryUrl('/estudar/q2?from=caderno&caderno_id=abc');
      expect(snap).toEqual({
        pathname: '/estudar/q2',
        search: '?from=caderno&caderno_id=abc',
      });
      expect(replaceStateSpy).toHaveBeenCalledWith(
        window.history.state,
        '',
        '/estudar/q2?from=caderno&caderno_id=abc',
      );
      replaceStateSpy.mockRestore();
    });
  });

  describe('buildEstudarHref', () => {
    it('monta href com slug simples', () => {
      expect(buildEstudarHref('questao-a')).toBe('/estudar/questao-a');
    });

    it('monta href com query embutida no slugComQuery', () => {
      expect(buildEstudarHref('questao-a?from=plano')).toBe(
        '/estudar/questao-a?from=plano',
      );
    });
  });

  describe('buildEstudarVitrineHref', () => {
    it('preserva filtros da vitrine', () => {
      expect(buildEstudarVitrineHref({ vitrineQuerySuffix: '?banca=FGV&page=2' })).toBe(
        '/estudar?banca=FGV&page=2',
      );
    });

    it('redireciona plano, revisões e caderno', () => {
      expect(buildEstudarVitrineHref({ fromRevisoes: true })).toBe('/revisoes-hoje');
      expect(buildEstudarVitrineHref({ fromPlano: true })).toBe('/plano-diario');
      expect(buildEstudarVitrineHref({ fromCaderno: 'id-1' })).toBe('/cadernos');
    });
  });

  describe('parseEstudarSlugComQuery', () => {
    it('separa slug e search', () => {
      expect(parseEstudarSlugComQuery('foo?from=caderno&caderno_id=abc')).toEqual({
        slug: 'foo',
        search: 'from=caderno&caderno_id=abc',
      });
    });

    it('slug sem query', () => {
      expect(parseEstudarSlugComQuery('bar')).toEqual({ slug: 'bar', search: '' });
    });
  });

  describe('normalizeSearchForCacheKey', () => {
    it('ordena params para chave estável', () => {
      const a = normalizeSearchForCacheKey('banca=X&assunto=Y&q=Z');
      const b = normalizeSearchForCacheKey('q=Z&assunto=Y&banca=X');
      expect(a).toBe(b);
      expect(a).toContain('assunto=Y');
      expect(a).toContain('banca=X');
      expect(a).toContain('q=Z');
    });
  });

  describe('buildEstudarCacheKey', () => {
    it('plano diário', () => {
      expect(
        buildEstudarCacheKey('/estudar/minha-questao', new URLSearchParams('from=plano')),
      ).toBe('minha-questao|from=plano');
    });

    it('caderno', () => {
      expect(
        buildEstudarCacheKey(
          '/estudar/q1',
          new URLSearchParams('from=caderno&caderno_id=id-123'),
        ),
      ).toBe('q1|caderno_id=id-123&from=caderno');
    });

    it('vitrine com múltiplos filtros', () => {
      const key = buildEstudarCacheKey(
        '/estudar/q2',
        new URLSearchParams('banca=CESPE&assunto=Urgências&q=rcp'),
      );
      expect(key).toMatch(/^q2\|/);
      expect(key).toContain('assunto=');
      expect(key).toContain('banca=');
      expect(key).toContain('q=');
    });

    it('sem query retorna só slug', () => {
      expect(buildEstudarCacheKey('/estudar/solo', new URLSearchParams())).toBe('solo');
    });
  });

  describe('buildEstudarCacheKeyFromSlugComQuery', () => {
    it('equivale a pathname + search parseados', () => {
      expect(buildEstudarCacheKeyFromSlugComQuery('x?from=plano')).toBe(
        buildEstudarCacheKey('/estudar/x', new URLSearchParams('from=plano')),
      );
    });
  });

  describe('buildEstudarQuestaoApiUrl', () => {
    it('inclui slug e contexto de query', () => {
      const url = buildEstudarQuestaoApiUrl('minha-q?from=plano');
      expect(url).toMatch(/^\/api\/estudar\/questao\?/);
      const params = new URLSearchParams(url.split('?')[1]);
      expect(params.get('slug')).toBe('minha-q');
      expect(params.get('from')).toBe('plano');
    });

    it('aceita layers=core para prefetch', () => {
      const url = buildEstudarQuestaoApiUrl('minha-q', { layers: 'core' });
      const params = new URLSearchParams(url.split('?')[1]);
      expect(params.get('slug')).toBe('minha-q');
      expect(params.get('layers')).toBe('core');
    });
  });
});
