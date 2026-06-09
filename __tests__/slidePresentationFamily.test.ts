import { resolveSlidePresentation } from '@/components/slides/core/slidePresentation';
import { GOLDEN_RULE_TYPOGRAPHY_POOL } from '@/components/slides/core/layoutRotation';

describe('slidePresentation + familyId', () => {
  it('usa âncora da família protocolo no logic_flow com rotação', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        steps: ['A', 'B', 'C', 'D'],
      },
      {
        questionSlug: 'rcp-protocolo-questao-1',
        slideIndex: 2,
        familyId: 'protocolo',
      },
    );
    expect(['horizontal', 'vertical', 'cards']).toContain(result.layoutVariant);
  });

  it('rows no golden_rule vence âncora da família (reference_table)', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        rows: [{ label: 'FC', value: '60–100' }],
      },
      {
        questionSlug: 'calc-questao-1',
        familyId: 'calc',
      },
    );
    expect(result.layoutVariant).toBe('reference_table');
  });

  it('golden_rule sem rows rotaciona tipografia com família legis', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        content: 'FOCO EM PROVA',
      },
      {
        questionSlug: 'sus-lei-8080-questao-1',
        slideIndex: 1,
        familyId: 'legis',
      },
    );
    expect(GOLDEN_RULE_TYPOGRAPHY_POOL).toContain(result.layoutVariant);
  });

  it('correct no danger_zone vence rotação da família text_fragment', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        content: 'Pegadinha',
        items: [{ label: 'Erro', detail: 'X', correct: 'Conduta certa' }],
      },
      {
        questionSlug: 'sae-caso-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('compare');
  });
});
