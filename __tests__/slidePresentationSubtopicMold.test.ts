import {
  enrichPresentationContext,
  resolveSlidePresentation,
  type SlidePresentationContext,
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

  it('Cuidados: concept_map cam-certos-deck no molde premium (padrão subtópico)', () => {
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
    expect(result.layoutVariant).toBe('cam-certos-deck');
  });

  it('Cuidados: danger_zone cam-certos-trap-arena quando há correct (molde padrão)', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
        content: 'Pegadinhas',
        items: [{ label: 'Letra C — II e III', detail: 'III parece razoável.', correct: 'III é falsa.' }],
      },
      {
        questionSlug: 'fepese-cuidados-1',
        familyId: 'vf',
        pedagogicalBranch: 'cam_certos_vf_caso',
      },
    );
    expect(result.layoutVariant).toBe('cam-certos-trap-arena');
    expect(result.bulletStyle).toBe('x_icon');
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

  it('Urgências RCP: concept_map urgencias-survival-chain-deck com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Urgências e Emergências' },
        items: [
          { label: 'Reconhecimento PCR', detail: 'Inconsciência + ausência de respiração', icon: 'Eye' },
          { label: 'Compressões', detail: '100–120/min, 5–6 cm', icon: 'HeartPulse' },
          { label: 'DEA', detail: 'Ligar e aplicar assim que disponível', icon: 'Zap' },
        ],
      },
      {
        questionSlug: 'admtec-rcp-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_rcp_sbv',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-survival-chain-deck');
  });

  it('Urgências RCP: golden_rule urgencias-rcp-params-board com rows', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Urgências e Emergências' },
        content: '30:2 · 100–120',
        rows: [
          { label: 'Proporção', value: '30:2 (2 socorristas)', badge: 'ok' },
          { label: 'Frequência', value: '100–120/min', badge: 'hot' },
          { label: 'Pulso', value: 'Checar após ~2 min', emphasis: 'alert', badge: 'warn' },
        ],
      },
      {
        questionSlug: 'admtec-rcp-1',
        slideIndex: 1,
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_rcp_sbv',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-rcp-params-board');
  });

  it('Urgências RCP: logic_flow urgencias-rcp-tap-flow', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Urgências e Emergências' },
        steps: [
          'Segurança da cena + checagem de respiração.',
          'Iniciar compressões 100–120/min.',
          'Eliminar alternativa com 80–100/min → letra D.',
        ],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'admtec-rcp-1',
        slideIndex: 2,
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_rcp_sbv',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-rcp-tap-flow');
    expect(result.revealMode).toBe('tap');
  });

  it('Urgências RCP: danger_zone urgencias-rcp-trap-arena com correct', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'PEGADINHAS — RCP ADULTO',
        items: [
          {
            label: 'Pulso a cada ciclo',
            detail: 'Parar compressões entre ciclos.',
            correct: 'Verificar pulso só após ~2 minutos de RCP contínua.',
          },
        ],
      },
      {
        questionSlug: 'admtec-rcp-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_rcp_sbv',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-rcp-trap-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Urgências XABCDE: concept_map urgencias-xabcde-rail com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Urgências e Emergências' },
        items: [
          { label: 'X — Hemorragia', detail: 'Compressão direta e torniquete em membro', icon: 'Droplets' },
          { label: 'A — Via aérea', detail: 'Manter VA pérvia', icon: 'Wind' },
          { label: 'Queimadura', detail: 'Água corrente, sem caseiro', icon: 'Flame' },
        ],
      },
      {
        questionSlug: 'ameosc-trauma-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_xabcde_trauma',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-xabcde-rail');
  });

  it('Urgências XABCDE: golden_rule urgencias-trauma-reference-board com rows', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'XABCDE · trauma',
        rows: [
          { label: 'X', value: 'Hemorragia exsanguinante', badge: 'hot' },
          { label: 'Queimadura', value: 'Água corrente 10–20 min', badge: 'ok' },
        ],
      },
      {
        questionSlug: 'ameosc-trauma-1',
        slideIndex: 1,
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_xabcde_trauma',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-trauma-reference-board');
  });

  it('Urgências XABCDE: logic_flow urgencias-xabcde-tap-flow', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Urgências e Emergências' },
        steps: [
          'Enquadrar trauma pré-hospitalar — XABCDE.',
          'Eliminar torniquete no pescoço → letra A.',
          'Gabarito letra C — água corrente na queimadura.',
        ],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'ameosc-trauma-1',
        slideIndex: 2,
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_xabcde_trauma',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-xabcde-tap-flow');
    expect(result.revealMode).toBe('tap');
  });

  it('Urgências XABCDE: danger_zone urgencias-trauma-trap-arena com correct', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'PEGADINHAS — TRAUMA',
        items: [
          {
            label: 'Torniquete no pescoço',
            detail: 'Interromper fluxo carotídeo.',
            correct: 'Compressão direta em membro; torniquete só em extremidade.',
          },
        ],
      },
      {
        questionSlug: 'ameosc-trauma-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_xabcde_trauma',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-trauma-trap-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Urgências AVC: concept_map urgencias-stroke-signs-deck com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Urgências e Emergências' },
        items: [
          { label: 'Face', detail: 'Sorriso assimétrico', icon: 'Smile' },
          { label: 'Braços', detail: 'Queda de MMSS', icon: 'Hand' },
        ],
      },
      {
        questionSlug: 'amauc-avc-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_avc_iam',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-stroke-signs-deck');
  });

  it('Urgências choque: golden_rule urgencias-shock-reference-board com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Urgências e Emergências' },
        content: '1ª conduta',
        rows: [{ label: 'Passo 1', value: 'Interromper circuito', badge: 'hot' }],
      },
      {
        questionSlug: 'admtec-choque-1',
        slideIndex: 1,
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_choque',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-shock-reference-board');
  });

  it('Urgências engasgo: danger_zone urgencias-choking-trap-arena com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'PEGADINHAS — ENGASGO',
        items: [
          {
            label: 'Letra C — abdome',
            detail: 'Confunde sinal com manobra.',
            correct: 'Abdome é onde o socorrista comprime — vítima aponta o pescoço.',
          },
        ],
      },
      {
        questionSlug: 'fau-engasgo-1',
        familyId: 'conceito',
        pedagogicalBranch: 'urgencias_engasgo',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-choking-trap-arena');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
  });

  it('Urgências pediátrica: golden_rule urgencias-pediatric-params-board com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'golden_rule',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'PEDIATRIA × ADULTO',
        rows: [{ label: 'Proporção', value: '15:2 lactente/criança', badge: 'hot' }],
      },
      {
        questionSlug: 'access-ped-1',
        slideIndex: 1,
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_rcp_pediatrico',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-pediatric-params-board');
  });

  it('Urgências Manchester: concept_map urgencias-manchester-spectrum com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'concept_map',
        meta: { subtopico: 'Urgências e Emergências' },
        items: [
          { label: 'Vermelho', detail: 'Emergência imediata', icon: 'Circle' },
          { label: 'Amarelo', detail: 'Urgente monitorar', icon: 'Tags' },
        ],
      },
      {
        questionSlug: 'ameosc-triagem-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_manchester_triagem',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-manchester-spectrum');
  });

  it('Urgências Manchester: danger_zone urgencias-manchester-trap com ramo', () => {
    const result = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Urgências e Emergências' },
        content: 'PEGADINHAS — CORES',
        items: [
          {
            label: 'Letra C — azul',
            detail: 'Instabilidade crítica.',
            correct: 'Azul é não urgente — vermelho é instabilidade.',
          },
        ],
      },
      {
        questionSlug: 'ameosc-triagem-1',
        familyId: 'protocolo',
        pedagogicalBranch: 'urgencias_manchester_triagem',
      },
    );
    expect(result.layoutVariant).toBe('urgencias-manchester-trap');
    expect(result.dangerRevealMode).toBe('tap');
    expect(result.bulletStyle).toBe('x_icon');
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

  it('Imunização calendário: pacote 4/4 no ramo imunizacao_calendario', () => {
    const ctx = {
      questionSlug: 'fundatec-meningo-3m-1',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'imunizacao_calendario' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Imunização' },
          items: [
            { label: 'Marco da questão', detail: '3º mês = Men C', icon: 'Calendar' },
            { label: 'BCG × Men C', detail: 'BCG ao nascer', icon: 'Baby' },
            { label: 'Padrão Fundatec', detail: 'idade exata', icon: 'Target' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('vaccine-timeline');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Imunização' },
          rows: [
            { label: '3 meses — questão', value: 'Meningocócica C 1ª dose', emphasis: 'highlight' },
            { label: 'Letra B — gabarito', value: 'Men C aos 3 meses', emphasis: 'success' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('pni-calendar-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Imunização' },
          reveal_mode: 'tap',
          steps: ['Fixar: 3º mês', 'Testar A (BCG): eliminar', 'Marcar B'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('pni-calendar-elimination-tap');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Imunização' },
          content: 'Pegadinhas calendário',
          items: [
            {
              label: 'Letra A — BCG aos 3 meses',
              detail: 'Marco errado',
              correct: 'BCG = ao nascer',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('calendar-mismatch');
  });

  it('Saúde da Mulher pré-natal: pacote 4/4 no ramo mulher_prenatal', () => {
    const ctx = {
      questionSlug: 'cpcon-saude-mulher-prenatal-vf',
      familyId: 'vf' as const,
      pedagogicalBranch: 'mulher_prenatal' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde da Mulher' },
          items: [
            { label: 'Marco da questão', detail: '1º trimestre — início precoce', icon: 'Calendar' },
            { label: 'Ácido fólico', detail: 'pré-concepção e início', icon: 'Pill' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-gestation-timeline');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde da Mulher' },
          rows: [
            { label: 'TTGO 75g', value: '24–28 semanas', badge: 'hot' },
            { label: 'Consultas mínimas', value: '6 ou mais', badge: 'hot' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-prenatal-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Saúde da Mulher' },
          reveal_mode: 'tap',
          steps: ['I verdadeira', 'II verdadeira', 'III falsa', 'Letra B.'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-prenatal-tap-flow');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde da Mulher' },
          content: 'Pegadinhas pré-natal',
          items: [
            {
              label: 'TTGO no 1º trimestre',
              detail: 'timing errado',
              correct: 'TTGO entre 24 e 28 semanas',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-prenatal-trap-arena');
  });

  it('Saúde da Mulher parto: pacote 4/4 no ramo mulher_parto', () => {
    const ctx = {
      questionSlug: 'admtec-saude-mulher-parto-vf',
      familyId: 'vf' as const,
      pedagogicalBranch: 'mulher_parto' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde da Mulher' },
          items: [
            { label: 'Fase expulsiva', detail: 'Posição vertical ou lateral — não supina fixa', icon: 'Move' },
            { label: 'Dor não farmacológica', detail: 'Água morna e movimentação na dilatação', icon: 'Droplets' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-labor-phase-deck');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde da Mulher' },
          rows: [
            { label: 'Acompanhante', value: 'Livre escolha no trabalho de parto', badge: 'ok' },
            { label: 'Clampeamento tardio', value: '1–3 minutos — ferro neonatal', badge: 'hot' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-parto-humanizado-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Saúde da Mulher' },
          reveal_mode: 'tap',
          steps: ['I falsa', 'II verdadeira', 'III falsa', 'Letra B.'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-labor-tap-flow');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde da Mulher' },
          content: 'Pegadinhas parto humanizado',
          items: [
            {
              label: 'Supina no expulsivo',
              detail: 'posição obrigatória',
              correct: 'Vertical ou lateral — mobilidade materna',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-parto-trap-arena');
  });

  it('Saúde da Mulher papanicolau: pacote 4/4 no ramo mulher_papanicolau', () => {
    const ctx = {
      questionSlug: 'vunesp-saude-mulher-papanicolau',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'mulher_papanicolau' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde da Mulher' },
          items: [
            { label: 'Início rastreio', detail: '25 anos após início da vida sexual', icon: 'Calendar' },
            { label: 'Periodicidade', detail: 'A cada 3 anos se exames anteriores normais', icon: 'Microscope' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-screening-spectrum');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde da Mulher' },
          rows: [
            { label: 'Início', value: '25 anos após início vida sexual', badge: 'hot' },
            { label: 'Término', value: 'Até 64 anos', badge: 'info' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-papanicolau-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Saúde da Mulher' },
          reveal_mode: 'tap',
          steps: ['Eliminar A — 40 anos', 'Eliminar D — anual', 'Letra C.'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-screening-tap-flow');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde da Mulher' },
          content: 'Pegadinhas rastreio colo',
          items: [
            {
              label: '40 anos início',
              detail: 'marco de início do Papanicolau',
              correct: 'Início aos 25 anos — não aos 40',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-screening-trap-arena');
  });

  it('Saúde da Mulher mama: pacote 4/4 no ramo mulher_mama', () => {
    const ctx = {
      questionSlug: 'vunesp-saude-mulher-mamografia',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'mulher_mama' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde da Mulher' },
          items: [
            { label: 'Início rastreio', detail: '50 anos no rastreamento populacional', icon: 'Calendar' },
            { label: 'Periodicidade', detail: 'Bienal — a cada 2 anos', icon: 'Scan' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-mammography-spectrum');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde da Mulher' },
          rows: [
            { label: 'Início', value: '50 anos', badge: 'hot' },
            { label: 'Término', value: 'Até 69 anos', badge: 'info' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-mama-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Saúde da Mulher' },
          reveal_mode: 'tap',
          steps: ['Eliminar A — 40 anos', 'Eliminar D — anual', 'Letra C.'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-mama-tap-flow');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde da Mulher' },
          content: 'Pegadinhas rastreio mama',
          items: [
            {
              label: '40 anos início',
              detail: 'marco de início da mamografia',
              correct: 'Início aos 50 anos — não aos 40',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-mama-trap-arena');
  });

  it('Saúde da Mulher puerpério: pacote 4/4 no ramo mulher_puerperio', () => {
    const ctx = {
      questionSlug: 'ms-saude-mulher-puerperio-consulta',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'mulher_puerperio' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde da Mulher' },
          items: [
            { label: 'Marco da questão', detail: 'Consulta até o 42º dia', icon: 'Calendar' },
            { label: 'Visita', detail: 'Primeira semana após alta', icon: 'Home' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-puerperio-timeline');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde da Mulher' },
          rows: [
            { label: 'Consulta', value: 'Até 42º dia', badge: 'hot' },
            { label: 'AM exclusivo', value: '6 meses', badge: 'info' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-puerperio-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Saúde da Mulher' },
          reveal_mode: 'tap',
          steps: ['B: 30 dias → eliminar', 'Letra A.'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-puerperio-tap-flow');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde da Mulher' },
          content: 'Pegadinhas puerpério',
          items: [
            {
              label: 'Letra B — 30 dias',
              detail: 'puerpério encerra aos 30 dias',
              correct: 'Consulta até o 42º dia',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-puerperio-trap-arena');
  });

  it('Saúde da Mulher planejamento: pacote 4/4 no ramo mulher_planejamento', () => {
    const ctx = {
      questionSlug: 'cpcon-saude-mulher-planejamento-vf',
      familyId: 'vf' as const,
      pedagogicalBranch: 'mulher_planejamento' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde da Mulher' },
          items: [
            { label: 'Pegadinha I', detail: 'Anticoncepcional oral = hormonal', icon: 'AlertTriangle' },
            { label: 'Comportamentais', detail: 'Tabelinha e temperatura basal', icon: 'ListChecks' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-contraception-spectrum');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde da Mulher' },
          rows: [
            { label: 'Comportamentais', value: 'Tabelinha · basal · Billings', badge: 'hot' },
            { label: 'Hormonais', value: 'Anticoncepcional oral', badge: 'info' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-planejamento-board');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Saúde da Mulher' },
          reveal_mode: 'tap',
          steps: ['Julgar I: oral → falsa', 'Marcar E.'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-planejamento-tap-flow');

    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde da Mulher' },
          content: 'Pegadinhas contracepção',
          items: [
            {
              label: 'Letra B — I, II e III',
              detail: 'inclui anticoncepcional oral',
              correct: 'I é hormonal — não comportamental',
            },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('mulher-planejamento-trap-arena');
  });

  it('Imunização cadeia de frio: pacote 4/4 no ramo imunizacao_cadeia_frio', () => {
    const ctx = {
      questionSlug: 'avancasp-enfermagem-processo-de-enfermagem-1780011872350-6',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'imunizacao_cadeia_frio' as const,
    };

    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Imunização' },
          items: [
            { label: 'Cadeia de frio', detail: 'conservação SI-PNI', icon: 'Snowflake' },
            { label: 'Faixa 2–8 °C', detail: 'refrigerador', icon: 'Thermometer' },
            { label: 'Transporte', detail: 'caixa térmica', icon: 'Truck' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('cold-chain-hub');

    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Imunização' },
          rows: [
            { label: 'Faixa PNI', value: '2 °C a 8 °C', emphasis: 'highlight', badge: 'hot' },
            { label: 'Monitorar', value: 'termômetro diário', emphasis: 'default' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('pni-temperature-rail');

    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Imunização' },
          reveal_mode: 'tap',
          steps: ['Decore: 2 °C a 8 °C', 'Eliminar A (piso): abaixo de 2', 'Marcar B'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('pni-cold-chain-tap');

    const danger = resolveSlidePresentation(
      {
        type: 'danger_zone',
        meta: { subtopico: 'Imunização' },
        content: 'Pegadinhas temperatura',
        items: [
          {
            label: 'Letra A — abaixo de 2 °C',
            detail: 'piso errado',
            correct: 'Faixa positiva = 2 a 8 °C',
          },
        ],
      },
      ctx,
    );
    expect(danger.layoutVariant).toBe('temperature-mismatch');
    expect(danger.bulletStyle).toBe('x_icon');
    expect(danger.dangerRevealMode).toBe('tap');
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

  it('Saúde do Adolescente: concept_map adolescent-care-pillars-deck no molde', () => {
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
    expect(result.layoutVariant).toBe('adolescent-care-pillars-deck');
  });

  it('Saúde do Adolescente: golden_rule adolescent-speak-barrier-board com rows no molde', () => {
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
    expect(result.layoutVariant).toBe('adolescent-speak-barrier-board');
  });

  it('Saúde do Adolescente: logic_flow adolescent-exceto-isolate-tap no molde', () => {
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
    expect(result.layoutVariant).toBe('adolescent-exceto-isolate-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('Saúde do Adolescente: danger_zone adolescent-exceto-compare com correct no molde', () => {
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
    expect(result.layoutVariant).toBe('adolescent-exceto-compare');
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

  it('Cuidados na Administração: cam_certos_vf_caso usa pacote bespoke 4/4', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'fepese-cam-1',
      familyId: 'vf' as const,
      pedagogicalBranch: 'cam_certos_vf_caso',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          items: [{ label: 'I — Identificação (V)', detail: 'Dois identificadores — VERDADEIRA.', icon: 'UserCheck' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-certos-deck');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          rows: [{ label: '1. Paciente certo', value: '2 identificadores' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-nine-rights-board');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          steps: ['Julgar I: identificação → VERDADEIRA.'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-vf-juggle-tap');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          content: 'PEGADINHAS',
          items: [{ label: 'Letra C — II e III', detail: 'III parece razoável.', correct: 'III é falsa.' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-certos-trap-arena');
  });

  it('Cuidados na Administração: cam_alto_risco usa pacote bespoke 4/4', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'fepese-cam-insulina-1',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'cam_alto_risco',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          items: [{ label: 'Conferência dupla', detail: 'Insulina = alto risco.', icon: 'Users' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-high-risk-duo-deck');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          rows: [{ label: '1. Conferência dupla', value: 'Dois profissionais' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-high-risk-protocol-board');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          steps: ['Eliminar letra A: massagear após SC — incorreto.'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-alto-risco-elimination-tap');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          content: 'PEGADINHAS TÉCNICAS',
          items: [{ label: 'Letra A — massagear', detail: 'Parece acolher.', correct: 'Não massagear SC.' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-high-risk-trap-arena');
  });

  it('Cuidados na Administração: cam_exceto_conduta usa pacote bespoke 4/4', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'avancasp-cam-exceto-preparo-1',
      familyId: 'certo_errado' as const,
      pedagogicalBranch: 'cam_exceto_conduta',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          items: [{ label: 'Comando EXCETO', detail: 'Preparo sala.', icon: 'Target' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-exceto-rail');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          rows: [{ label: 'Letra A — VO + SF', value: 'Exceção — não diluir oral com SF.' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-exceto-reference-board');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          steps: ['B–E descrevem preparo correto — eliminar uma a uma.'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-exceto-tap-flow');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          content: 'PEGADINHAS EXCETO',
          items: [
            {
              label: 'Letra A — VO com SF',
              detail: 'Parece técnica de diluição.',
              correct: 'VO não usa SF como veículo.',
            },
          ],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-exceto-trap-arena');
  });

  it('Punção Venosa: puncao_flebite usa pacote bespoke 4/4', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'avancasp-puncao-infiltracao-flebite-1',
      familyId: 'conceito' as const,
      pedagogicalBranch: 'puncao_flebite',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          items: [{ label: 'Infiltração', detail: 'Líquido no subcutâneo.', icon: 'Droplets' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-complication-tissue-layers');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          rows: [{ label: 'Infiltração', value: 'líquido SC — edema, dor' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-differential-board');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          steps: ['Ler mecanismo do enunciado — líquido no subcutâneo.'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-complication-tap-flow');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          content: 'TROCA DE RÓTULO',
          items: [
            {
              label: 'Letra D — Flebite',
              detail: 'Parece inflamação da veia.',
              correct: 'Infiltração — líquido fora do vaso.',
            },
          ],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-label-swap-trap');
  });

  it('Cuidados na Administração: cam_documentacao usa pacote bespoke 4/4', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'avancasp-cam-documentacao-1',
      familyId: 'vf' as const,
      pedagogicalBranch: 'cam_documentacao',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          items: [{ label: 'I — Após administrar (V)', detail: 'Certo 6.', icon: 'ClipboardCheck' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-documentacao-deck');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          rows: [{ label: 'Certo 6', value: 'Registro após administrar dose.' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-documentacao-board');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          steps: ['I verdadeira — anotar após administrar.'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-documentacao-vf-tap');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Cuidados na Administração de Medicamentos' },
          content: 'PEGADINHAS REGISTRO',
          items: [
            {
              label: 'Letra B — II e III',
              detail: 'II parece razoável.',
              correct: 'II é falsa — registro antecipado.',
            },
          ],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cam-documentacao-trap-arena');
  });

  it('Vias de Administração: via_tecnica_admin usa molde genérico (banner + cards + compare)', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'cpcon-vias-im-1',
      familyId: 'vf' as const,
      pedagogicalBranch: 'via_tecnica_admin',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Vias de Administração' },
          items: [
            { label: 'IM', detail: 'Ventroglúteo', icon: 'Syringe' },
            { label: 'Palpação', detail: 'Marcos ósseos', icon: 'Bone' },
            { label: 'Conforto', detail: 'Distração', icon: 'Heart' },
          ],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('morphological');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Vias de Administração' },
          content: 'TÉCNICA IM — ventroglúteo e palpação',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('banner');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Vias de Administração' },
          steps: ['Julgar I', 'Marcar E'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('cards');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Vias de Administração' },
          content: 'Pegadinhas',
          items: [{ label: 'Letra A', detail: 'Inverte', correct: 'Afirmativa correta' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('compare');
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
    expect(result.layoutVariant).toBe('infusao-ev-station-deck');
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

  it('Punção Venosa: fallback genérico sem pedagogical_branch', () => {
    const ctx = {
      questionSlug: 'puncao-generico-1',
      familyId: 'protocolo' as const,
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          items: [
            { label: 'Contexto', detail: 'acesso venoso' },
            { label: 'Cuidado', detail: 'identificação' },
            { label: 'Etapa', detail: 'fixação' },
          ],
        },
        ctx,
      ).layoutVariant,
    ).toBe('bridge');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          rows: [{ label: 'Item', value: 'valor' }],
        },
        ctx,
      ).layoutVariant,
    ).toBe('reference_table');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          steps: ['1', '2', '3'],
        },
        ctx,
      ).layoutVariant,
    ).toBe('cards');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          content: 'Pegadinhas',
          items: [{ label: 'A', detail: 'trap', correct: 'certo' }],
        },
        ctx,
      ).layoutVariant,
    ).toBe('compare');
  });

  it('Punção Venosa: puncao_ipcs_cvc usa pacote bundle 4/4', () => {
    const branchCtx: SlidePresentationContext = {
      questionSlug: 'adm-tec-puncao-ipcs-1',
      familyId: 'protocolo' as const,
      pedagogicalBranch: 'puncao_ipcs_cvc',
    };
    expect(
      resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          items: [{ label: 'Barreira', detail: 'estéril máxima', icon: 'Shield' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-bundle-orbit');
    expect(
      resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          rows: [{ label: 'Bundle', value: 'higiene + barreira' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-bundle-mesh-reveal');
    expect(
      resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          steps: ['Identificar item do bundle'],
          reveal_mode: 'tap',
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-bundle-tap-flow');
    expect(
      resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
          content: 'PEGADINHAS BUNDLE',
          items: [{ label: 'Curativo úmido', detail: 'trap', correct: 'Trocar curativo' }],
        },
        branchCtx,
      ).layoutVariant,
    ).toBe('iv-bundle-break-trap');
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

  it('Doenças Respiratórias Crônicas: logic_flow respiratorio-vf-juggle-tap no molde VF', () => {
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
        pedagogicalBranch: 'respiratorio_vf_asma_dpoc',
      },
    );
    expect(result.layoutVariant).toBe('respiratorio-vf-juggle-tap');
    expect(result.revealMode).toBe('tap');
  });

  it('Doenças Respiratórias Crônicas: ramo dpoc_oxigenio → logic_flow cards', () => {
    const result = resolveSlidePresentation(
      {
        type: 'logic_flow',
        meta: { subtopico: 'Doenças Respiratórias Crônicas (Asma, DPOC)' },
        steps: [
          'I: O₂ titulado na DPOC → verdadeira.',
          'III: SpO₂ 98–100% sempre → falsa.',
          'Letra B.',
        ],
        reveal_mode: 'tap',
      },
      {
        questionSlug: 'cpcon-dpoc-1',
        slideIndex: 2,
        familyId: 'protocolo',
        pedagogicalBranch: 'respiratorio_dpoc_oxigenio',
      },
    );
    expect(result.layoutVariant).toBe('cards');
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
        pedagogicalBranch: 'respiratorio_dpoc_oxigenio',
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

  describe('Doenças Bacterianas — tuberculose (molde inédito)', () => {
    const subtopico =
      'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
    const branch = 'bacterianas_tuberculose';

    it('concept_map → tb-vigilance-rail', () => {
      const result = resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [{ label: 'Notificação', detail: 'TB compulsória', icon: 'FileWarning' }],
        },
        { questionSlug: 'cpcon-tb-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('tb-vigilance-rail');
    });

    it('golden_rule com rows → tb-precaution-board', () => {
      const result = resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico },
          content: 'Vigilância TB',
          rows: [{ label: 'BAAR', value: 'Escarro', badge: 'ok' }],
        },
        { questionSlug: 'cpcon-tb-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('tb-precaution-board');
    });

    it('logic_flow → tb-vf-elimination-tap', () => {
      const result = resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico },
          steps: ['III: só pele → falsa.'],
          reveal_mode: 'tap',
        },
        { questionSlug: 'cpcon-tb-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('tb-vf-elimination-tap');
    });

    it('danger_zone com correct → tb-transmission-trap', () => {
      const result = resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico },
          content: 'PEGADINHAS TB',
          items: [
            {
              label: 'TB = contato',
              detail: 'Via errada',
              correct: 'Aerossóis e gotículas',
            },
          ],
        },
        { questionSlug: 'cpcon-tb-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('tb-transmission-trap');
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

  describe('Infecções Biossegurança — genérico IRAS/precauções (molde bespoke)', () => {
    const subtopico = 'Infecções no Contexto da Biossegurança';
    const branch = 'biosseg_generico';

    it('concept_map → biosseg-precaution-deck', () => {
      const result = resolveSlidePresentation(
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [{ label: 'Precaução padrão', detail: 'higiene das mãos para todos', icon: 'Shield' }],
        },
        { questionSlug: 'fepese-biosseg-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('biosseg-precaution-deck');
    });

    it('golden_rule com rows → biosseg-reference-board', () => {
      const result = resolveSlidePresentation(
        {
          type: 'golden_rule',
          meta: { subtopico },
          content: 'IRAS',
          rows: [{ label: 'Cadeia', value: '6 elos — I correta', badge: 'ok' }],
        },
        { questionSlug: 'fepese-biosseg-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('biosseg-reference-board');
    });

    it('logic_flow → biosseg-vf-juggle-tap', () => {
      const result = resolveSlidePresentation(
        {
          type: 'logic_flow',
          meta: { subtopico },
          steps: ['I: cadeia de infecção → verdadeira.', 'Letra B.'],
          reveal_mode: 'tap',
        },
        { questionSlug: 'fepese-biosseg-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('biosseg-vf-juggle-tap');
    });

    it('danger_zone com correct → biosseg-trap-chips', () => {
      const result = resolveSlidePresentation(
        {
          type: 'danger_zone',
          meta: { subtopico },
          content: 'PEGADINHAS',
          items: [
            {
              label: 'Recapear agulha',
              detail: 'Descarte no lixo comum',
              correct: 'Coletor perfurocortante grupo E',
            },
          ],
        },
        { questionSlug: 'fepese-biosseg-1', pedagogicalBranch: branch },
      );
      expect(result.layoutVariant).toBe('biosseg-trap-chips');
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
      expect(result.layoutVariant).toBe('adolescent-speak-barrier-board');
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

  describe('Crase / pt_crase — pacote bespoke pt-crase-funnel', () => {
    const subtopico = 'Crase';
    const slug = 'vunesp-pref-itatiba-transito-2025-crase-funil';

    it('concept_map → pt-crase-funnel-deck com pedagogical_branch pt_crase', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: 'Crase = a + a', detail: 'Fusão prep. a + artigo a → à/às.', icon: 'Filter' },
          { label: 'Teste 1 — masculino', detail: 'Antes de masculino = sem crase (vira ao).', icon: 'XCircle' },
          { label: 'Teste 2 — verbo', detail: 'Antes de verbo/infinitivo = só prep. a.', icon: 'Ban' },
          { label: 'Teste 3 — a + a', detail: 'Prep. a + artigo a feminino = à.', icon: 'CheckCircle2' },
          { label: 'Crase automática', detail: 'Marcar à porque parece culto — sem funil.', icon: 'AlertTriangle' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_crase' },
        'Assinale a alternativa redigida em conformidade com a norma-padrão de emprego do acento indicativo de crase.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_crase' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_crase');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-crase-funnel-deck');
    });

    it('logic_flow → pt-crase-funnel-tap-flow com reveal_mode tap', () => {
      const slide = {
        type: 'logic_flow' as const,
        meta: { subtopico },
        reveal_mode: 'tap' as const,
        steps: [
          'A: «à estudar» — verbo no T2 → sem crase.',
          'B: «abordam à» — sem a+a → crase automática.',
          'D: «à todos» — pronome/masc. → T1 barra.',
          'E: «à ferramentas» — plural: às ou a — nunca à.',
          'C: dirigem-se à Serra da Capivara — a+a → passa T3.',
          'Gabarito C — única que sobrevive ao funil.',
          'Em similares: masculino? verbo? a+a? — só então marque à.',
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 1, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_crase' },
        'Assinale a alternativa em conformidade com o emprego do acento indicativo de crase.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_crase' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_crase');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-crase-funnel-tap-flow');
      expect(result.revealMode).toBe('tap');
    });

    it('golden_rule → pt-crase-funnel-board com rows do funil', () => {
      const slide = {
        type: 'golden_rule' as const,
        meta: { subtopico },
        content: 'FUNIL: MASC → VERBO → A+A',
        rows: [
          { label: 'Teste 1', value: 'masculino → sem crase' },
          { label: 'Teste 2', value: 'verbo/infinitivo → sem crase' },
          { label: 'Teste 3', value: 'a + a feminino → à / às', emphasis: 'success' as const },
          { label: 'Teste ao', value: 'ao no masc. → à no feminino', emphasis: 'highlight' as const },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 2, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_crase' },
        'Assinale a alternativa em conformidade com o emprego do acento indicativo de crase.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_crase' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_crase');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-crase-funnel-board');
    });

    it('danger_zone → pt-crase-trap-arena com items.correct, bulletStyle x_icon, revealMode tap', () => {
      const slide = {
        type: 'danger_zone' as const,
        meta: { subtopico },
        bullet_style: 'x_icon' as const,
        content: 'Funil barra a crase automática',
        items: [
          {
            label: 'A — à + verbo',
            detail: '«À estudar» parece culto, mas T2 barra.',
            correct: 'Antes de verbo = só prep. a (sem crase).',
          },
          {
            label: 'B — à + OD',
            detail: 'À colado em «versatilidade» sem a+a.',
            correct: 'Abordar pede OD: a versatilidade — sem crase.',
          },
          {
            label: 'D — à todos',
            detail: 'À antes de «todos» soa norma, mas falha.',
            correct: 'Pronome rejeita artigo a → sem crase.',
          },
          {
            label: 'E — à + plural',
            detail: 'À + «ferramentas» sem acordo de número.',
            correct: 'Plural: às (c/ artigo) ou a (sem) — nunca à.',
          },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 3, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_crase' },
        'Assinale a alternativa em conformidade com o emprego do acento indicativo de crase.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_crase' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_crase');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-crase-trap-arena');
      expect(result.bulletStyle).toBe('x_icon');
      expect(result.dangerRevealMode).toBe('tap');
    });

    it('Crase sem pedagogical_branch explícito: inferência marca pt_crase pelos sinais', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: 'Crase = a + a', detail: 'Fusão prep. a + artigo a → à.' },
          { label: 'Teste 1', detail: 'masculino → sem crase (vira ao).' },
          { label: 'Teste 2', detail: 'verbo → sem crase.' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        slide.meta,
        'Assinale a alternativa redigida em conformidade com a norma-padrão de emprego do acento indicativo de crase.',
        [slide],
        { subtopico },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_crase');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-crase-funnel-deck');
    });
  });

  describe('Colocação / pt_pronomes_colocacao — pacote bespoke pt-clitic-rail', () => {
    const subtopico = 'Pronomes e colocação pronominal';
    const slug = 'vunesp-sorocaba-colocacao-alcool-reescrita-3999766';

    it('concept_map → pt-clitic-rail-deck com pedagogical_branch pt_pronomes_colocacao', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: '1. Pergunte: atrativo?', detail: 'Há palavra à esquerda que puxa o átono?', icon: 'Filter' },
          { label: '2. Estação próclise', detail: 'Com atrativo → pronome ANTES.', icon: 'ArrowLeft' },
          { label: '3. Estação ênclise', detail: 'Sem atrativo → pronome DEPOIS.', icon: 'ArrowRight' },
          { label: 'Armadilha comum', detail: 'Não enclise só porque parece culto.', icon: 'AlertTriangle' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pronomes_colocacao' },
        'Assinale a alternativa em que a reescrita está em conformidade com a norma-padrão de colocação pronominal.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pronomes_colocacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pronomes_colocacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-clitic-rail-deck');
    });

    it('logic_flow → pt-clitic-rail-tap-flow com reveal_mode tap', () => {
      const slide = {
        type: 'logic_flow' as const,
        meta: { subtopico },
        reveal_mode: 'tap' as const,
        steps: [
          'B: «Já bebia-se» — Já atrai → precisa próclise.',
          'C: «Quando fala-se» — Quando atrai → Quando se fala.',
          'E: «tem dedicado-se» — particípio não admite ênclise.',
          'A: «a manifestar-se» — infinitivo; ênclise ok.',
          'Gabarito A — única que embarca na estação certa.',
          'Em similares: há atrativo? → pró / ên / meso.',
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 1, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pronomes_colocacao' },
        'Assinale a alternativa em conformidade com a norma-padrão de colocação pronominal.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pronomes_colocacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pronomes_colocacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-clitic-rail-tap-flow');
      expect(result.revealMode).toBe('tap');
    });

    it('golden_rule → pt-clitic-rail-board com rows do trilho', () => {
      const slide = {
        type: 'golden_rule' as const,
        meta: { subtopico },
        content: 'PERGUNTE: HÁ ATRATIVO?',
        rows: [
          { label: 'Pergunta-chave', value: 'há atrativo? → próclise', emphasis: 'highlight' as const },
          { label: 'Próclise', value: 'não, já, quando…', emphasis: 'success' as const },
          { label: 'Ênclise', value: 'início OU sem atrativo' },
          { label: 'Cuidado especial', value: 'particípio sem ênclise', emphasis: 'alert' as const },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 2, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pronomes_colocacao' },
        'Assinale a alternativa em conformidade com a norma-padrão de colocação pronominal.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pronomes_colocacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pronomes_colocacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-clitic-rail-board');
    });

    it('danger_zone → pt-clitic-trap-arena com items.correct, bulletStyle x_icon, revealMode tap', () => {
      const slide = {
        type: 'danger_zone' as const,
        meta: { subtopico },
        bullet_style: 'x_icon' as const,
        content: 'Trilho barra a ênclise automática',
        items: [
          {
            label: 'B — Já + ênclise',
            detail: '«Já bebia-se» parece culto, mas Já atrai.',
            correct: 'Advérbio atrai → Já se bebia (próclise).',
          },
          {
            label: 'C — Quando + ênclise',
            detail: 'Ênclise depois de Quando ignora a atração.',
            correct: 'Conjunção atrai → Quando se fala.',
          },
          {
            label: 'E — particípio + -se',
            detail: 'tem dedicado-se cola ênclise onde não cabe.',
            correct: 'Particípio não enclisa → tem-se dedicado.',
          },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 3, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pronomes_colocacao' },
        'Assinale a alternativa em conformidade com a norma-padrão de colocação pronominal.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pronomes_colocacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pronomes_colocacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-clitic-trap-arena');
      expect(result.bulletStyle).toBe('x_icon');
      expect(result.dangerRevealMode).toBe('tap');
    });

    it('Colocação sem pedagogical_branch explícito: inferência marca pt_pronomes_colocacao pelos sinais', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: 'Próclise', detail: 'Antes do verbo — atrativo à esquerda.' },
          { label: 'Ênclise', detail: 'Depois do verbo — início ou sem atrativo.' },
          { label: 'Há atrativo?', detail: 'Pergunta-teste do trilho clítico.' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        slide.meta,
        'Assinale a alternativa em conformidade com a norma-padrão de colocação pronominal.',
        [slide],
        { subtopico },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pronomes_colocacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-clitic-rail-deck');
    });
  });

  describe('Pontuação / pt_pontuacao — pacote bespoke pt-comma-rail', () => {
    const subtopico = 'Pontuação';
    const slug = 'avancasp-aae-pref-potim-pontuacao-rita-3839712';

    it('concept_map → pt-comma-rail-deck com pedagogical_branch pt_pontuacao', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: '1. Ache a vírgula', detail: 'Localize o que a vírgula tenta isolar.', icon: 'ScanSearch' },
          { label: '2. Pergunte: isola o quê?', detail: 'Vocativo? Aposto? Ou corta sujeito|verbo?', icon: 'HelpCircle' },
          { label: 'Trilho livre: sujeito|verbo', detail: 'Núcleo colado ao verbo — sem vírgula no meio.', icon: 'GitCommitHorizontal' },
          { label: 'Armadilha comum', detail: 'Pausa na fala não autoriza vírgula entre Eu e farei.', icon: 'AlertTriangle' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pontuacao' },
        'Assinale a alternativa que contém a frase correta em relação à pontuação.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pontuacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pontuacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-comma-rail-deck');
    });

    it('logic_flow → pt-comma-rail-tap-flow com reveal_mode tap', () => {
      const slide = {
        type: 'logic_flow' as const,
        reveal_mode: 'tap' as const,
        meta: { subtopico },
        steps: [
          'D: «Eu, farei» — vírgula entre sujeito e verbo. Proibido.',
          'B: «Rita,» chama a pessoa (vocativo) + pergunta. Isola certo.',
          'Gabarito B — única com vocativo isolado e trilho sujeito|verbo intacto.',
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 1, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pontuacao' },
        'Assinale a alternativa que contém a frase correta em relação à pontuação.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pontuacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pontuacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-comma-rail-tap-flow');
      expect(result.revealMode).toBe('tap');
    });

    it('golden_rule → pt-comma-rail-board com rows do trilho', () => {
      const slide = {
        type: 'golden_rule' as const,
        meta: { subtopico },
        content: 'O QUE A VÍRGULA ISOLA?',
        rows: [
          { label: 'Pergunta-chave', value: 'A vírgula isola vocativo/aposto — ou corta sujeito|verbo?', emphasis: 'highlight' as const },
          { label: 'Não pode', value: 'Sujeito|verbo: Eu farei — nunca Eu, farei.', emphasis: 'alert' as const },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 2, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pontuacao' },
        'Assinale a alternativa que contém a frase correta em relação à pontuação.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pontuacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pontuacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-comma-rail-board');
    });

    it('danger_zone → pt-comma-trap-arena com compare tap + x_icon', () => {
      const slide = {
        type: 'danger_zone' as const,
        bullet_style: 'x_icon' as const,
        meta: { subtopico },
        content: 'Cada erro = um corte do trilho',
        items: [
          {
            label: 'D — Eu, farei',
            detail: 'Pausa na fala parece justificar a vírgula.',
            correct: 'Sujeito|verbo nunca se separam: Eu farei.',
          },
          {
            label: 'E — você, irá',
            detail: 'Corta o verbo e esquece o vocativo.',
            correct: 'Vocativo isolado; trilho você irá intacto.',
          },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 3, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_pontuacao' },
        'Assinale a alternativa que contém a frase correta em relação à pontuação.',
        [slide],
        { subtopico, pedagogical_branch: 'pt_pontuacao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pontuacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-comma-trap-arena');
      expect(result.bulletStyle).toBe('x_icon');
      expect(result.dangerRevealMode).toBe('tap');
    });

    it('Pontuação sem pedagogical_branch explícito: inferência marca pt_pontuacao pelos sinais', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: 'O que isola?', detail: 'Vocativo, aposto ou sujeito|verbo?' },
          { label: 'Trilho livre', detail: 'Sujeito colado ao verbo — sem vírgula.' },
          { label: 'Vírgula', detail: 'Pontuação na frase correta.' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        slide.meta,
        'Assinale a alternativa que contém a frase correta em relação à pontuação.',
        [slide],
        { subtopico },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_pontuacao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-comma-rail-deck');
    });
  });

  describe('Termos da oração / pt_termos_oracao — pacote bespoke pt-term-matrix', () => {
    const subtopico = 'Termos da oração';
    const slug = 'vunesp-sjrp-termos-folhetos-enquanto-3789304';

    it('concept_map → pt-term-matrix-deck com pedagogical_branch pt_termos_oracao', () => {
      const slide = {
        type: 'concept_map' as const,
        meta: { subtopico },
        items: [
          { label: '1. Termo = cargo', detail: 'Cada destacado tem uma função na oração.', icon: 'Boxes' },
          { label: '2. Modifica verbo?', detail: 'Circunstância → adjunto adverbial.', icon: 'CornerDownRight' },
          { label: 'Pegadinha: vizinho', detail: 'Colar o rótulo do termo ao lado.', icon: 'AlertTriangle' },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 0, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_termos_oracao' },
        'Em «No grupo que só recebeu os folhetos» os termos classificam-se como',
        [slide],
        { subtopico, pedagogical_branch: 'pt_termos_oracao' },
      );
      expect(ctx.pedagogicalBranch).toBe('pt_termos_oracao');
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-term-matrix-deck');
    });

    it('logic_flow → pt-term-matrix-tap-flow com reveal_mode tap', () => {
      const slide = {
        type: 'logic_flow' as const,
        reveal_mode: 'tap' as const,
        meta: { subtopico },
        steps: [
          'T1 «No grupo… folhetos»: circunstância do verbo «foi» — adjunto adverbial deslocado.',
          'Gabarito E — adj. adverbial deslocado + loc. adverbial de tempo.',
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 1, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_termos_oracao' },
        'classificam-se, respectivamente, como',
        [slide],
        { subtopico, pedagogical_branch: 'pt_termos_oracao' },
      );
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-term-matrix-tap-flow');
      expect(result.revealMode).toBe('tap');
    });

    it('golden_rule → pt-term-matrix-board com rows da matriz', () => {
      const slide = {
        type: 'golden_rule' as const,
        meta: { subtopico },
        content: 'PERGUNTA → CARGO (×2)',
        rows: [
          { label: 'Modifica verbo?', value: 'Adjunto adverbial', emphasis: 'success' as const },
          { label: 'Enquanto / quando', value: 'Locução adverbial de tempo', emphasis: 'success' as const },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 2, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_termos_oracao' },
        'adjunto adverbial deslocado',
        [slide],
        { subtopico, pedagogical_branch: 'pt_termos_oracao' },
      );
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-term-matrix-board');
    });

    it('danger_zone → pt-term-trap-arena com compare tap + x_icon', () => {
      const slide = {
        type: 'danger_zone' as const,
        bullet_style: 'x_icon' as const,
        meta: { subtopico },
        content: 'Rótulo do vizinho — onde a matriz barra',
        items: [
          {
            label: 'A — CN em T1',
            detail: '«No grupo… folhetos» parece completar «taxa».',
            correct: 'T1 circunstancia «foi» — adjunto adverbial deslocado.',
          },
        ],
      };
      const ctx = enrichPresentationContext(
        { questionSlug: slug, slideIndex: 3, familyId: 'conceito' },
        { ...slide.meta, pedagogical_branch: 'pt_termos_oracao' },
        'complemento nominal e adjunto adverbial',
        [slide],
        { subtopico, pedagogical_branch: 'pt_termos_oracao' },
      );
      const result = resolveSlidePresentation(slide, ctx);
      expect(result.layoutVariant).toBe('pt-term-trap-arena');
      expect(result.bulletStyle).toBe('x_icon');
      expect(result.dangerRevealMode).toBe('tap');
    });
  });
});
