import {
  labelQuestoes,
  phraseCountQuestoes,
  phraseQuestoesAgendadas,
} from '@/lib/labelQuestoes';

describe('labelQuestoes', () => {
  it('usa singular para 1', () => {
    expect(labelQuestoes(1)).toBe('questão');
  });

  it('usa plural para 0 e 2+', () => {
    expect(labelQuestoes(0)).toBe('questões');
    expect(labelQuestoes(2)).toBe('questões');
    expect(labelQuestoes(200)).toBe('questões');
  });
});

describe('phraseQuestoesAgendadas', () => {
  it('concorda substantivo e adjetivo para 0, 1 e 2+', () => {
    expect(phraseQuestoesAgendadas(0)).toBe('0 questões agendadas');
    expect(phraseQuestoesAgendadas(1)).toBe('1 questão agendada');
    expect(phraseQuestoesAgendadas(2)).toBe('2 questões agendadas');
  });
});

describe('phraseCountQuestoes', () => {
  it('formata contador simples no singular e plural', () => {
    expect(phraseCountQuestoes(1)).toBe('1 questão');
    expect(phraseCountQuestoes(3)).toBe('3 questões');
  });
});