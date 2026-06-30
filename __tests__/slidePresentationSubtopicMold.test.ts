import {
  enrichPresentationContext,
  resolveSlidePresentation,
} from '@/components/slides/core/slidePresentation';

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

  it('Sondas: logic_flow sonda-decision-tap no molde premium', () => {
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
    expect(result.layoutVariant).toBe('sonda-decision-tap');
  });

  it('Sondas: golden_rule sonda-measurement-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Instalação e Manejo de Sondas' },
        rows: [
          { label: 'NEX', value: 'Nariz → orelha → xifoide', badge: 'hot' },
          { label: 'Confirmação', value: 'Radiografia de abdome', emphasis: 'alert' },
        ],
      },
      {
        questionSlug: 'consulplan-sondas-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('sonda-measurement-board');
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

  it('Sinais Vitais: golden_rule vitals-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
        rows: [
          { label: 'FC 110 bpm', value: 'Taquicárdico', emphasis: 'alert' },
          { label: 'Conclusão', value: 'Letra C', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'fepese-sv-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vitals-reference-board');
  });

  it('Sinais Vitais: danger_zone vitals-classify-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A', detail: 'Confunde taquicardia', correct: 'FC 110 = taquicárdico' }],
      },
      {
        questionSlug: 'fepese-sv-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vitals-classify-arena');
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

  it('Sinais Vitais: logic_flow vitals-translate-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Verificação de Sinais Vitais' },
        steps: ['Interpretar PA', 'Interpretar FC', 'Marcar letra C'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'fepese-sv-1',
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('vitals-translate-tap');
    expect(result.revealMode).toBe('tap');
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

  it('Imunização: concept_map pni-rules-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Imunização' },
        items: [
          { label: 'Grace period', detail: '4 dias antes = dose válida', icon: 'Clock' },
          { label: 'SCR × FA', detail: '30 dias menor de 2 anos', icon: 'Baby' },
          { label: 'Gabarito', detail: 'Letra C', icon: 'CheckCircle' },
        ],
      },
      {
        questionSlug: 'cpcon-imunizacao-intervalos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('pni-rules-deck');
  });

  it('Imunização: golden_rule pni-interval-matrix com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Imunização' },
        rows: [
          { label: 'I — grace 4d', value: 'FALSA: dose válida' },
          { label: 'Combinação', value: 'II, III e IV → letra C', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'cpcon-imunizacao-intervalos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('pni-interval-matrix');
  });

  it('Imunização: logic_flow pni-vf-juggle-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Imunização' },
        steps: ['Julgar I: grace → FALSO', 'Julgar II → VERDADEIRO', 'Marcar C'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-imunizacao-intervalos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('pni-vf-juggle-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('Imunização: danger_zone pni-trap-chips com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Imunização' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A', detail: 'Aceita I falsa', correct: 'Grace period valida dose' }],
      },
      {
        questionSlug: 'cpcon-imunizacao-intervalos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('pni-trap-chips');
    expect(result.bulletStyle).toBe('x_icon');
    expect(result.dangerRevealMode).toBe('tap');
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

  it('Processo de Enfermagem: golden_rule sae-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Processo de Enfermagem' },
        content: 'SAE · COFEN',
        rows: [
          { label: 'Anotação', value: 'Privativa do enfermeiro', emphasis: 'highlight' },
          { label: 'Gabarito', value: 'Letra C', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'fepese-sae-1',
        slideIndex: 1,
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('sae-reference-board');
  });

  it('Processo de Enfermagem: logic_flow sae-decision-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Processo de Enfermagem' },
        steps: ['Ler enunciado', 'Identificar privativa', 'Marcar letra C'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'fepese-sae-1',
        slideIndex: 2,
        familyId: 'text_fragment',
      },
    );
    expect(result.layoutVariant).toBe('sae-decision-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('ISTs: concept_map ist-risk-routes-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)' },
        items: [
          { label: 'Via sexual', detail: 'Sem preservativo', icon: 'HeartPulse' },
          { label: 'Parenteral', detail: 'Agulha compartilhada', icon: 'Syringe' },
          { label: 'Gabarito', detail: 'Letra B', icon: 'CheckCircle' },
        ],
      },
      {
        questionSlug: 'cpcon-ists-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('ist-risk-routes-deck');
  });

  it('ISTs: golden_rule ist-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)' },
        content: 'Rotas · Agentes',
        rows: [
          { label: 'I — sexual', value: 'VERDADEIRA' },
          { label: 'Combinação', value: 'Letra B', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'cpcon-ists-1',
        slideIndex: 1,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('ist-reference-board');
  });

  it('ISTs: logic_flow ist-vf-juggle-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)' },
        steps: ['Julgar I → VERDADEIRO', 'Julgar II → FALSO', 'Marcar B'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-ists-1',
        slideIndex: 2,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('ist-vf-juggle-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('ISTs: danger_zone ist-trap-chips com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Infecções Sexualmente Transmissíveis (ISTs)' },
        content: 'Pegadinhas',
        items: [
          {
            label: 'Só HIV',
            detail: 'IST é unicamente HIV',
            correct: 'Múltiplos agentes — HIV, sífilis, hepatites',
          },
        ],
      },
      {
        questionSlug: 'cpcon-ists-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('ist-trap-chips');
    expect(result.bulletStyle).toBe('x_icon');
    expect(result.dangerRevealMode).toBe('tap');
  });

  it('Saúde do Adolescente: concept_map adolescent-privacy-curtain no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Saúde do Adolescente' },
        items: [
          { label: 'Escuta qualificada', detail: 'Privacidade e acolhimento', icon: 'MessageCircle' },
          { label: 'Sigilo', detail: 'Limites legais', icon: 'Lock' },
          { label: 'Gabarito', detail: 'Letra B', icon: 'CheckCircle' },
        ],
      },
      {
        questionSlug: 'cpcon-adolescente-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('adolescent-privacy-curtain');
  });

  it('Saúde do Adolescente: golden_rule adolescent-sigilo-spectrum com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Saúde do Adolescente' },
        content: 'ESCUTA',
        rows: [
          { label: 'Privacidade', value: 'Consulta com escuta — I correta' },
          { label: 'Gabarito', value: 'I e II, apenas', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'cpcon-adolescente-1',
        slideIndex: 1,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('adolescent-sigilo-spectrum');
  });

  it('Saúde do Adolescente: logic_flow adolescent-vf-weave-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Saúde do Adolescente' },
        steps: ['I: privacidade → verdadeira.', 'III: sigilo sem critério → falsa.', 'Letra B.'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-adolescente-1',
        slideIndex: 2,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('adolescent-vf-weave-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('Saúde do Adolescente: danger_zone adolescent-consent-gate com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Saúde do Adolescente' },
        content: 'PEGADINHAS — ADOLESCENTE',
        items: [
          {
            label: 'Quebrar sigilo sempre',
            detail: 'III ignora critérios legais',
            correct: 'Sigilo com limites — avaliar risco e legislação.',
          },
        ],
      },
      {
        questionSlug: 'cpcon-adolescente-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('adolescent-consent-gate');
    expect(result.bulletStyle).toBe('x_icon');
    expect(result.dangerRevealMode).toBe('tap');
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
        familyId: 'vf',
        pedagogicalBranch: 'via_vf_absorcao',
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
        familyId: 'vf',
        pedagogicalBranch: 'via_vf_absorcao',
      },
    );
    expect(result.layoutVariant).toBe('route-trap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Vias de Administração: golden_rule via-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Vias de Administração' },
        rows: [
          { label: 'I — absorção', value: 'FALSA: IM > SC', emphasis: 'alert' },
          { label: 'Combinação', value: 'Letra E', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'cpcon-vias-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('via-reference-board');
  });

  it('Vias de Administração: logic_flow via-vf-juggle-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Vias de Administração' },
        steps: ['Julgar I', 'Julgar II', 'Marcar E'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-vias-1',
        slideIndex: 2,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('via-vf-juggle-tap');
  });

  it('Farmacodinâmica e Farmacocinética: concept_map adme-journey-rail no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Farmacodinâmica e Farmacocinética' },
        items: [
          { label: 'Farmacocinética', detail: 'ADME', icon: 'Pill' },
          { label: 'Farmacodinâmica', detail: 'ação no organismo', icon: 'Zap' },
        ],
      },
      {
        questionSlug: 'funcamp-farmaco-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('adme-journey-rail');
  });

  it('Farmacodinâmica e Farmacocinética: golden_rule pk-pd-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Farmacodinâmica e Farmacocinética' },
        rows: [
          { label: 'Farmacocinética', value: 'ADME' },
          { label: 'Gabarito', value: 'I e II, apenas', emphasis: 'success' },
        ],
      },
      {
        questionSlug: 'funcamp-farmaco-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('pk-pd-reference-board');
  });

  it('Farmacodinâmica e Farmacocinética: logic_flow farmaco-vf-juggle-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Farmacodinâmica e Farmacocinética' },
        steps: ['Julgar I', 'Julgar II', 'Marcar B'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'funcamp-farmaco-1',
        slideIndex: 2,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('farmaco-vf-juggle-tap');
  });

  it('Farmacodinâmica e Farmacocinética: danger_zone farmaco-trap com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Farmacodinâmica e Farmacocinética' },
        content: 'Pegadinhas',
        items: [
          {
            label: 'Meia-vida = eliminação total',
            detail: '100% na III',
            correct: 'Queda de 50% da concentração plasmática',
          },
        ],
      },
      {
        questionSlug: 'funcamp-farmaco-1',
        familyId: 'vf',
        pedagogicalBranch: 'farmaco_pk_pd_vf',
      },
    );
    expect(result.layoutVariant).toBe('farmaco-trap');
    expect(result.bulletStyle).toBe('x_icon');
    expect(result.dangerRevealMode).toBe('tap');
  });

  it('Farmacodinâmica clínico (omeprazol): concept_map não usa adme-journey-rail', () => {
    const instruction =
      'Em um paciente hospitalizado por úlcera péptica grave, que recebe Omeprazol na forma endovenosa, avalie as condutas farmacológicas e marque a opção adequada.';
    const slide = {
      type: 'concept_map' as const,
      meta: { subtopico: 'Farmacodinâmica e Farmacocinética' },
      items: [
        { label: 'Cenário', detail: 'Úlcera grave — IBP endovenoso', icon: 'Hospital' },
        { label: 'Farmacodinâmica', detail: 'Inibe bomba de prótons → reduz HCl', icon: 'Zap' },
        { label: 'Monitorização', detail: 'pH gástrico guia infusão contínua', icon: 'Activity' },
        { label: 'Gabarito', detail: 'Letra B — titular infusão com monitorização de pH', icon: 'CheckCircle' },
      ],
    };
    const ctx = enrichPresentationContext(
      { questionSlug: 'idecan-omeprazol-1', familyId: 'protocolo' },
      slide.meta,
      instruction,
      [slide],
      { subtopico: 'Farmacodinâmica e Farmacocinética' },
    );
    expect(ctx.pedagogicalBranch).toBe('farmaco_clinico_protocolo');
    const result = resolveSlidePresentation(slide, ctx);
    expect(result.layoutVariant).not.toBe('adme-journey-rail');
    expect(['morphological', 'bridge', 'grid', 'molecular']).toContain(result.layoutVariant);
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

  it('Cálculo de Medicamentos: logic_flow dose-calc-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Cálculo de Administração de Medicamentos e Infusões' },
        steps: ['Identificar equivalência', 'Converter gotas → mL', 'Marcar letra B'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'idecan-calc-1',
        slideIndex: 2,
        familyId: 'calc',
      },
    );
    expect(result.layoutVariant).toBe('dose-calc-tap');
    expect(result.revealMode).toBe('tap');
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

  it('Oxigenoterapia: danger_zone compare com correct no molde', () => {
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
    expect(result.layoutVariant).toBe('compare');
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

  it('Curativos: concept_map wound-stage-tissue-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Curativos e Manejo de Feridas' },
        items: [
          { label: 'Estágio I', detail: 'Eritema não branqueável' },
          { label: 'Granulação', detail: 'Tecido de cicatrização' },
          { label: 'Gabarito', detail: 'Letra E: I e III' },
        ],
      },
      {
        questionSlug: 'cpcon-curativos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('wound-stage-tissue-deck');
  });

  it('Curativos: golden_rule dressing-match-matrix com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Curativos e Manejo de Feridas' },
        content: 'LPP',
        rows: [
          { label: 'II', value: 'Pele úmida — falsa', emphasis: 'alert' },
          { label: 'I', value: 'Calcanhar livre — verdadeira' },
        ],
      },
      {
        questionSlug: 'cpcon-curativos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('dressing-match-matrix');
  });

  it('Curativos: logic_flow wound-prep-tap-flow no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Curativos e Manejo de Feridas' },
        steps: ['Julgar I', 'Julgar II', 'Julgar III', 'Julgar IV', 'Marcar E'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-curativos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('wound-prep-tap-flow');
    expect(result.revealMode).toBe('tap');
  });

  it('Curativos: danger_zone dressing-choice-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Curativos e Manejo de Feridas' },
        content: 'Pegadinhas',
        items: [
          {
            label: 'Pele úmida',
            detail: 'Úmido parece cuidadoso',
            correct: 'Pele limpa e seca',
          },
        ],
      },
      {
        questionSlug: 'cpcon-curativos-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('dressing-choice-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Feridas e Queimaduras: concept_map burn-depth-layer-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Feridas e Queimaduras' },
        items: [
          { label: '1º grau', detail: 'Eritema sem bolha — epiderme' },
          { label: '2º profundo', detail: 'Bolhas — derme reticular' },
          { label: 'Gabarito', detail: 'Letra C: I e III' },
        ],
      },
      {
        questionSlug: 'idecan-feridas-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('burn-depth-layer-deck');
  });

  it('Feridas e Queimaduras: golden_rule burn-rule-nine-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Feridas e Queimaduras' },
        content: 'Regra dos 9',
        rows: [
          { label: 'Cabeça adulto', value: '9% SCQ', emphasis: 'highlight' },
          { label: 'Cabeça criança', value: '18% SCQ — pegadinha', emphasis: 'alert' },
        ],
      },
      {
        questionSlug: 'idecan-feridas-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('burn-rule-nine-board');
  });

  it('Feridas e Queimaduras: logic_flow burn-triage-tap-flow no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Feridas e Queimaduras' },
        steps: ['Garantir segurança', 'Resfriar com água morna', 'Estimar SCQ', 'Profilaxia tétano'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'idecan-feridas-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('burn-triage-tap-flow');
    expect(result.revealMode).toBe('tap');
  });

  it('Feridas e Queimaduras: danger_zone burn-trap-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Feridas e Queimaduras' },
        content: 'Pegadinhas',
        items: [
          {
            label: 'Gelo direto',
            detail: 'Resfriar rápido parece lógico',
            correct: 'Água corrente morna 15–20 min',
          },
        ],
      },
      {
        questionSlug: 'idecan-feridas-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('burn-trap-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Enfermagem do Trabalho: concept_map nr32-annex-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Enfermagem do Trabalho' },
        items: [
          { label: 'NR-32', detail: 'Segurança em serviços de saúde' },
          { label: 'Risco biológico', detail: 'Anexo I — material biológico' },
          { label: 'Vacina HB', detail: 'Prevenção ocupacional' },
        ],
      },
      {
        questionSlug: 'cpcon-trabalho-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('nr32-annex-deck');
  });

  it('Enfermagem do Trabalho: golden_rule trabalho-nr32-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Enfermagem do Trabalho' },
        content: 'NOTIFICAR',
        rows: [
          { label: 'NR-32', value: 'Segurança em serviços de saúde', emphasis: 'highlight' },
          { label: 'Perfuro sem seguimento', value: 'Falso — exige notificação', emphasis: 'alert' },
        ],
      },
      {
        questionSlug: 'cpcon-trabalho-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('trabalho-nr32-reference-board');
  });

  it('Enfermagem do Trabalho: logic_flow trabalho-vf-juggle-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Enfermagem do Trabalho' },
        steps: ['I: NR-32 verdadeira', 'II: vacina HB verdadeira', 'III: perfuro falsa', 'Letra B'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-trabalho-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('trabalho-vf-juggle-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('Enfermagem do Trabalho: danger_zone trabalho-pep-trap-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Enfermagem do Trabalho' },
        content: 'PEGADINHAS — TRABALHO',
        items: [
          {
            label: 'Só lavar e voltar',
            detail: 'III ignora PEP e notificação',
            correct: 'Notificar e seguir protocolo de exposição',
          },
        ],
      },
      {
        questionSlug: 'cpcon-trabalho-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('trabalho-pep-trap-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Doenças Respiratórias Crônicas: concept_map respiratorio-asma-dpoc-duel-deck no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)' },
        items: [
          { label: 'DPOC descompensada', detail: 'SpO₂ 86% com musculatura acessória', icon: 'Activity' },
          { label: 'Asma na APS', detail: 'Educação sobre inalador de resgate', icon: 'Wind' },
          { label: 'GABARITO', detail: 'Letra C — O₂ titulado', icon: 'CheckCircle' },
        ],
      },
      {
        questionSlug: 'cpcon-dpoc-1',
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('respiratorio-asma-dpoc-duel-deck');
  });

  it('Doenças Respiratórias Crônicas: golden_rule respiratorio-spo2-reference-board com rows no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)' },
        content: 'SpO₂ — alvos na prova',
        rows: [
          { label: 'DPOC retentor', value: 'Alvo 88–92%', emphasis: 'success' },
          { label: 'Pegadinha', value: 'Forçar ≥95% em DPOC', emphasis: 'alert' },
        ],
      },
      {
        questionSlug: 'cpcon-dpoc-1',
        slideIndex: 1,
        familyId: 'protocolo',
      },
    );
    expect(result.layoutVariant).toBe('respiratorio-spo2-reference-board');
  });

  it('Doenças Respiratórias Crônicas: logic_flow respiratorio-vf-juggle-tap no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)' },
        steps: ['I — DPOC: SpO₂ alvo 88–92%', 'II — Asma: beta-2 de resgate', 'Marcar letra B'],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-dpoc-1',
        slideIndex: 2,
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('respiratorio-vf-juggle-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('Doenças Respiratórias Crônicas: danger_zone respiratorio-spo2-trap-arena com correct no molde', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)' },
        content: 'PEGADINHAS — SpO₂ NA DPOC',
        items: [
          {
            label: 'Máscara não reinalante em todo DPOC',
            detail: 'Alto fluxo sem titulação',
            correct: 'DPOC: O₂ titulado em baixo fluxo — alvo 88–92%',
          },
        ],
      },
      {
        questionSlug: 'cpcon-dpoc-1',
        familyId: 'vf',
      },
    );
    expect(result.layoutVariant).toBe('respiratorio-spo2-trap-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Doenças Respiratórias Crônicas: ramo crise EXCETO → compare genérico (não duel-deck)', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)' },
        content: 'PEGADINHAS — CRISE ASMÁTICA',
        items: [
          {
            label: 'Restringir hidratação',
            detail: 'Conduta inventada na crise',
            correct: 'Manter hidratação e monitorizar SpO₂',
          },
        ],
      },
      {
        questionSlug: 'vunesp-asma-exceto',
        familyId: 'conceito',
        pedagogicalBranch: 'respiratorio_asma_crise',
      },
    );
    expect(result.layoutVariant).toBe('compare');
  });

  describe('Doenças Bacterianas — agente etiológico (molde inédito)', () => {
    const subtopico =
      'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
    const branch = 'bacterianas_agente_etiologico';

    it('concept_map → etiology-kingdom-rail', () => {
      const result = resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [{ label: 'Bactérias', detail: 'Cólera e TB', icon: 'Bug' }],
        },
        { questionSlug: 'ibgp-bacterias-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('etiology-kingdom-rail');
    });

    it('golden_rule com rows → etiology-letter-spectrum', () => {
      const result = resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico },
          content: 'BACTÉRIA · VÍRUS',
          rows: [{ label: 'Letra A', value: '100% bacterianas', badge: 'hot' }],
        },
        { questionSlug: 'ibgp-bacterias-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('etiology-letter-spectrum');
    });

    it('logic_flow → etiology-elimination-tap', () => {
      const result = resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico },
          steps: ['Letra B: dengue — descarta B.'],
          reveal_mode: 'tap',
        },
        { questionSlug: 'ibgp-bacterias-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('etiology-elimination-tap');
    });

    it('danger_zone com correct → etiology-intruder-chips', () => {
      const result = resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico },
          content: 'PEGADINHAS',
          items: [
            {
              label: 'Letra B',
              detail: 'Dengue na lista',
              correct: 'Gabarito letra A',
            },
          ],
        },
        { questionSlug: 'ibgp-bacterias-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('etiology-intruder-chips');
    });
  });

  describe('Infecções Biossegurança — IRAS/ITU-cateter (molde inédito)', () => {
    const subtopico = 'Infecções no Contexto da Biossegurança';
    const branch = 'biosseg_iras_itu_cateter';

    it('concept_map → itu-closed-system-rail', () => {
      const result = resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [{ label: 'IRAS e ITU', detail: 'cateterização vesical', icon: 'ShieldAlert' }],
        },
        { questionSlug: 'idib-itu-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('itu-closed-system-rail');
    });

    it('golden_rule com rows → itu-bundle-letter-board', () => {
      const result = resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico },
          content: 'BUNDLE FECHADO',
          rows: [{ label: 'Letra D', value: 'EXCETO pinçar cateter', badge: 'warn' }],
        },
        { questionSlug: 'idib-itu-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('itu-bundle-letter-board');
    });

    it('logic_flow → itu-exceto-tap', () => {
      const result = resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico },
          steps: ['Comando EXCETO: marcar letra D.'],
          reveal_mode: 'tap',
        },
        { questionSlug: 'idib-itu-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('itu-exceto-tap');
    });

    it('danger_zone com correct → itu-catheter-trap', () => {
      const result = resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico },
          content: 'PEGADINHAS',
          items: [
            {
              label: 'Letra A',
              detail: 'Higiene do meato',
              correct: 'Gabarito letra D — pinçar na remoção',
            },
          ],
        },
        { questionSlug: 'idib-itu-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('itu-catheter-trap');
    });
  });

  describe('Saúde do Adolescente — afinidade (IBAM escore Z)', () => {
    const subtopico = 'Saúde do Adolescente';
    const slug = 'ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0';

    it('golden_rule calc com rows Z → reference_table (não sigilo-spectrum)', () => {
      const result = resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico },
          content: 'CLASSIFICAÇÃO NUTRICIONAL — ESCORE Z DO IMC (5–19 ANOS)',
          rows: [
            { label: 'Magreza', value: 'Z < −2' },
            { label: 'Sobrepeso', value: '+1 < Z ≤ +2 — letra A', emphasis: 'highlight' },
            { label: 'Gabarito', value: 'Letra A' },
          ],
          footer_rule: 'Sobrepeso: +1 a +2 + orientação de alimentação e atividade física',
        },
        {
          questionSlug: slug,
          slideIndex: 1,
          familyId: 'calc',
        },
      );
      expect(result.layoutVariant).toBe('reference_table');
    });

    it('concept_map nutricional → morphological/grid (não privacy-curtain)', () => {
      const result = resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [
            { label: 'Ferramenta', detail: 'Caderneta do Adolescente + curvas OMS', icon: 'BarChart3' },
            { label: 'Escore Z', detail: 'Desvios-padrão em relação à mediana', icon: 'TrendingUp' },
            { label: 'Sobrepeso', detail: 'IMC com Z entre +1 e +2', icon: 'Apple' },
            { label: 'Conduta', detail: 'Orientar estilo de vida', icon: 'HeartPulse' },
          ],
        },
        {
          questionSlug: slug,
          slideIndex: 0,
          familyId: 'calc',
        },
      );
      expect(['bridge', 'grid', 'molecular', 'morphological', 'stack']).toContain(result.layoutVariant);
      expect(result.layoutVariant).not.toBe('adolescent-privacy-curtain');
    });

    it('danger_zone com correct → compare (não consent-gate)', () => {
      const result = resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico },
          content: 'PEGADINHAS — ESCORE Z',
          items: [
            {
              label: 'Letra B',
              detail: 'Rotula obesidade grave',
              correct: 'Z entre +2 e +3 indica obesidade',
            },
          ],
        },
        {
          questionSlug: slug,
          slideIndex: 3,
          familyId: 'calc',
        },
      );
      expect(result.layoutVariant).toBe('compare');
      expect(result.layoutVariant).not.toBe('adolescent-consent-gate');
    });

    it('questão de sigilo mantém moldes adolescente', () => {
      const result = resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico },
          content: 'SIGILO NA ADOLESCÊNCIA',
          rows: [
            { label: 'Privacidade', value: 'Consulta com escuta qualificada — protegido por sigilo' },
            { label: 'Gabarito', value: 'Letra B', emphasis: 'success' },
          ],
        },
        {
          questionSlug: 'idecan-adolescente-sigilo-1',
          slideIndex: 1,
          familyId: 'vf',
          pedagogicalBranch: 'adolescente_etica_sigilo',
        },
      );
      expect(result.layoutVariant).toBe('adolescent-sigilo-spectrum');
    });

    it('puberdade (IGEDUC) → concept_map genérico, não privacy-curtain', () => {
      const instruction =
        'Julgue o item subsequente. O período da adolescência é marcado por intensa metamorfose física e psicossocial, sendo comuns as disfunções hormonais nos adolescentes. Por exemplo, considera-se atraso na puberdade em meninas quando não se observa nenhum desenvolvimento das mamas dos 12 aos 13 anos e, nos meninos, quando nenhuma hipertrofia dos testículos é observada até os 13-14 anos de idade.';

      const result = resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [
            { label: 'Puberdade', detail: 'Marcos: mamas 12–13 anos (meninas)', icon: 'User' },
            { label: 'Meninos', detail: 'Hipertrofia testicular 13–14 anos', icon: 'User' },
            { label: 'Atraso', detail: 'Ausência de sinais no intervalo esperado', icon: 'AlertTriangle' },
          ],
        },
        {
          questionSlug: 'nao-informado-geral-saude-do-adolescente-1777104229064-0',
          slideIndex: 0,
          familyId: 'certo_errado',
          instruction,
          pedagogicalBranch: 'adolescente_desenvolvimento',
        },
      );
      expect(result.layoutVariant).not.toBe('adolescent-privacy-curtain');
      expect(['bridge', 'grid', 'molecular', 'morphological', 'stack']).toContain(result.layoutVariant);
    });
  });
});
