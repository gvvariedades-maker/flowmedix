/**
 * Regressão Sprint 5: slides legados (sem campos premium) vs payload premium completo.
 * Fase C: defaults de render (tap / x_icon no compare) vivem no NeuroSlide — JSON legado
 * continua sem reveal_mode/bullet_style no schema.
 */
import { QuestaoCompletaSchema, validateSlides } from '@/lib/validations';
import { resolveDangerZoneLayoutVariant } from '@/components/slides/core/dangerZoneLayout';
import { resolveLogicFlowRevealMode } from '@/components/slides/core/logicFlowRevealMode';

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
      // Normalização v2: concept_map → logic_flow → golden_rule → danger_zone
      expect(slides[1].type).toBe('logic_flow');
      expect((slides[1] as { reveal_mode?: string }).reveal_mode).toBeUndefined();
      const legacyGolden = slides[2];
      if (legacyGolden.type === 'golden_rule') {
        expect(legacyGolden.rows).toBeUndefined();
      }
      const legacyDanger = slides[3];
      if (legacyDanger.type === 'danger_zone') {
        expect(legacyDanger.items?.[0]?.correct).toBeUndefined();
      }
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
      const logicSlide = slides[1];
      if (logicSlide.type === 'logic_flow') {
        expect(logicSlide.reveal_mode).toBe('tap');
      }
      const goldenSlide = slides[2];
      if (goldenSlide.type === 'golden_rule') {
        expect(goldenSlide.rows).toHaveLength(2);
      }
      const dangerSlide = slides[3];
      if (dangerSlide.type === 'danger_zone') {
        expect(dangerSlide.bullet_style).toBe('x_icon');
        expect(dangerSlide.items?.[0]?.correct).toBe('Conduta correta');
      }
    }
  });

  it('validateSlides aceita payload premium', () => {
    const result = validateSlides([...premiumSlides]);
    expect(result.valid).toBe(true);
  });

  it('Fase C: compare sem bullet_style no JSON — default de render é x_icon (resolver)', () => {
    const dangerSlide = {
      type: 'danger_zone',
      content: 'Armadilhas',
      items: [{ label: 'Trap', detail: 'X', correct: 'Certo' }],
    };
    const layout = resolveDangerZoneLayoutVariant(dangerSlide, undefined, 'list');
    expect(layout).toBe('compare');
    const defaultBullet = layout === 'compare' ? 'x_icon' : 'numbered';
    expect(defaultBullet).toBe('x_icon');
  });

  it('legado logic_flow sem reveal_mode no JSON permanece válido (default tap só no player)', () => {
    const legacyLogic = legacySlides[2];
    expect((legacyLogic as { reveal_mode?: string }).reveal_mode).toBeUndefined();
    const result = validateSlides([legacyLogic]);
    expect(result.valid).toBe(true);
  });

  it('C+: legado com 3 passos → tap; 2 passos → auto (resolver)', () => {
    expect(resolveLogicFlowRevealMode(3, undefined)).toBe('tap');
    expect(resolveLogicFlowRevealMode(2, undefined)).toBe('auto');
  });
});
