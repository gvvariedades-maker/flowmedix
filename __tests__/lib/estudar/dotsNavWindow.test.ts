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
  it('mostra todos os dots quando a lista cabe na janela de 5', () => {
    const questoes = makeList(4);
    const items = buildDotsNavWindow(questoes, {
      currentSlug: 'q-2',
      total: 4,
    });

    expect(items).toHaveLength(4);
    expect(items.every((i) => i.type === 'dot')).toBe(true);
  });

  it('limita a 5 dots centrados quando a lista é maior que a janela', () => {
    const questoes = makeList(8);
    const items = buildDotsNavWindow(questoes, {
      currentSlug: 'q-4',
      total: 8,
    });

    expect(items).toHaveLength(DOTS_NAV_VISIBLE_MAX);
    expect(items.map((i) => i.questao.indice)).toEqual([2, 3, 4, 5, 6]);
  });

  it('janela centrada com no máximo 5 dots no meio da lista', () => {
    const questoes = makeList(101, 201);
    const items = buildDotsNavWindow(questoes, {
      currentIndice: 251,
      total: 500,
    });

    expect(items).toHaveLength(DOTS_NAV_VISIBLE_MAX);
    expect(items.map((i) => i.questao.indice)).toEqual([249, 250, 251, 252, 253]);
  });

  it('ancora no início da lista sem dots à esquerda da primeira', () => {
    const questoes = makeList(101);
    const items = buildDotsNavWindow(questoes, {
      currentIndice: 3,
      total: 500,
    });

    expect(items).toHaveLength(DOTS_NAV_VISIBLE_MAX);
    expect(items[0]?.questao.indice).toBe(1);
    expect(items[items.length - 1]?.questao.indice).toBe(5);
  });

  it('ancora no fim da lista sem dots à direita da última', () => {
    const questoes = makeList(101, 400);
    const items = buildDotsNavWindow(questoes, {
      currentIndice: 498,
      total: 500,
    });

    expect(items).toHaveLength(DOTS_NAV_VISIBLE_MAX);
    expect(items[0]?.questao.indice).toBe(496);
    expect(items[items.length - 1]?.questao.indice).toBe(500);
  });

  it('resolve índice atual pelo slug quando currentIndice não é passado', () => {
    const questoes = makeList(101, 50);
    const items = buildDotsNavWindow(questoes, {
      currentSlug: 'q-100',
      total: 200,
    });

    expect(items.some((d) => d.questao.slug === 'q-100')).toBe(true);
    expect(items).toHaveLength(DOTS_NAV_VISIBLE_MAX);
  });

  it('lista vazia retorna vazio', () => {
    expect(buildDotsNavWindow([])).toEqual([]);
  });
});
