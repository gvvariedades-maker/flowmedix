import {
  isVersusArenaSideReady,
  normalizeLogicFlowSteps,
  normalizeReverseStudySlide,
} from '@/lib/reverseStudySlidesNormalize';
import { QuestaoCompletaSchema } from '@/lib/validations';

describe('normalizeReverseStudySlide', () => {
  it('achata shell fields e rows do golden_rule aninhado', () => {
    const normalized = normalizeReverseStudySlide({
      type: 'golden_rule',
      golden_rule: {
        chip_label: 'MNEMÔNICO',
        slide_title: 'Critérios de choque',
        rows: [{ label: 'PAS', value: '< 90 mmHg' }],
      },
    }) as Record<string, unknown>;

    expect(normalized.chip_label).toBe('MNEMÔNICO');
    expect(normalized.slide_title).toBe('Critérios de choque');
    expect(normalized.rows).toEqual([{ label: 'PAS', value: '< 90 mmHg' }]);
    expect(normalized.golden_rule).toBeUndefined();
  });

  it('achata reveal_mode do logic_flow aninhado', () => {
    const normalized = normalizeReverseStudySlide({
      type: 'logic_flow',
      logic_flow: {
        reveal_mode: 'tap',
        steps: ['Avaliar ABC', 'Iniciar RCP'],
      },
    }) as Record<string, unknown>;

    expect(normalized.reveal_mode).toBe('tap');
    expect(normalized.steps).toEqual(['Avaliar ABC', 'Iniciar RCP']);
  });

  it('achata items com correct do danger_zone aninhado', () => {
    const normalized = normalizeReverseStudySlide({
      type: 'danger_zone',
      danger_zone: {
        content: 'Armadilhas em RCP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Parar RCP cedo',
            detail: 'Checar pulso a cada ciclo.',
            correct: 'Pulso só após 2 min de RCP contínua.',
          },
        ],
      },
    }) as Record<string, unknown>;

    expect(normalized.content).toBe('Armadilhas em RCP');
    expect(normalized.bullet_style).toBe('x_icon');
    expect(normalized.items).toEqual([
      {
        label: 'Parar RCP cedo',
        detail: 'Checar pulso a cada ciclo.',
        correct: 'Pulso só após 2 min de RCP contínua.',
      },
    ]);
  });

  it('normaliza passos logic_flow com objetos legados', () => {
    expect(
      normalizeLogicFlowSteps([
        { text: 'Avaliar ABC' },
        { step: 'Iniciar RCP' },
        'Confirmar ritmo',
        { foo: 'ignorado' },
      ]),
    ).toEqual(['Avaliar ABC', 'Iniciar RCP', 'Confirmar ritmo']);
  });

  it('rejeita versus_arena sem pontos em isVersusArenaSideReady', () => {
    expect(
      isVersusArenaSideReady({ title: 'Lado A', points: [] }),
    ).toBe(false);
    expect(
      isVersusArenaSideReady({ title: 'Lado B', points: ['Item válido'] }),
    ).toBe(true);
  });

  it('normaliza versus_arena com concept_a/b em objeto', () => {
    const normalized = normalizeReverseStudySlide({
      type: 'versus_arena',
      concept_a: {
        title: 'Assepsia',
        points: ['Previne entrada'],
        icon: 'Shield',
      },
      concept_b: {
        title: 'Antissepsia',
        points: ['Destrói microrganismos'],
      },
    }) as Record<string, unknown>;

    expect(normalized.concept_a).toEqual({
      title: 'Assepsia',
      points: ['Previne entrada'],
      icon: 'Shield',
    });
    expect(normalized.concept_b).toEqual({
      title: 'Antissepsia',
      points: ['Destrói microrganismos'],
    });
  });
});

describe('QuestaoCompletaSchema — payload premium', () => {
  const premiumQuestion = {
    meta: {
      banca: 'CPCON',
      topico: 'Urgência',
      subtopico: 'RCP',
    },
    question_data: {
      instruction: 'Assinale a alternativa correta.',
      options: [
        { id: 'A', text: 'Certo', is_correct: true },
        { id: 'B', text: 'Errado', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        chip_label: 'MAPA',
        items: [{ label: 'A', detail: 'B' }],
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        steps: ['Passo 1'],
      },
      {
        type: 'danger_zone',
        content: 'Cuidado',
        bullet_style: 'x_icon',
        items: [{ label: 'Trap', detail: 'X', correct: 'Certo' }],
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela',
        content: 'Título',
        rows: [{ label: 'FC', value: '60–100' }],
      },
    ],
  };

  it('valida questão premium completa após normalize', () => {
    const result = QuestaoCompletaSchema.safeParse(premiumQuestion);
    expect(result.success).toBe(true);
    if (result.success) {
      const slides = result.data.reverse_study_slides!;
      expect(slides[0].chip_label).toBe('MAPA');
      const logicSlide = slides[1];
      expect(logicSlide.type).toBe('logic_flow');
      if (logicSlide.type === 'logic_flow') {
        expect(logicSlide.reveal_mode).toBe('tap');
      }
      const dangerSlide = slides[2];
      expect(dangerSlide.type).toBe('danger_zone');
      if (dangerSlide.type === 'danger_zone') {
        expect(dangerSlide.bullet_style).toBe('x_icon');
        expect(dangerSlide.items?.[0]?.correct).toBe('Certo');
      }
      const goldenSlide = slides[3];
      expect(goldenSlide.type).toBe('golden_rule');
      if (goldenSlide.type === 'golden_rule') {
        expect(goldenSlide.slide_title).toBe('Tabela');
        expect(goldenSlide.rows?.[0]?.label).toBe('FC');
      }
    }
  });
});
