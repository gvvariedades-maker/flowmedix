import fs from 'node:fs';
import path from 'node:path';

import {
  auditPremiumQuestao,
  isPremiumSubtopico,
  premiumGateErrors,
} from '@/lib/catalogMigration/premiumGate';

const viasGolden = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'examples', 'questao-premium-cpcon-vias-im-vf.json'),
    'utf8',
  ),
);

function viasBase() {
  return {
    meta: { topico: 'Enfermagem', subtopico: 'Vias de Administração' },
    reverse_study_slides: [
      { type: 'concept_map', items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] },
      {
        type: 'golden_rule',
        rows: [{ label: 'I', value: 'FALSA' }],
      },
      { type: 'logic_flow', reveal_mode: 'tap', steps: ['1', '2', '3'] },
      {
        type: 'danger_zone',
        content: 'x',
        items: [{ label: 'Letra A', detail: 'y', correct: 'z' }],
      },
    ],
  };
}

describe('isPremiumSubtopico', () => {
  it('reconhece subtópico com molde bespoke', () => {
    expect(isPremiumSubtopico('Vias de Administração')).toBe(true);
    expect(isPremiumSubtopico('Curativos e Manejo de Feridas')).toBe(true);
    expect(isPremiumSubtopico('Enfermagem do Trabalho')).toBe(true);
  });

  it('subtópico genérico não dispara contrato premium', () => {
    expect(isPremiumSubtopico('Fundamentos de Enfermagem')).toBe(false);
    expect(isPremiumSubtopico(undefined)).toBe(false);
  });
});

describe('auditPremiumQuestao — conteúdo genérico/stub', () => {
  it('bloqueia marcadores stub em qualquer subtópico', () => {
    const errs = premiumGateErrors({
      meta: { subtopico: 'Vias de Administração' },
      reverse_study_slides: [
        { type: 'golden_rule', rows: [{ label: '[IA] Dispositivo', value: 'Preencher artigo/lei' }] },
      ],
    });
    expect(errs.some((e) => e.code === 'stub_markers')).toBe(true);
  });

  it('slides vazios contam como stub', () => {
    const errs = premiumGateErrors({
      meta: { subtopico: 'Vias de Administração' },
      reverse_study_slides: [],
    });
    expect(errs.some((e) => e.code === 'stub_markers')).toBe(true);
  });
});

describe('auditPremiumQuestao — contrato de molde bespoke (Vias)', () => {
  it('golden_rule sem rows é bloqueado', () => {
    const q = viasBase();
    q.reverse_study_slides[1] = { type: 'golden_rule', content: 'só título' } as never;
    const errs = premiumGateErrors(q);
    expect(errs.some((e) => e.code === 'molde_golden_rule_sem_rows')).toBe(true);
  });

  it('danger_zone sem correct é bloqueado', () => {
    const q = viasBase();
    q.reverse_study_slides[3] = {
      type: 'danger_zone',
      content: 'x',
      items: [{ label: 'A', detail: 'y' }],
    } as never;
    const errs = premiumGateErrors(q);
    expect(errs.some((e) => e.code === 'molde_danger_zone_sem_correct')).toBe(true);
  });

  it('concept_map com <3 items é bloqueado', () => {
    const q = viasBase();
    q.reverse_study_slides[0] = {
      type: 'concept_map',
      items: [{ label: 'A' }],
    } as never;
    const errs = premiumGateErrors(q);
    expect(errs.some((e) => e.code === 'molde_concept_map_sem_items')).toBe(true);
  });

  it('logic_flow sem reveal tap gera warn (não bloqueia)', () => {
    const q = viasBase();
    q.reverse_study_slides[2] = { type: 'logic_flow', steps: ['1', '2', '3'] } as never;
    const all = auditPremiumQuestao(q);
    const errs = premiumGateErrors(q);
    expect(all.some((e) => e.code === 'molde_logic_flow_sem_tap' && e.severity === 'warn')).toBe(true);
    expect(errs.some((e) => e.code.startsWith('molde_logic_flow'))).toBe(false);
  });

  it('questão completa válida não gera erro', () => {
    expect(premiumGateErrors(viasBase())).toHaveLength(0);
  });
});

describe('auditPremiumQuestao — gate semântico (warn)', () => {
  it('slide_topic_drift gera warn em Punção', () => {
    const q = {
      meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
      question_data: {
        instruction: 'Sobre punção venosa periférica, assinale a alternativa correta.',
        options: [{ id: 'A', is_correct: true }],
      },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] },
        {
          type: 'golden_rule',
          rows: [{ label: 'Bundle', value: 'IPCS no CVC com barreira estéril máxima' }],
        },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['1', '2', '3'] },
        {
          type: 'danger_zone',
          content: 'x',
          items: [{ label: 'Letra A', detail: 'y', correct: 'Gabarito letra A — ok' }],
        },
      ],
    };
    const all = auditPremiumQuestao(q);
    expect(all.some((e) => e.code === 'slide_topic_drift' && e.severity === 'warn')).toBe(true);
    expect(premiumGateErrors(q).some((e) => e.code === 'slide_topic_drift')).toBe(false);
  });

  it('danger_gabarito_letter_mismatch gera warn', () => {
    const q = {
      meta: { subtopico: 'Punção Venosa e Cuidados com Cateteres' },
      question_data: {
        instruction: 'Questão de acesso venoso.',
        options: [{ id: 'D', is_correct: true }],
      },
      reverse_study_slides: [
        { type: 'concept_map', items: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] },
        { type: 'golden_rule', rows: [{ label: 'A', value: 'B' }] },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['1', '2', '3'] },
        {
          type: 'danger_zone',
          content: 'x',
          items: [{ label: 'Letra A', detail: 'y', correct: 'Gabarito letra B — errado' }],
        },
      ],
    };
    const all = auditPremiumQuestao(q);
    expect(
      all.some((e) => e.code === 'danger_gabarito_letter_mismatch' && e.severity === 'warn'),
    ).toBe(true);
  });
});

