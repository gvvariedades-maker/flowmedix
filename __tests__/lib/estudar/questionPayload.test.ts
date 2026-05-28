import {
  findCorrectOptionId,
  resolveQuestionAttempt,
  stripQuestionAnswersForClient,
  stripQuestionForSimulado,
} from '@/lib/estudar/questionPayload';
import type { LessonData } from '@/types/lesson';

const questaoCompleta: LessonData = {
  meta: { banca: 'FGV', topico: 'Fundamentos' },
  question_data: {
    instruction: 'Assinale a alternativa correta.',
    options: [
      { id: 'A', text: 'Opção A', is_correct: false },
      { id: 'B', text: 'Opção B', is_correct: true },
      { id: 'C', text: 'Opção C', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'concept_map',
      items: [{ label: 'Conceito', detail: 'Detalhe' }],
    },
  ],
  study_slides: [{ type: 'golden_rule', content: 'Regra' }],
};

describe('stripQuestionAnswersForClient', () => {
  it('remove is_correct das alternativas', () => {
    const stripped = stripQuestionAnswersForClient(questaoCompleta);

    expect(stripped.question_data.options).toEqual([
      { id: 'A', text: 'Opção A' },
      { id: 'B', text: 'Opção B' },
      { id: 'C', text: 'Opção C' },
    ]);
    expect(stripped.meta).toEqual(questaoCompleta.meta);
  });
});

describe('stripQuestionForSimulado', () => {
  it('remove gabarito e NeuroSlides', () => {
    const stripped = stripQuestionForSimulado(questaoCompleta);

    expect(stripped.question_data.options).toEqual([
      { id: 'A', text: 'Opção A' },
      { id: 'B', text: 'Opção B' },
      { id: 'C', text: 'Opção C' },
    ]);
    expect(stripped.meta).toEqual(questaoCompleta.meta);
    expect(stripped).not.toHaveProperty('reverse_study_slides');
    expect(stripped).not.toHaveProperty('study_slides');
  });
});

describe('resolveQuestionAttempt', () => {
  it('identifica acerto e id da alternativa correta', () => {
    expect(resolveQuestionAttempt(questaoCompleta, 'B')).toEqual({
      acertou: true,
      opcaoCorretaId: 'B',
    });
    expect(resolveQuestionAttempt(questaoCompleta, 'A')).toEqual({
      acertou: false,
      opcaoCorretaId: 'B',
    });
  });

  it('retorna null para opção inexistente ou JSON sem gabarito', () => {
    expect(resolveQuestionAttempt(questaoCompleta, 'Z')).toBeNull();
    expect(findCorrectOptionId({ question_data: { options: [{ id: 'A', text: 'x' }] } })).toBeNull();
  });
});
