import {
  clearQuestaoEliminations,
  readQuestaoEliminations,
  writeQuestaoEliminations,
} from '@/lib/estudar/questaoEliminations';

describe('questaoEliminations', () => {
  const slug = 'questao-teste-a';

  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('persiste e restaura eliminações por slug', () => {
    writeQuestaoEliminations(slug, new Set(['B', 'C']));
    expect(readQuestaoEliminations(slug)).toEqual(new Set(['B', 'C']));
    expect(readQuestaoEliminations('outra-questao')).toEqual(new Set());
  });

  it('remove a chave quando o conjunto fica vazio', () => {
    writeQuestaoEliminations(slug, new Set(['A']));
    clearQuestaoEliminations(slug);
    expect(readQuestaoEliminations(slug)).toEqual(new Set());
    expect(window.sessionStorage.getItem('avant:questao-eliminadas:questao-teste-a')).toBeNull();
  });

  it('ignora payload inválido no storage', () => {
    window.sessionStorage.setItem(`avant:questao-eliminadas:${slug}`, '{"x":1}');
    expect(readQuestaoEliminations(slug)).toEqual(new Set());
  });
});
