import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildNeuroVisualPlanV0,
  NEUROVISUAL_PLAN_SCHEMA_VERSION,
} from '@/lib/neurocanvas/neuroVisualPlanV0';
import {
  compareSlideVisualParity,
  diffPresentationParity,
} from '@/lib/neurocanvas/neuroVisualPlanParity';
import {
  enrichPresentationContext,
  resolveSlidePresentation,
} from '@/components/slides/core/slidePresentation';
import { getThemeForSlide } from '@/components/slides/core/themeGenerator';

const SLUG = 'fixture-neurovisual-plan-v0';

function conceptMapSlide(subtopico = 'Imunização') {
  return {
    type: 'concept_map' as const,
    meta: { subtopico },
    items: [{ label: 'Vacina', detail: 'PNI', icon: 'Syringe' }],
  };
}

function logicFlowSlide() {
  return {
    type: 'logic_flow' as const,
    reveal_mode: 'tap' as const,
    steps: ['Eliminar A', 'Eliminar B', 'Gabarito C'],
  };
}

function goldenRuleSlide() {
  return {
    type: 'golden_rule' as const,
    content: 'Intervalo mínimo',
    rows: [{ label: 'BCG', value: '30 dias' }],
  };
}

function dangerZoneSlide() {
  return {
    type: 'danger_zone' as const,
    content: 'Pegadinhas',
    items: [{ label: 'Erro', detail: 'Detalhe', correct: 'Conduta certa' }],
  };
}

