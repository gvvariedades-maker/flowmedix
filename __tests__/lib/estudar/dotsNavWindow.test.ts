import {
  DOTS_NAV_VISIBLE_MAX,
  buildDotsNavWindow,
} from '@/lib/estudar/dotsNavWindow';

function makeList(n: number, startIndice = 1) {
  return Array.from({ length: n }, (_, i) => ({
    slug: `q-${startIndice + i}`,
    estudada: i % 3 === 0,
    indice: startIndice + i,
  }));
}

describe('buildDotsNavWindow', () => {
  it('mostra todos os dots quando a lista cabe no raio', () => {
    const questoes = makeList(8);
    const items = buildDotsNavWindow(questoes, {
      currentSlug: 'q-4',
      total: 8,
    });

    expect(items.filter((i) => i.type === 'dot')).toHaveLength(8);
    expect(items.some((i) => i.type === 'ellipsis')).toBe(false);
  });

  it('janela centrada com ellipsis nos dois lados', () => {
    const questoes = makeList(101, 201);
    const items = buildDotsNavWindow(questoes, {
      currentIndice: 251,
      total: 500,
    });

    const dots = items.filter((i) => i.type === 'dot');
    expect(dots).toHaveLength(DOTS_NAV_VISIBLE_MAX);
    expect(items[0]).toEqual({ type: 'ellipsis', side: 'start' });
    expect(items[items.length - 1]).toEqual({ type: 'ellipsis', side: 'end' });
    expect(dots[0].type === 'dot' && dots[0].questao.indice).toBe(246);
    expect(dots[dots.length - 1].type === 'dot' && dots[dots.length - 1].questao.indice).toBe(
      256,
    );
  });

  it('sem ellipsis à esquerda no início da lista', () => {
    const questoes = makeList(101);
    const items = buildDotsNavWindow(questoes, {
      currentIndice: 3,
      total: 500,
    });

    expect(items[0].type).toBe('dot');
    expect(items.some((i) => i.type === 'ellipsis' && i.side === 'start')).toBe(false);
    expect(items.some((i) => i.type === 'ellipsis' && i.side === 'end')).toBe(true);
  });

  it('sem ellipsis à direita no fim da lista', () => {
    const questoes = makeList(101, 400);
    const items = buildDotsNavWindow(questoes, {
      currentIndice: 498,
      total: 500,
    });

    expect(items[items.length - 1].type).toBe('dot');
    expect(items.some((i) => i.type === 'ellipsis' && i.side === 'end')).toBe(false);
    expect(items.some((i) => i.type === 'ellipsis' && i.side === 'start')).toBe(true);
  });

  it('resolve índice atual pelo slug quando currentIndice não é passado', () => {
    const questoes = makeList(101, 50);
    const items = buildDotsNavWindow(questoes, {
      currentSlug: 'q-100',
      total: 200,
    });

    const dots = items.filter((i) => i.type === 'dot');
    expect(dots.some((d) => d.type === 'dot' && d.questao.slug === 'q-100')).toBe(true);
  });

  it('lista vazia retorna vazio', () => {
    expect(buildDotsNavWindow([])).toEqual([]);
  });
});
