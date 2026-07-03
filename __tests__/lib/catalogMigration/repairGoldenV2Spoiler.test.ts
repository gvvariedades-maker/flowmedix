import { repairGoldenV2SpoilerInPayload } from '@/lib/catalogMigration/repairGoldenV2Spoiler';

describe('repairGoldenV2SpoilerInPayload', () => {
  it('remove rows de gabarito do golden_rule e item Gabarito do concept_map', () => {
    const payload = {
      reverse_study_slides: [
        {
          type: 'concept_map',
          items: [
            { label: 'Tema', detail: 'x' },
            { label: 'Gabarito', detail: 'Letra D' },
          ],
        },
        {
          type: 'golden_rule',
          content: 'DECORE',
          rows: [
            { label: 'Regra', value: 'Aldrete' },
            { label: 'Gabarito', value: 'Letra D' },
            { label: 'Combinação', value: 'I e III' },
          ],
        },
        {
          type: 'logic_flow',
          steps: ['Marcar D.'],
        },
      ],
    };

    const result = repairGoldenV2SpoilerInPayload(payload);
    expect(result.changed).toBe(true);
    expect(result.removed_golden_rows).toBe(2);
    expect(result.removed_concept_items).toBe(1);

    const golden = payload.reverse_study_slides[1] as { rows: { label: string }[] };
    expect(golden.rows).toHaveLength(1);
    expect(golden.rows[0].label).toBe('Regra');
  });
});
