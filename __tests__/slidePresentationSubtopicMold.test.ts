import { resolveSlidePresentation } from '@/components/slides/core/slidePresentation';

describe('slidePresentation — molde por subtópico', () => {
  it('Sondas: molde canônico vence família vf (concept_map procedure-protocol)', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Instalação e Manejo de Sondas' },
        items: [
          { label: 'A', detail: '1' },
          { label: 'B', detail: '2' },
          { label: 'C', detail: '3' },
        ],
      },
      {
        questionSlug: 'cpcon-sondas-questao-99',
        slideIndex: 0,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('procedure-protocol');
  });

  it('Sondas: logic_flow vertical mesmo com slug e família protocolo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Instalação e Manejo de Sondas' },
        steps: ['1', '2', '3', '4'],
      },
      {
        questionSlug: 'cpcon-sondas-questao-99',
        slideIndex: 2,
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('vertical');
  });

  it('Cuidados: concept_map bridge no molde premium', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
        items: [
          { label: 'A', detail: '1' },
          { label: 'B', detail: '2' },
          { label: 'C', detail: '3' },
        ],
      },
      {
        questionSlug: 'fepese-cuidados-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('bridge');
  });

  it('Cuidados: danger_zone compare quando há correct (molde)', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'X', correct: 'Certo' }],
      },
      {
        questionSlug: 'fepese-cuidados-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('compare');
  });

  it('Sondas: danger_zone trap-reveal no molde (sem correct)', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Instalação e Manejo de Sondas' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'Só pegadinha' }],
      },
      {
        questionSlug: 'sondas-questao-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('trap-reveal');
  });

  it('Sondas: danger_zone trap-reveal mesmo com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Instalação e Manejo de Sondas' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'X', correct: 'Certo' }],
      },
      {
        questionSlug: 'sondas-questao-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('trap-reveal');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Sinais Vitais: danger_zone trap-reveal com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'X', correct: 'Certo' }],
      },
      {
        questionSlug: 'fepese-sv-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('trap-reveal');
    expect(result.bulletStyle).toBe('x_icon');
  });
});
