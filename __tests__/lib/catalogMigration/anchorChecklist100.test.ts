import {
  ANCHOR_CHECKLIST_AGENT,
  applyAnchor100ApprovalToPayload,
  auditAnchorChecklist100,
  detectDualIdeaStrings,
} from '@/lib/catalogMigration/anchorChecklist100';

function basePayload(overrides?: {
  conceptDetail?: string;
  logicSteps?: string[];
  dangerItems?: { label: string; detail?: string; correct: string }[];
  contentStandard?: boolean;
  riskNumber?: boolean;
}) {
  const instruction = overrides?.riskNumber
    ? 'Na RCP, a dose de adrenalina é 1 mg EV. Assinale a correta sobre Nightingale.'
    : 'Sobre Florence Nightingale, assinale a alternativa correta.';

  return {
    meta: {
      banca: 'FCC',
      topico: 'Enfermagem',
      subtopico: 'História da Enfermagem',
      ano: '2024',
      content_standard: 'golden-v1' as const,
      family: 'conceito' as const,
      content_review: {
        reviewed_at: '2026-01-01',
        guideline_snapshot: 'COFEN — marco histórico TE',
        exam_vs_current: 'none' as const,
      },
      sources: [
        {
          id: 'cofen-hist',
          tier: 'A' as const,
          issuer: 'COFEN',
          title: 'Marco histórico enfermagem',
          year: 2024,
          covers: ['Nightingale'],
        },
      ],
    },
    question_data: {
      instruction,
      options: [
        { id: 'A', text: 'Fundou a Cruz Vermelha.', is_correct: false },
        { id: 'B', text: 'Organizou a enfermagem moderna em Scutari.', is_correct: true },
        { id: 'C', text: 'Criou o SUS no Brasil.', is_correct: false },
        { id: 'D', text: 'Escreveu só poesia.', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        items: [
          {
            label: 'Tema da prova',
            detail: overrides?.conceptDetail ?? 'Nightingale e a enfermagem moderna na Guerra da Crimeia.',
            icon: 'Target',
          },
          {
            label: 'Marco',
            detail: 'Organização do cuidado e estatística em Scutari.',
            icon: 'BookOpen',
          },
          {
            label: 'Pegadinha',
            detail: 'Confundir Nightingale com fundação da Cruz Vermelha.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Scutari ≠ Cruz Vermelha.',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        footer_rule: 'Elimine anacronismos antes de marcar.',
        steps: overrides?.logicSteps ?? [
          'Identificar que a banca cobra o marco de Nightingale.',
          'Eliminar A — Cruz Vermelha remete a Dunant, não a ela.',
          'Eliminar C — SUS é século XX Brasil.',
          'Marcar B — organização do cuidado em Scutari.',
          'Em similares: marco histórico ≠ instituição homônima.',
        ],
      },
      {
        type: 'golden_rule',
        content: 'Nightingale',
        rows: [
          { label: 'Marco', value: 'Enfermagem moderna / Scutari' },
          { label: 'Não confundir', value: 'Cruz Vermelha (Dunant)' },
        ],
        footer_rule: 'Decore o marco, não a letra.',
      },
      {
        type: 'danger_zone',
        content: 'Distratores',
        footer_rule: 'Anacronismo elimina rápido.',
        items: overrides?.dangerItems ?? [
          {
            label: 'Letra A — Cruz Vermelha',
            detail: 'Parece filantropia de guerra',
            correct: 'Cruz Vermelha associa-se a Dunant, não a Nightingale.',
          },
          {
            label: 'Letra C — SUS',
            detail: 'Parece saúde pública',
            correct: 'SUS é marco brasileiro do século XX.',
          },
          {
            label: 'Letra D — só poesia',
            detail: 'Parece biografia literária',
            correct: 'Reduz o legado assistencial e estatístico.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra banca',
            correct: 'Em similares: personagem ≠ instituição homônima.',
          },
        ],
      },
    ],
  };
}

describe('detectDualIdeaStrings', () => {
  it('marca duas sentenças longas no mesmo card', () => {
    const payload = basePayload({
      conceptDetail:
        'Primeira ideia completa sobre o marco histórico da enfermagem moderna na Guerra da Crimeia e o papel de Scutari. Segunda ideia distinta sobre estatística e organização do hospital no mesmo card de conceito.',
    });
    const fails = detectDualIdeaStrings(payload);
    expect(fails.some((f) => f.includes('concept_map'))).toBe(true);
  });

  it('não marca frase única ou detail curto com ponto', () => {
    const fails = detectDualIdeaStrings(basePayload());
    expect(fails).toEqual([]);
    const shortDual = basePayload({
      conceptDetail: 'Primeira frase curta. Segunda também curta.',
    });
    expect(detectDualIdeaStrings(shortDual)).toEqual([]);
  });
});

describe('auditAnchorChecklist100', () => {
  it('gates_pass em âncora bem formada (risco baixo/médio)', () => {
    const result = auditAnchorChecklist100(basePayload(), {
      filePath: 'examples/test-anchor.json',
      isoDate: '2026-08-05',
    });
    expect(result.checks.ready_strict.pass).toBe(true);
    expect(result.checks.no_spoiler_cm_gr.pass).toBe(true);
    expect(result.checks.danger_zone_complete.pass).toBe(true);
    expect(result.gates_pass).toBe(true);
    expect(result.verdict).toBe('pass');
    expect(result.approval.status).toBe('pending');
  });

  it('--sign-agent assina quando agent_may_sign', () => {
    const result = auditAnchorChecklist100(basePayload(), {
      signAgent: true,
      isoDate: '2026-08-05',
    });
    expect(result.gates_pass).toBe(true);
    expect(result.agent_may_sign).toBe(true);
    expect(result.approval.status).toBe('pass');
    expect(result.approval.reviewer).toBe(ANCHOR_CHECKLIST_AGENT);
    expect(result.approval.method).toBe('agent');
  });

  it('spoiler no concept_map falha no_spoiler', () => {
    const payload = basePayload();
    const firstItem = payload.reverse_study_slides[0]?.items?.[0];
    expect(firstItem).toBeDefined();
    (firstItem as { detail: string }).detail = 'Gabarito letra B — troca por protocolo.';
    const result = auditAnchorChecklist100(payload, { isoDate: '2026-08-05' });
    expect(result.checks.no_spoiler_cm_gr.pass).toBe(false);
    expect(result.gates_pass).toBe(false);
    expect(result.verdict).toBe('fail');
  });

  it('overlay reviewer pode reprovar teach_once', () => {
    const result = auditAnchorChecklist100(basePayload(), {
      isoDate: '2026-08-05',
      reviewerOverlay: {
        teach_once: {
          pass: false,
          evidence: 'Dois eixos no mesmo step',
          reviewer: 'agent:reviewer-b',
        },
      },
    });
    expect(result.checks.teach_once.pass).toBe(false);
    expect(result.checks.teach_once.source).toBe('llm');
    expect(result.gates_pass).toBe(false);
  });

  it('--sign-human fecha human_required', () => {
    const result = auditAnchorChecklist100(basePayload({ riskNumber: true }), {
      signHuman: 'PC',
      isoDate: '2026-08-05',
    });
    if (result.gates_pass) {
      expect(result.approval.status).toBe('pass');
      expect(result.approval.reviewer).toBe('PC');
      expect(result.approval.method).toBe('human');
    }
  });

  it('applyAnchor100ApprovalToPayload grava meta', () => {
    const signed = auditAnchorChecklist100(basePayload(), {
      signAgent: true,
      isoDate: '2026-08-05',
    });
    const next = applyAnchor100ApprovalToPayload(basePayload(), signed.approval) as {
      meta: { anchor_100_approval?: { status?: string } };
    };
    expect(next.meta.anchor_100_approval?.status).toBe(signed.approval.status);
  });

  it('--require-visual falha sem registry/capture', () => {
    const result = auditAnchorChecklist100(basePayload(), {
      requireVisual: true,
      slug: 'slug-sem-capture-xyz',
      isoDate: '2026-08-05',
    });
    expect(result.checks.gesture_g2.pass).toBe(false);
    expect(result.gates_pass).toBe(false);
  });
});
