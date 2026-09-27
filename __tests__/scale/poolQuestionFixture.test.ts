import {
  isHarnessOpcaoIdValid,
  pickHarnessOpcaoIdFromConteudo,
} from '@/lib/scale/authenticatedHarness/poolQuestionFixture';

const sampleConteudo = {
  question_data: {
    options: [
      { id: 'opt-a', text: 'A', is_correct: false },
      { id: 'opt-b', text: 'B', is_correct: true },
    ],
  },
};

describe('poolQuestionFixture', () => {
  it('escolhe primeira opção válida do conteúdo', () => {
    expect(pickHarnessOpcaoIdFromConteudo(sampleConteudo)).toBe('opt-a');
    expect(isHarnessOpcaoIdValid(sampleConteudo, 'opt-b')).toBe(true);
    expect(isHarnessOpcaoIdValid(sampleConteudo, 'A')).toBe(false);
  });
});
