import { extractLabGenerateInput } from '@/lib/ai/labGenerateInput';

describe('extractLabGenerateInput', () => {
  const base = {
    meta: {
      banca: 'CPCON',
      topico: 'Enfermagem',
      subtopico: 'Imunização',
      ano: '2025',
      content_standard: 'golden-v1',
    },
    question_data: {
      instruction: 'Sobre vacinas, analise as afirmativas e marque a correta.',
      options: [
        { id: 'A', text: 'I apenas', is_correct: false },
        { id: 'B', text: 'II apenas', is_correct: true },
      ],
    },
    reverse_study_slides: [{ type: 'concept_map', items: [] }],
  };

  it('extrai questão válida preservando campos extras', () => {
    const out = extractLabGenerateInput(base);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.questao.meta.banca).toBe('CPCON');
    expect(out.questao.meta.subtopico).toBe('Imunização');
    expect(out.questao.meta.content_standard).toBe('golden-v1');
    expect(out.questao.question_data.options).toHaveLength(2);
    expect(out.questao.reverse_study_slides).toHaveLength(1);
  });

  it('rejeita sem gabarito', () => {
    const out = extractLabGenerateInput({
      ...base,
      question_data: {
        ...base.question_data,
        options: base.question_data.options.map((o) => ({ ...o, is_correct: false })),
      },
    });
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error).toMatch(/is_correct/);
  });

  it('rejeita instruction curto', () => {
    const out = extractLabGenerateInput({
      ...base,
      question_data: { ...base.question_data, instruction: 'curto' },
    });
    expect(out.ok).toBe(false);
  });
});
