import golden from '@/examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json';
import {
  buildCurativosChoiceSlides,
  buildCurativosPremiumSlides,
  parseTrueNumeralsFromGabarito,
  resolveCurativosAssertives,
} from '@/lib/catalogMigration/upgradePremiumCurativos';
import { upgradePremiumHybrid } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { QuestaoCompletaSchema } from '@/lib/validations';

const GENERIC_CURATIVOS = {
  meta: {
    banca: 'CPCON',
    topico: 'Enfermagem',
    subtopico: 'Curativos e Manejo de Feridas',
    ano: '2025',
  },
  question_data: golden.question_data,
  reverse_study_slides: [
    { type: 'concept_map', items: [{ label: 'Ponto 1', detail: 'Relacione o tema' }] },
    { type: 'golden_rule', content: 'Regra essencial genérica' },
    { type: 'logic_flow', steps: ['Passo genérico'] },
    {
      type: 'danger_zone',
      content: 'Erros comuns',
      items: [{ label: 'Ponto 1', detail: 'Erro genérico' }],
    },
  ],
};

describe('upgradePremiumCurativos', () => {
  it('parseTrueNumeralsFromGabarito extrai I e III da letra E', () => {
    const assertives = resolveCurativosAssertives(
      golden.question_data.instruction,
      golden.question_data.options.find((o) => o.is_correct),
    );
    const trueSet = parseTrueNumeralsFromGabarito('I e III.', assertives);
    expect(trueSet.has('I')).toBe(true);
    expect(trueSet.has('III')).toBe(true);
    expect(trueSet.has('II')).toBe(false);
    expect(trueSet.has('IV')).toBe(false);
  });

  it('buildCurativosPremiumSlides gera 4 slides no padrão golden VF', () => {
    const slides = buildCurativosPremiumSlides({
      instruction: golden.question_data.instruction,
      options: golden.question_data.options,
      topico: 'Enfermagem',
      subtopico: 'Curativos e Manejo de Feridas',
    });
    expect(slides.map((s) => s.type)).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);
    const cm = slides[0] as { items?: { label: string }[] };
    expect(cm.items?.some((i) => i.label.includes('Alívio'))).toBe(true);
    expect(cm.items?.some((i) => i.label === 'Gabarito')).toBe(true);

    const gr = slides[1] as { rows?: { label: string; emphasis?: string }[] };
    expect(gr.rows?.some((r) => r.label.includes('II') && r.emphasis === 'alert')).toBe(true);

    const lf = slides[2] as { reveal_mode?: string; steps?: string[] };
    expect(lf.reveal_mode).toBe('tap');
    expect(lf.steps?.some((s) => s.includes('Julgar IV'))).toBe(true);

    const dz = slides[3] as { items?: { correct?: string }[]; bullet_style?: string };
    expect(dz.bullet_style).toBe('x_icon');
    expect(dz.items?.some((i) => i.correct?.includes('seca'))).toBe(true);
  });

  it('buildCurativosChoiceSlides gera golden_rule com rows por letra', () => {
    const slides = buildCurativosChoiceSlides({
      instruction: GENERIC_CURATIVOS.question_data.instruction,
      options: [
        { id: 'A', text: 'Gaze reaproveitada', is_correct: false },
        { id: 'B', text: 'Limpeza circular', is_correct: false },
        { id: 'C', text: 'Técnica asséptica', is_correct: true },
        { id: 'D', text: 'Luvas só se purulento', is_correct: false },
      ],
      topico: 'Enfermagem',
      subtopico: 'Curativos e Manejo de Feridas',
    });
    const gr = slides[1] as { rows?: { label: string }[] };
    expect(gr.rows?.some((r) => r.label === 'Letra C')).toBe(true);
    const dz = slides[3] as { items?: { label: string }[] };
    expect(dz.items?.some((i) => i.label.includes('letra A'))).toBe(true);
  });

  it('upgrade híbrido usa builder Curativos para VF genérico', () => {
    const result = upgradePremiumHybrid(GENERIC_CURATIVOS);
    expect(result.changed).toBe(true);
    expect(result.zodValid).toBe(true);
    expect(result.family).toBe('vf');
    expect(result.goldenReference).toBe('questao-premium-cpcon-curativos-lpp-prevencao-vf.json');
    expect(result.changes).toEqual([
      'concept_map',
      'golden_rule',
      'logic_flow',
      'danger_zone',
    ]);

    const parsed = QuestaoCompletaSchema.safeParse(result.payload);
    expect(parsed.success).toBe(true);

    const slides = result.payload.reverse_study_slides as { type: string }[];
    const gr = slides.find((s) => s.type === 'golden_rule') as { rows?: unknown[] };
    expect(gr.rows?.length).toBeGreaterThanOrEqual(4);
  });
});