describe('auditPremiumQuestao — golden de referência', () => {
  it('golden Vias passa no gate sem erros', () => {
    expect(premiumGateErrors(viasGolden)).toHaveLength(0);
  });
});

describe('auditPremiumQuestao — gate L3 write blockers', () => {
  const farmacoSubtopico = 'Farmacodinâmica e Farmacocinética';

  function omeprazolGolden(withBranch: boolean) {
    const instruction =
      'Em um paciente hospitalizado por úlcera péptica grave, que recebe Omeprazol na forma endovenosa, avalie as condutas e marque a opção adequada.';
    return {
      meta: {
        topico: 'Enfermagem',
        subtopico: farmacoSubtopico,
        content_standard: 'golden-v1',
        family: 'protocolo',
        ...(withBranch ? { pedagogical_branch: 'farmaco_clinico_protocolo' } : {}),
      },
      question_data: {
        instruction,
        options: [
          { id: 'A', text: 'Suspender IBP', is_correct: false },
          { id: 'B', text: 'Titular infusão com monitorização de pH', is_correct: true },
        ],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          meta: { subtopico: farmacoSubtopico },
          items: [
            { label: 'Cenário', detail: 'Úlcera grave — IBP EV', icon: 'Hospital' },
            { label: 'Farmacodinâmica', detail: 'Inibe bomba de prótons', icon: 'Zap' },
            { label: 'Monitorização', detail: 'pH gástrico guia infusão', icon: 'Activity' },
          ],
        },
        {
          type: 'golden_rule',
          meta: { subtopico: farmacoSubtopico },
          rows: [{ label: 'Conduta', value: 'Titular infusão com pH' }],
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: { subtopico: farmacoSubtopico },
          steps: ['Cenário clínico', 'IBP EV', 'Letra B'],
        },
        {
          type: 'danger_zone',
          meta: { subtopico: farmacoSubtopico },
          content: 'Pegadinhas',
          items: [{ label: 'Letra A', detail: 'Suspender', correct: 'Manter titulação' }],
        },
      ],
    };
  }

  it('golden omeprazol com pedagogical_branch correto → 0 errors L3', () => {
    const errs = premiumGateErrors(omeprazolGolden(true));
    expect(errs.filter((e) => e.code.startsWith('mold_l3_'))).toHaveLength(0);
  });

  it('golden-v1 farmaco VF com slides clínicos sem branch → mold_l3_unresolved_bespoke', () => {
    const q = omeprazolGolden(false);
    q.meta.family = 'vf';
    q.question_data.instruction =
      'I - Farmacocinética é ADME. II - Farmacodinâmica é efeito no organismo. III - Meia-vida elimina 100%. Assinale a correta.';
    const errs = premiumGateErrors(q);
    expect(errs.some((e) => e.code === 'mold_l3_unresolved_bespoke')).toBe(true);
  });

  it('adolescente puberdade com branch etica_sigilo declarado erroneamente → declared_branch_conflict', () => {
    const instruction =
      'Julgue o item. A adolescência é marcada por metamorfose física. Atraso na puberdade: mamas 12-13 anos.';
    const q = {
      meta: {
        banca: 'IGEDUC',
        topico: 'Enfermagem',
        subtopico: 'Saúde do Adolescente',
        content_standard: 'golden-v1',
        family: 'certo_errado',
        pedagogical_branch: 'adolescente_etica_sigilo',
      },
      question_data: {
        instruction,
        options: [{ id: 'C', text: 'Certo', is_correct: true }],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          meta: { subtopico: 'Saúde do Adolescente' },
          items: [
            { label: 'Puberdade', detail: 'Marcos 12–13 anos', icon: 'User' },
            { label: 'Meninos', detail: 'Testículos 13–14', icon: 'User' },
            { label: 'Atraso', detail: 'Ausência de sinais', icon: 'AlertTriangle' },
          ],
        },
        {
          type: 'golden_rule',
          meta: { subtopico: 'Saúde do Adolescente' },
          rows: [{ label: 'Marco', value: '12–13 anos' }],
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: { subtopico: 'Saúde do Adolescente' },
          steps: ['Puberdade', 'Certo'],
        },
        {
          type: 'danger_zone',
          meta: { subtopico: 'Saúde do Adolescente' },
          content: 'x',
          items: [{ label: 'A', detail: 'y', correct: 'z' }],
        },
      ],
    };
    const errs = premiumGateErrors(q);
    expect(
      errs.some(
        (e) =>
          e.code === 'mold_l3_declared_branch_conflict' ||
          e.code === 'mold_l3_unresolved_bespoke',
      ),
    ).toBe(true);
  });
});
