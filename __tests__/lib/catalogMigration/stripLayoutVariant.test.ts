import { stripLayoutVariantFromQuestaoPayload } from '@/lib/catalogMigration/stripLayoutVariant';

describe('stripLayoutVariantFromQuestaoPayload', () => {
  it('remove layout_variant dos slides e preserva campos semânticos', () => {
    const raw = {
      meta: { banca: 'X', topico: 'Enfermagem' },
      reverse_study_slides: [
        { type: 'concept_map', layout_variant: 'bridge', items: [{ label: 'A' }] },
        {
          type: 'golden_rule',
          layout_variant: 'reference_table',
          rows: [{ label: 'Dose', value: '5 mL' }],
        },
        { type: 'logic_flow', layout_variant: 'cards', reveal_mode: 'tap', steps: ['1'] },
        {
          type: 'danger_zone',
          layout_variant: 'compare',
          bullet_style: 'x_icon',
          content: 'Pegadinhas',
          items: [{ label: 'Erro', correct: 'Certo' }],
        },
      ],
    };

    const { payload, stripped } = stripLayoutVariantFromQuestaoPayload(raw);
    expect(stripped).toBe(4);

    const slides = payload.reverse_study_slides as Record<string, unknown>[];
    expect(slides.every((s) => !('layout_variant' in s))).toBe(true);
    expect(slides[1].rows).toBeDefined();
    expect(slides[2].reveal_mode).toBe('tap');
    expect(slides[3].bullet_style).toBe('x_icon');
  });
});
