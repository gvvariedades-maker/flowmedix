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

  it('Sinais Vitais: concept_map vitals-panel no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
        items: [
          { label: 'PA', detail: '1', correct: 'Normotenso' },
          { label: 'FC', detail: '2', correct: 'Taquicárdico' },
          { label: 'FR', detail: '3' },
          { label: 'T', detail: '4' },
        ],
      },
      {
        questionSlug: 'fepese-sv-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vitals-panel');
  });

  it('Sinais Vitais: logic_flow vertical no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
        steps: ['1', '2', '3', '4'],
      },
      {
        questionSlug: 'fepese-sv-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vertical');
  });

  it('Urgências: concept_map survival-chain no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Urgências e Emergências' },
        items: [
          { label: 'A', detail: '1', icon: 'HeartPulse' },
          { label: 'B', detail: '2', icon: 'Activity' },
          { label: 'C', detail: '3', icon: 'Wind' },
        ],
      },
      {
        questionSlug: 'cpcon-rcp-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('survival-chain');
  });

  it('Urgências: danger_zone trap-reveal com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'X', correct: 'Certo' }],
      },
      {
        questionSlug: 'cpcon-rcp-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('trap-reveal');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Urgências: logic_flow vertical no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Urgências e Emergências' },
        steps: ['1', '2', '3', '4'],
      },
      {
        questionSlug: 'cpcon-rcp-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vertical');
  });

  it('Imunização: concept_map vaccine-timeline no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Imunização' },
        items: [
          { label: 'Marco', detail: '3 meses', icon: 'Calendar' },
          { label: 'Men C', detail: '1', icon: 'Syringe' },
          { label: 'BCG', detail: '2', icon: 'Baby' },
        ],
      },
      {
        questionSlug: 'fundatec-meningo-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vaccine-timeline');
  });

  it('Imunização: danger_zone calendar-mismatch com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Imunização' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'X', correct: 'Certo' }],
      },
      {
        questionSlug: 'fundatec-meningo-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('calendar-mismatch');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Processo de Enfermagem: concept_map sae-responsibility-matrix no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Processo de Enfermagem' },
        items: [
          { label: 'Anotação', detail: '1', icon: 'FileText' },
          { label: 'Privativo', detail: 'diagnóstico', icon: 'UserCheck' },
          { label: 'COFEN', detail: '2', icon: 'Scale' },
        ],
      },
      {
        questionSlug: 'fepese-sae-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('sae-responsibility-matrix');
  });

  it('Processo de Enfermagem: danger_zone norm-reveal com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Processo de Enfermagem' },
        content: 'Pegadinhas',
        items: [{ label: 'Erro', detail: 'Viola identificação', correct: 'Certo' }],
      },
      {
        questionSlug: 'fepese-sae-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('norm-reveal');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Promoção à Saúde: concept_map sus-art4-orbit no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Promoção à Saúde e Prevenção de Agravos' },
        items: [
          { label: 'Lei 8.080', detail: '1', icon: 'Scale' },
          { label: 'Ações + serviços', detail: '2', icon: 'Layers' },
          { label: 'Esferas', detail: '3', icon: 'Landmark' },
        ],
      },
      {
        questionSlug: 'sus-8080-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('sus-art4-orbit');
  });

  it('Promoção à Saúde: danger_zone scope-trap com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Promoção à Saúde e Prevenção de Agravos' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A — recorte', detail: 'Viola A+S', correct: 'Art. 4º' }],
      },
      {
        questionSlug: 'sus-8080-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('scope-trap');
    expect(result.bulletStyle).toBe('x_icon');
  });
});
