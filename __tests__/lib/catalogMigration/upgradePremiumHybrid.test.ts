import {
  buildDangerZoneFromOptions,
  buildLogicFlowFromOptions,
  hasGenericSlides,
  upgradePremiumHybrid,
} from '@/lib/catalogMigration/upgradePremiumHybrid';
import { classifyFamily } from '@/lib/catalogMigration/classifyFamily';

const GENERIC_PAYLOAD = {
  meta: {
    banca: 'Cebraspe',
    topico: 'Enfermagem',
    subtopico: 'Imunização',
    ano: '2024',
    orgao: 'Teste',
    prova: 'Técnico',
  },
  question_data: {
    instruction: 'Assinale a alternativa correta sobre calendário vacinal aos 3 meses.',
    options: [
      { id: 'A', text: 'BCG.', is_correct: false },
      { id: 'B', text: 'Meningocócica C (conjugada).', is_correct: true },
      { id: 'C', text: 'Rotavírus humano.', is_correct: false },
      { id: 'D', text: 'Pneumocócica 10-valente.', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'concept_map',
      items: [{ label: 'Ponto 1', detail: 'Relacione o tema' }],
    },
    {
      type: 'golden_rule',
      content: 'Regra essencial genérica',
    },
    {
      type: 'logic_flow',
      steps: ['Passo genérico'],
    },
    {
      type: 'danger_zone',
      content: 'Erros comuns',
      items: [{ label: 'Ponto 1', detail: 'Erro genérico' }],
    },
  ],
};

describe('upgradePremiumHybrid', () => {
  it('detecta slides genéricos', () => {
    expect(hasGenericSlides(GENERIC_PAYLOAD.reverse_study_slides)).toBe(true);
  });

  it('classifica família conceito para calendário vacinal', () => {
    const family = classifyFamily(
      GENERIC_PAYLOAD.question_data.instruction,
      'Imunização',
      GENERIC_PAYLOAD.question_data.options,
      '',
    );
    expect(family).toBe('conceito');
  });

  it('monta danger_zone com letras reais e campo correct', () => {
    const dz = buildDangerZoneFromOptions({
      options: GENERIC_PAYLOAD.question_data.options,
      subtopico: 'Imunização',
      family: 'conceito',
    });
    expect(dz.type).toBe('danger_zone');
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items).toHaveLength(4);
    expect(dz.items?.[0]).toMatchObject({
      label: expect.stringContaining('Letra A'),
      correct: expect.stringContaining('Gabarito: letra B'),
    });
  });

  it('monta logic_flow tap com eliminação por letra', () => {
    const lf = buildLogicFlowFromOptions({
      instruction: GENERIC_PAYLOAD.question_data.instruction,
      options: GENERIC_PAYLOAD.question_data.options,
      subtopico: 'Imunização',
      family: 'conceito',
    });
    expect(lf.reveal_mode).toBe('tap');
    expect(lf.steps?.some((s) => s.includes('Testar letra A'))).toBe(true);
    expect(lf.steps?.some((s) => s.includes('Marcar letra B'))).toBe(true);
  });

  it('upgrade híbrido substitui genéricos e passa Zod', () => {
    const result = upgradePremiumHybrid(GENERIC_PAYLOAD);
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.family).toBe('conceito');
    expect(result.changes).toContain('danger_zone');
    expect(result.changes).toContain('logic_flow');

    const slides = result.payload.reverse_study_slides as {
      type: string;
      layout_variant?: string;
      items?: { label: string }[];
      rows?: unknown[];
      reveal_mode?: string;
    }[];
    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    expect(slides.every((s) => s.layout_variant === undefined)).toBe(true);

    const cm = slides[0];
    expect(cm.items?.[0]?.label).toBe('Conceito cobrado');

    const gr = slides[1];
    expect(gr.content).toContain('FOCO EM PROVA');

    const lf = slides[2];
    expect(lf.reveal_mode).toBe('tap');

    const dz = slides[3] as { items?: { correct?: string }[]; bullet_style?: string };
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items?.every((i) => typeof i.correct === 'string')).toBe(true);
  });

  it('estrutura golden_rule distinta por família (conteúdo, sem layout_variant)', () => {
    const calcPayload = {
      ...GENERIC_PAYLOAD,
      question_data: {
        instruction: 'Calcule quantas gotas de 20 gotas/mL correspondem a 5 mL.',
        options: [
          { id: 'A', text: '100 gotas', is_correct: true },
          { id: 'B', text: '50 gotas', is_correct: false },
        ],
      },
    };
    const calc = upgradePremiumHybrid(calcPayload);
    expect(calc.family).toBe('calc');
    const calcSlides = calc.payload.reverse_study_slides as {
      layout_variant?: string;
      rows?: unknown[];
      items?: unknown[];
    }[];
    expect(calcSlides.every((s) => s.layout_variant === undefined)).toBe(true);
    expect(calcSlides[1].rows?.length).toBeGreaterThan(0);
    expect(calcSlides[0].items?.length).toBe(2);

    const protoPayload = {
      ...GENERIC_PAYLOAD,
      meta: { ...GENERIC_PAYLOAD.meta, subtopico: 'Urgências e Emergências' },
      question_data: {
        instruction: 'Sobre RCP em adulto, assinale a alternativa correta sobre compressões torácicas.',
        options: GENERIC_PAYLOAD.question_data.options,
      },
    };
    const proto = upgradePremiumHybrid(protoPayload);
    expect(proto.family).toBe('protocolo');
    const protoSlides = proto.payload.reverse_study_slides as {
      layout_variant?: string;
      content?: string;
    }[];
    expect(protoSlides.every((s) => s.layout_variant === undefined)).toBe(true);
    expect(protoSlides[1].content).toContain('PROTOCOLO DE PROVA');
  });

  it('pula questões já premium sem --force', () => {
    const premium = upgradePremiumHybrid(GENERIC_PAYLOAD);
    const again = upgradePremiumHybrid(premium.payload);
    expect(again.skipped).toBe(true);
    expect(again.skipReason).toContain('já premium');
  });

  it('classifica certo_errado e monta danger_zone', () => {
    const cePayload = {
      ...GENERIC_PAYLOAD,
      question_data: {
        instruction: 'Julgue o item: vacinas devem ser apenas inativadas.',
        options: [
          { id: 'A', text: 'Certo', is_correct: false },
          { id: 'B', text: 'Errado', is_correct: true },
        ],
      },
    };
    const result = upgradePremiumHybrid(cePayload);
    expect(result.family).toBe('certo_errado');
    expect(result.zodValid).toBe(true);
    const dz = (result.payload.reverse_study_slides as { items?: { label: string }[] }[])[3];
    expect(dz.items?.[0]?.label).toContain('Certo');
  });
});
