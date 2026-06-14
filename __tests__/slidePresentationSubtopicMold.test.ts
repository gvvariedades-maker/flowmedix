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

  it('Vias de Administração: concept_map absorption-speed-rail no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Vias de Administração' },
        items: [
          { label: 'Via SC', detail: 'Lenta', icon: 'Syringe' },
          { label: 'Comparativo', detail: 'IV IM SC', icon: 'GitCompare' },
        ],
      },
      {
        questionSlug: 'vunesp-sc-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('absorption-speed-rail');
  });

  it('Vias de Administração: danger_zone route-trap com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Vias de Administração' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A — rápida', detail: 'IV', correct: 'SC lenta' }],
      },
      {
        questionSlug: 'vunesp-sc-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('route-trap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Cálculo de Medicamentos: concept_map dose-equivalence-rail no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Cálculo de Administração de Medicamentos e Infusões' },
        items: [
          { label: '1 mL = 20 gotas', detail: 'macrogota' },
          { label: 'U-100', detail: 'insulina' },
        ],
      },
      {
        questionSlug: 'idecan-calc-1',
        familyId: 'calc',
      },
    );
    expect(result.layoutVariant).toBe('dose-equivalence-rail');
  });

  it('Cálculo de Medicamentos: danger_zone dose-trap com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Cálculo de Administração de Medicamentos e Infusões' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A — 10 UI', detail: 'U-100 errada', correct: '100 UI/mL' }],
      },
      {
        questionSlug: 'idecan-calc-1',
        familyId: 'calc',
      },
    );
    expect(result.layoutVariant).toBe('dose-trap');
    expect(result.bulletStyle).toBe('x_icon');
    expect(result.dangerRevealMode).toBe('tap');
  });

  it('Cálculo de Medicamentos: golden_rule soft-lens-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Cálculo de Administração de Medicamentos e Infusões' },
        content: '20 · 60 · 3',
        rows: [
          { label: '1 mL', value: '20 gotas', emphasis: 'highlight' },
          { label: 'Letra B', value: 'Gabarito', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'idecan-calc-1',
        slideIndex: 1,
        familyId: 'calc',
      },
    );
    expect(result.layoutVariant).toBe('soft-lens-board');
  });

  it('Oxigenoterapia: concept_map oxygen-protocol-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Oxigenoterapia e Cuidados Respiratórios' },
        items: [
          { label: 'CNA', detail: 'baixo fluxo' },
          { label: 'Venturi', detail: 'FiO2 controlada' },
          { label: 'Gabarito', detail: 'Letra A' },
        ],
      },
      {
        questionSlug: 'adm-tec-oxigeno-1',
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('oxygen-protocol-deck');
  });

  it('Oxigenoterapia: golden_rule oxygen-rule-carousel com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Oxigenoterapia e Cuidados Respiratórios' },
        content: 'CNA · Venturi',
        rows: [
          { label: 'REGRA 1', value: 'CNA baixo fluxo', emphasis: 'highlight' },
          { label: 'REGRA 2', value: 'Venturi FiO2', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'adm-tec-oxigeno-1',
        slideIndex: 1,
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('oxygen-rule-carousel');
  });

  it('Oxigenoterapia: logic_flow oxygen-step-ladder no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Oxigenoterapia e Cuidados Respiratórios' },
        steps: ['1', '2', '3', '4'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'adm-tec-oxigeno-1',
        slideIndex: 2,
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('oxygen-step-ladder');
    expect(result.revealMode).toBe('tap');
  });

  it('Oxigenoterapia: danger_zone oxygen-danger-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Oxigenoterapia e Cuidados Respiratórios' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra B', detail: 'alto fluxo errado', correct: 'CNA baixo fluxo' }],
      },
      {
        questionSlug: 'adm-tec-oxigeno-1',
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('oxygen-danger-arena');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Punção Venosa: concept_map morphing-timeline no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
        items: [
          { label: 'Antissepsia', detail: 'clorexidina' },
          { label: 'Barreira estéril', detail: 'máxima' },
          { label: 'Gabarito', detail: 'Letra B' },
        ],
      },
      {
        questionSlug: 'adm-tec-puncao-1',
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('morphing-timeline');
  });

  it('Punção Venosa: golden_rule iv-bundle-mesh-reveal com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
        content: 'Letra B',
        rows: [
          { label: 'Higienização', value: 'Antes e após manipular' },
          { label: 'Barreira', value: 'Estéril máxima', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'adm-tec-puncao-1',
        slideIndex: 1,
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('iv-bundle-mesh-reveal');
  });

  it('Punção Venosa: logic_flow iv-care-soft-stack no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
        steps: ['1', '2', '3', '4'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'adm-tec-puncao-1',
        slideIndex: 2,
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('iv-care-soft-stack');
    expect(result.revealMode).toBe('tap');
  });

  it('Punção Venosa: danger_zone catheter-danger-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A', detail: 'curativo 72h fixo', correct: 'Gabarito letra B' }],
      },
      {
        questionSlug: 'adm-tec-puncao-1',
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('catheter-danger-arena');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Coleta de Exames: concept_map lab-specimen-chain no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Coleta de Exames Laboratoriais' },
        items: [
          { label: 'Mediana cubital', detail: 'Via preferida' },
          { label: 'Refrigeração', detail: '2°C a 8°C' },
          { label: 'Segregação', detail: 'Recipiente próprio' },
        ],
      },
      {
        questionSlug: 'cpcon-coleta-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('lab-specimen-chain');
  });

  it('Coleta de Exames: golden_rule lab-prep-lens-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Coleta de Exames Laboratoriais' },
        content: 'COLETA',
        rows: [
          { label: 'I', value: 'Verdadeira' },
          { label: 'III', value: 'Falsa', emphasis: 'alert' },
        ],
      },
      {
        questionSlug: 'cpcon-coleta-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('lab-prep-lens-board');
  });

  it('Coleta de Exames: logic_flow lab-vf-soft-stack no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Coleta de Exames Laboratoriais' },
        steps: ['Ler V/F', 'Julgar I', 'Julgar II', 'Julgar III', 'Marcar D'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-coleta-1',
        slideIndex: 2,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('lab-vf-soft-stack');
    expect(result.revealMode).toBe('tap');
  });

  it('Coleta de Exames: danger_zone lab-specimen-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Coleta de Exames Laboratoriais' },
        content: 'Pegadinhas',
        items: [{ label: 'Juntar resíduos', detail: 'Mistura gaze e perfuro', correct: 'Recipiente próprio' }],
      },
      {
        questionSlug: 'cpcon-coleta-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('lab-specimen-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });
});
