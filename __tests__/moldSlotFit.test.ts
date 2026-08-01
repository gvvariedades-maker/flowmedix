import { countMoldInteractiveSlots } from '@/lib/slides/moldSlotFit';
import { detectMoldL3Mismatch } from '@/lib/slides/detectMoldL3Mismatch';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';

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

  it('speak-barrier: 4 rows de gravidez/determinantes sem barreira → 0 slots', () => {
    const slide = {
      type: 'golden_rule' as const,
      content: 'DETERMINANTES',
      rows: [
        { label: 'Baixa escolaridade', value: 'Associação com gravidez na adolescência' },
        { label: 'Renda familiar', value: 'Contexto socioeconômico vulnerável' },
        { label: 'Acesso à saúde', value: 'Falta de pré-natal e contraceptivos' },
        { label: 'Rede de apoio', value: 'Família e território influenciam o desfecho' },
      ],
    };
    expect(countMoldInteractiveSlots('adolescent-speak-barrier-board', slide)).toBe(0);
  });

  it('speak-barrier: ok + barreira → slots = rows', () => {
    const slide = {
      type: 'golden_rule' as const,
      rows: [
        { label: 'Como falar', value: 'Linguagem clara e acessível' },
        { label: 'Barreira', value: 'Não falar com jargão rebuscado' },
      ],
    };
    expect(countMoldInteractiveSlots('adolescent-speak-barrier-board', slide)).toBe(2);
  });

  it('exceto-isolate-board: steps genéricos sem keep+exception → 0', () => {
    const slide = {
      type: 'logic_flow' as const,
      steps: [
        'Passo 1: leia o enunciado',
        'Passo 2: elimine as letras',
        'Passo 3: marque o gabarito',
      ],
    };
    expect(countMoldInteractiveSlots('adolescent-exceto-isolate-board', slide)).toBe(0);
    expect(countMoldInteractiveSlots('pni-exceto-isolate-board', slide)).toBe(0);
  });

  it('exceto-isolate-board: keep + exception → slots = steps', () => {
    const slide = {
      type: 'logic_flow' as const,
      steps: [
        'Manter: acolhimento e escuta',
        'Exceção: conduta que afasta o adolescente',
        'Gabarito letra B',
      ],
    };
    expect(countMoldInteractiveSlots('adolescent-exceto-isolate-board', slide)).toBe(3);
  });
});

describe('moldSlotFit — readiness gravidez × speak-barrier', () => {
  const gravidezPayload = {
    meta: {
      banca: 'CPCON',
      topico: 'Saúde Pública',
      subtopico: 'Saúde do Adolescente',
      family: 'conceito' as const,
      content_standard: 'golden-v1' as const,
      pedagogical_branch: 'adolescente_etica_sigilo',
    },
    question_data: {
      instruction:
        'Sobre gravidez na adolescência e determinantes sociais, assinale a alternativa correta.',
      options: [
        { id: 'A', text: 'Escolaridade', is_correct: true },
        { id: 'B', text: 'Irrelevante', is_correct: false },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        meta: { subtopico: 'Saúde do Adolescente' },
        items: [
          { label: 'Escolaridade', detail: 'Baixa escolaridade correlaciona' },
          { label: 'Renda', detail: 'Vulnerabilidade socioeconômica' },
          { label: 'Acesso', detail: 'Pré-natal e contraceptivos' },
        ],
      },
      {
        type: 'golden_rule',
        meta: { subtopico: 'Saúde do Adolescente' },
        content: 'DETERMINANTES',
        rows: [
          { label: 'Baixa escolaridade', value: 'Fator associado à gravidez' },
          { label: 'Renda familiar', value: 'Contexto socioeconômico' },
          { label: 'Acesso à saúde', value: 'Falta de pré-natal' },
          { label: 'Rede de apoio', value: 'Família e território' },
        ],
      },
      {
        type: 'logic_flow',
        meta: { subtopico: 'Saúde do Adolescente' },
        steps: ['Leia o comando', 'Elimine distratores', 'Marque a letra'],
        reveal_mode: 'tap',
      },
      {
        type: 'danger_zone',
        meta: { subtopico: 'Saúde do Adolescente' },
        content: 'Pegadinhas',
        items: [
          {
            label: 'A',
            detail: 'Escolaridade irrelevante',
            correct: 'Escolaridade é determinante social',
          },
        ],
      },
    ],
  };

  it('detectMoldL3Mismatch: golden_rule speak-barrier sem pólos → mold_l3_zero_slots', () => {
    const issues = detectMoldL3Mismatch(gravidezPayload, {
      pedagogicalBranch: 'adolescente_etica_sigilo',
    });
    expect(issues.some((i) => i.code === 'mold_l3_zero_slots' && i.slideType === 'golden_rule')).toBe(
      true,
    );
  });

  it('premiumGate: mold_l3_zero_slots é error (readiness FAIL)', () => {
    const errs = premiumGateErrors(gravidezPayload as Parameters<typeof premiumGateErrors>[0]);
    expect(errs.some((e) => e.code === 'mold_l3_zero_slots')).toBe(true);
  });
});
