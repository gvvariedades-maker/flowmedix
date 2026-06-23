import { normalizeAiSlides } from '@/lib/ai/normalizeAiSlides';

describe('normalizeAiSlides', () => {
  it('mapeia badges inválidos para valores Zod', () => {
    const slides = [
      {
        type: 'golden_rule',
        rows: [
          { label: 'I', value: 'teste', badge: 'success' },
          { label: 'II', value: 'teste', badge: 'error' },
          { label: 'III', value: 'teste', badge: 'highlight' },
        ],
      },
    ];
    const out = normalizeAiSlides(slides) as typeof slides;
    expect(out[0].rows[0].badge).toBe('ok');
    expect(out[0].rows[1].badge).toBe('warn');
    expect(out[0].rows[2].badge).toBe('hot');
  });

  it('remove badge desconhecido', () => {
    const slides = [{ type: 'golden_rule', rows: [{ label: 'X', value: 'y', badge: 'invalid' }] }];
    const out = normalizeAiSlides(slides) as Array<{ rows: Array<{ badge?: string }> }>;
    expect(out[0].rows[0].badge).toBeUndefined();
  });
});