describe('neuroVisualPlanV0 (hermético)', () => {
  it('produz plano com schema_version neurovisual-plan-v0', () => {
    const plan = buildNeuroVisualPlanV0({
      slide: conceptMapSlide(),
      questionHash: SLUG,
      slideIndex: 0,
      familyId: 'certo_errado',
    });
    expect(plan.schema_version).toBe(NEUROVISUAL_PLAN_SCHEMA_VERSION);
    expect(plan.slide_type).toBe('concept_map');
    expect(plan.presentation.layoutVariant).toBeTruthy();
    expect(plan.theme).toBeDefined();
  });

  it('cobre os quatro tipos de NeuroSlide', () => {
    const slides = [conceptMapSlide(), logicFlowSlide(), goldenRuleSlide(), dangerZoneSlide()];
    slides.forEach((slide, slideIndex) => {
      const plan = buildNeuroVisualPlanV0({
        slide,
        questionHash: SLUG,
        slideIndex,
        familyId: 'protocolo',
      });
      expect(plan.slide_type).toBe(slide.type);
      expect(plan.presentation).toBeDefined();
    });
  });

  it('slide_type legado sem type retorna unknown', () => {
    const plan = buildNeuroVisualPlanV0({
      slide: { steps: ['A'] },
      questionHash: SLUG,
    });
    expect(plan.slide_type).toBe('unknown');
  });

  it('slide_type aceita string legada arbitrária do resolver', () => {
    const plan = buildNeuroVisualPlanV0({
      slide: { type: 'versus_arena' },
      questionHash: SLUG,
    });
    expect(plan.slide_type).toBe('versus_arena');
  });

  it('mesma entrada produz plano idêntico (determinismo)', () => {
    const input = {
      slide: logicFlowSlide(),
      questionHash: 'determinism-slug',
      slideIndex: 2,
      familyId: 'protocolo' as const,
      questionInstruction: 'Enunciado fixture.',
    };
    const a = buildNeuroVisualPlanV0(input);
    const b = buildNeuroVisualPlanV0(input);
    expect(canonicalJson(a)).toBe(canonicalJson(b));
  });

  it('plano é serializável via JSON', () => {
    const plan = buildNeuroVisualPlanV0({
      slide: goldenRuleSlide(),
      questionHash: SLUG,
      slideIndex: 2,
    });
    const roundTrip = JSON.parse(JSON.stringify(plan)) as typeof plan;
    expect(roundTrip.schema_version).toBe(NEUROVISUAL_PLAN_SCHEMA_VERSION);
    expect(roundTrip.presentation.rows).toEqual(plan.presentation.rows);
  });

  it('includeTheme: true resolve e inclui tema', () => {
    const slide = goldenRuleSlide();
    const directTheme = getThemeForSlide(slide, SLUG, 2);
    const plan = buildNeuroVisualPlanV0({
      slide,
      questionHash: SLUG,
      slideIndex: 2,
      includeTheme: true,
    });
    expect(plan.theme).toBeDefined();
    expect(canonicalJson(plan.theme)).toBe(canonicalJson(directTheme));
  });

  it('includeTheme: false omite tema de forma determinística', () => {
    const plan = buildNeuroVisualPlanV0({
      slide: goldenRuleSlide(),
      questionHash: SLUG,
      slideIndex: 2,
      includeTheme: false,
    });
    expect(plan.theme).toBeUndefined();
    expect('theme' in plan).toBe(false);
  });

  it('caminho direto e encapsulado são profundamente equivalentes', () => {
    const slide = dangerZoneSlide();
    const mismatch = compareSlideVisualParity({
      slide,
      slug: SLUG,
      slideIndex: 3,
      familyId: 'text_fragment',
      instruction: 'Assinale a alternativa incorreta.',
      allSlides: [conceptMapSlide(), logicFlowSlide(), goldenRuleSlide(), slide],
      questionMeta: { subtopico: 'Imunização' },
    });
    expect(mismatch).toBeNull();
  });

  it('F1: dangerItemPolarities fica fora de presentation (divergência intencional do chrome)', () => {
    const slide = {
      type: 'danger_zone' as const,
      content: 'Pegadinhas EXCETO',
      items: [
        {
          label: 'Letra A — sítio clássico',
          detail: 'Parece óbvio.',
          correct: 'Afirmativa correta: artéria braquial no membro superior.',
        },
        {
          label: 'Letra B — insuflar até 300 mmHg',
          detail: 'Parece garantir a leitura.',
          correct: 'Incorreta: 20–30 mmHg acima do desaparecimento do pulso.',
        },
      ],
    };
    const options = [
      { id: 'A', text: 'Braquial', is_correct: false },
      { id: 'B', text: '300 mmHg', is_correct: true },
    ];
    const plan = buildNeuroVisualPlanV0({
      slide,
      questionHash: SLUG,
      slideIndex: 3,
      questionInstruction: 'Assinale a alternativa INCORRETA.',
      questionOptions: options,
      includeTheme: false,
    });
    expect(plan.dangerItemPolarities).toEqual(['valid_conduct', 'trap']);
    expect(
      Object.prototype.hasOwnProperty.call(plan.presentation, 'dangerItemPolarities'),
    ).toBe(false);

    const mismatch = compareSlideVisualParity({
      slide,
      slug: SLUG,
      slideIndex: 3,
      instruction: 'Assinale a alternativa INCORRETA.',
      options,
      allSlides: [slide],
    });
    expect(mismatch).toBeNull();
  });

  it('presentation do plano equivale a resolveSlidePresentation direto (objeto integral)', () => {
    const slide = conceptMapSlide('Vias de Administração');
    const ctx = enrichPresentationContext(
      { questionSlug: SLUG, slideIndex: 0, familyId: 'vf' },
      slide.meta,
      'Enunciado VF.',
      [slide],
      { subtopico: 'Vias de Administração' },
    );
    const direct = resolveSlidePresentation(slide, ctx);
    const plan = buildNeuroVisualPlanV0({
      slide,
      questionHash: SLUG,
      slideIndex: 0,
      familyId: 'vf',
      questionInstruction: 'Enunciado VF.',
      questionSlides: [slide],
      questionMeta: { subtopico: 'Vias de Administração' },
    });

    expect(canonicalJson(plan.presentation)).toBe(canonicalJson(direct));
    expect(diffPresentationParity(direct, plan.presentation)).toEqual([]);
  });

  it('campo adicional em um dos lados produz divergência na paridade', () => {
    const slide = logicFlowSlide();
    const ctx = enrichPresentationContext({ questionSlug: SLUG, slideIndex: 1 }, undefined, undefined, [
      slide,
    ]);
    const direct = resolveSlidePresentation(slide, ctx);
    const planPresentation = Object.assign({}, direct, {
      __future_visual_field__: 'drift-simulado',
    });

    expect(canonicalJson(direct)).not.toBe(canonicalJson(planPresentation));
    const mismatches = diffPresentationParity(direct, planPresentation);
    expect(mismatches.length).toBeGreaterThan(0);
    expect(mismatches.some((m) => m.field === '__future_visual_field__')).toBe(true);
  });

  it('caminho bespoke (subtópico com molde) permanece equivalente', () => {
    const slide = {
      type: 'concept_map' as const,
      meta: { subtopico: 'Imunização' },
      items: [
        { label: 'Calendário', detail: 'PNI', icon: 'Calendar' },
        { label: 'Cadeia fria', detail: '2–8 °C', icon: 'Thermometer' },
        { label: 'Intervalo', detail: 'Mínimo', icon: 'Clock' },
      ],
    };
    const mismatch = compareSlideVisualParity({
      slide,
      slug: 'imunizacao-bespoke-fixture',
      slideIndex: 0,
      familyId: 'vf',
      instruction: 'Julgue os itens.',
      allSlides: [slide, logicFlowSlide(), goldenRuleSlide(), dangerZoneSlide()],
      questionMeta: { subtopico: 'Imunização', pedagogical_branch: 'imun_pni_calendario' },
    });
    expect(mismatch).toBeNull();
  });

  it('caminho family rotation permanece equivalente', () => {
    const slide = logicFlowSlide();
    const mismatch = compareSlideVisualParity({
      slide,
      slug: 'family-rotation-fixture',
      slideIndex: 1,
      familyId: 'protocolo',
      allSlides: [conceptMapSlide(), slide, goldenRuleSlide(), dangerZoneSlide()],
    });
    expect(mismatch).toBeNull();
  });

  it('caminho genérico (sem subtopico) permanece equivalente', () => {
    const slide = { type: 'logic_flow' as const, steps: ['A', 'B'] };
    const mismatch = compareSlideVisualParity({
      slide,
      slug: 'generic-fixture',
      slideIndex: 0,
      allSlides: [slide],
    });
    expect(mismatch).toBeNull();
  });
});
