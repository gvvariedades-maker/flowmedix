import { countMoldInteractiveSlots } from '@/lib/slides/moldSlotFit';

describe('moldSlotFit', () => {
  it('adolescent-privacy-curtain: 0 slots quando só vocabulário de puberdade', () => {
    const slots = countMoldInteractiveSlots('adolescent-privacy-curtain', {
      type: 'concept_map',
      items: [
        { label: 'Puberdade', detail: 'Marcos hormonais na adolescência' },
        { label: 'Mamas', detail: 'Desenvolvimento 12-13 anos' },
      ],
    });
    expect(slots).toBe(0);
  });

  it('adolescent-privacy-curtain: ≥1 slot com vocabulário de escuta/sigilo', () => {
    const slots = countMoldInteractiveSlots('adolescent-privacy-curtain', {
      type: 'concept_map',
      items: [
        { label: 'Escuta', detail: 'Privacidade e acolhimento na consulta' },
        { label: 'Sigilo', detail: 'Proteção do adolescente' },
      ],
    });
    expect(slots).toBeGreaterThan(0);
  });
});
