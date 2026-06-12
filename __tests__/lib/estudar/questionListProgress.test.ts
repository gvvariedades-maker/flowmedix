import {
  computeQuestionListProgressPercent,
  computeQuestionListProgressVisualPercent,
  QUESTION_LIST_PROGRESS_MIN_VISUAL_PERCENT,
} from '@/lib/estudar/questionListProgress';

describe('questionListProgress', () => {
  it('calcula percentual exato', () => {
    expect(computeQuestionListProgressPercent(1, 654)).toBeCloseTo(0.1529, 3);
    expect(computeQuestionListProgressPercent(327, 654)).toBeCloseTo(50, 1);
  });

  it('aplica largura mínima visual em listas longas', () => {
    expect(computeQuestionListProgressVisualPercent(1, 654)).toBe(
      QUESTION_LIST_PROGRESS_MIN_VISUAL_PERCENT,
    );
    expect(computeQuestionListProgressVisualPercent(327, 654)).toBeCloseTo(50, 1);
    expect(computeQuestionListProgressVisualPercent(654, 654)).toBe(100);
  });
});
