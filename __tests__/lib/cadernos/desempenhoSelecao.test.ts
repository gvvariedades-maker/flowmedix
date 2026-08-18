/**
 * @jest-environment jsdom
 */
import {
  clearDesempenhoSelecao,
  DESEMPENHO_SELECAO_MAX_ASSUNTOS,
  DESEMPENHO_SELECAO_STORAGE_KEY,
  persistDesempenhoSelecao,
  readDesempenhoSelecao,
} from '@/lib/cadernos/desempenhoSelecao';

describe('lib/cadernos/desempenhoSelecao', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('sem seleção guardada devolve lista vazia', () => {
    expect(readDesempenhoSelecao()).toEqual([]);
  });

  it('grava, deduplica e apara os títulos', () => {
    persistDesempenhoSelecao([' Imunização ', 'Imunização', '', 'Vias de Administração']);
    expect(readDesempenhoSelecao()).toEqual(['Imunização', 'Vias de Administração']);
  });

  it('respeita o teto de assuntos', () => {
    persistDesempenhoSelecao(
      Array.from({ length: DESEMPENHO_SELECAO_MAX_ASSUNTOS + 3 }, (_, i) => `Assunto ${i}`),
    );
    expect(readDesempenhoSelecao()).toHaveLength(DESEMPENHO_SELECAO_MAX_ASSUNTOS);
  });

  it('conteúdo inválido não quebra a leitura', () => {
    window.sessionStorage.setItem(DESEMPENHO_SELECAO_STORAGE_KEY, '{"nao":"array"}');
    expect(readDesempenhoSelecao()).toEqual([]);

    window.sessionStorage.setItem(DESEMPENHO_SELECAO_STORAGE_KEY, 'quebrado');
    expect(readDesempenhoSelecao()).toEqual([]);
  });

  it('limpar remove a seleção para não vazar em outro caderno', () => {
    persistDesempenhoSelecao(['Imunização']);
    clearDesempenhoSelecao();
    expect(readDesempenhoSelecao()).toEqual([]);
  });
});
