import {
  QUESTAO_NAV_WINDOW_MAX,
  sliceQuestoesNavWindow,
} from '@/lib/estudar/questaoNavWindow';

function makeList(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    slug: `q-${i + 1}`,
    estudada: i % 3 === 0,
  }));
}

describe('sliceQuestoesNavWindow', () => {
  it('retorna lista inteira com índices quando cabe na janela', () => {
    const full = makeList(50);
    const win = sliceQuestoesNavWindow(full, 10);
    expect(win).toHaveLength(50);
    expect(win[0]).toEqual({ slug: 'q-1', estudada: true, indice: 1 });
    expect(win[49].indice).toBe(50);
  });

  it('limita a 101 itens centrados no índice atual', () => {
    const full = makeList(500);
    const win = sliceQuestoesNavWindow(full, 250);
    expect(win).toHaveLength(QUESTAO_NAV_WINDOW_MAX);
    expect(win[0].indice).toBe(201);
    expect(win[win.length - 1].indice).toBe(301);
    expect(win[50].slug).toBe('q-251');
    expect(win[50].indice).toBe(251);
  });

  it('alinha ao início quando perto do começo', () => {
    const full = makeList(300);
    const win = sliceQuestoesNavWindow(full, 5);
    expect(win).toHaveLength(QUESTAO_NAV_WINDOW_MAX);
    expect(win[0].indice).toBe(1);
    expect(win[win.length - 1].indice).toBe(101);
  });

  it('alinha ao fim quando perto do final', () => {
    const full = makeList(300);
    const win = sliceQuestoesNavWindow(full, 295);
    expect(win).toHaveLength(QUESTAO_NAV_WINDOW_MAX);
    expect(win[0].indice).toBe(200);
    expect(win[win.length - 1].indice).toBe(300);
  });

  it('lista vazia retorna vazio', () => {
    expect(sliceQuestoesNavWindow([], 0)).toEqual([]);
  });
});
