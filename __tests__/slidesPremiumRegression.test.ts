/**
 * Regressão Sprint 5: slides legados (sem campos premium) vs payload premium completo.
 */
import { QuestaoCompletaSchema, validateSlides } from '@/lib/validations';

const baseMeta = {
  banca: 'EBSERH',
  topico: 'Urgência',
  subtopico: 'RCP',
};

const baseQuestionData = {
  instruction: 'Assinale a alternativa correta.',
  options: [
    { id: 'A', text: 'Certo', is_correct: true },
    { id: 'B', text: 'Errado', is_correct: false },
  ],
};

/** Sequência clássica de 4 slides sem reveal_mode, correct nem rows. */
const legacySlides = [
  {
    type: 'concept_map',
    items: [{ label: 'Conceito A', detail: 'Detalhe A', icon: 'Sparkles' }],
  },
  {
    type: 'golden_rule',
    content: 'Regra de ouro legada',
  },
  {
    type: 'logic_flow',
    steps: ['Passo 1', 'Passo 2', 'Passo 3'],
  },
  {
    type: 'danger_zone',
    content: 'Cuidado com pegadinhas',
    items: [{ label: 'Erro comum', detail: 'Descrição do erro' }],
  },
] as const;

const premiumSlides = [
  {
    type: 'concept_map',
    chip_label: 'MAPA',
    slide_title: 'Panorama',
    items: [{ label: 'A', detail: 'B', icon: 'Bolt' }],
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    steps: ['Decisão 1', 'Decisão 2'],
  },
  {
    type: 'danger_zone',
    content: 'Armadilhas',
    bullet_style: 'x_icon',
    items: [
      {
        label: 'Trap',
        detail: 'Detalhe trap',
        correct: 'Conduta correta',
      },
    ],
  },
  {
    type: 'golden_rule',
    content: 'Título mnemônico',
    rows: [
      { label: 'PAS', value: '< 90 mmHg' },
      { label: 'FC', value: '> 100 bpm' },
    ],
  },
] as const;

describe('slides premium — regressão legado vs premium', () => {
  it('valida questão com 4 slides legados (sem campos premium)', () => {
    const legacyQuestion = {
      meta: baseMeta,
      question_data: baseQuestionData,
      reverse_study_slides: [...legacySlides],
    };

    const result = QuestaoCompletaSchema.safeParse(legacyQuestion);
    expect(result.success).toBe(true);
    if (result.success) {
      const slides = result.data.reverse_study_slides!;
      expect(slides).toHaveLength(4);
      expect(slides[2].type).toBe('logic_flow');
      expect((slides[2] as { reveal_mode?: string }).reveal_mode).toBeUndefined();
      expect(slides[3].items?.[0]?.correct).toBeUndefined();
      expect((slides[1] as { rows?: unknown[] }).rows).toBeUndefined();
    }
  });

  it('validateSlides aceita mix legado sem erros', () => {
    const result = validateSlides([...legacySlides]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('valida questão premium completa (tap + correct + rows)', () => {
    const premiumQuestion = {
      meta: baseMeta,
      question_data: baseQuestionData,
      reverse_study_slides: [...premiumSlides],
    };

    const result = QuestaoCompletaSchema.safeParse(premiumQuestion);
    expect(result.success).toBe(true);
    if (result.success) {
      const slides = result.data.reverse_study_slides!;
      expect(slides[0].chip_label).toBe('MAPA');
      expect(slides[1].reveal_mode).toBe('tap');
      expect(slides[2].bullet_style).toBe('x_icon');
      expect(slides[2].items?.[0]?.correct).toBe('Conduta correta');
      expect(slides[3].rows).toHaveLength(2);
    }
  });

  it('validateSlides aceita payload premium', () => {
    const result = validateSlides([...premiumSlides]);
    expect(result.valid).toBe(true);
  });
});
