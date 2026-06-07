import { parseQuestaoAlvo } from '@/lib/vitrine/parseQuestaoAlvo';

describe('parseQuestaoAlvo', () => {
  it('aceita número da questão no assunto', () => {
    expect(parseQuestaoAlvo('847')).toEqual({ kind: 'numero', value: 847 });
    expect(parseQuestaoAlvo(' 12 ')).toEqual({ kind: 'numero', value: 12 });
  });

  it('aceita código Q- e q', () => {
    expect(parseQuestaoAlvo('Q-1234')).toEqual({ kind: 'codigo', value: 1234 });
    expect(parseQuestaoAlvo('q1234')).toEqual({ kind: 'codigo', value: 1234 });
    expect(parseQuestaoAlvo('q-99')).toEqual({ kind: 'codigo', value: 99 });
  });

  it('rejeita entrada inválida', () => {
    expect(parseQuestaoAlvo('')).toBeNull();
    expect(parseQuestaoAlvo('abc')).toBeNull();
    expect(parseQuestaoAlvo('0')).toBeNull();
    expect(parseQuestaoAlvo('12.5')).toBeNull();
  });
});
