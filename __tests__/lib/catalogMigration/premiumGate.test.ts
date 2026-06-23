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
