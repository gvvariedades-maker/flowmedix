import { canonicalJson } from '@/lib/neurocanvas/canonicalJson';
import {
  buildNeuroVisualPlanV0,
  NEUROVISUAL_PLAN_SCHEMA_VERSION,
  PRESENTATION_PARITY_FIELDS,
} from '@/lib/neurocanvas/neuroVisualPlanV0';
import { compareSlideVisualParity } from '@/lib/neurocanvas/neuroVisualPlanParity';
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

  it('presentation do plano equivale a resolveSlidePresentation direto', () => {
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

    for (const field of PRESENTATION_PARITY_FIELDS) {
      expect(canonicalJson(plan.presentation[field])).toBe(canonicalJson(direct[field]));
    }
  });

  it('theme do plano equivale a getThemeForSlide direto', () => {
    const slide = goldenRuleSlide();
    const directTheme = getThemeForSlide(slide, SLUG, 2);
    const plan = buildNeuroVisualPlanV0({
      slide,
      questionHash: SLUG,
      slideIndex: 2,
    });
    expect(canonicalJson(plan.theme)).toBe(canonicalJson(directTheme));
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
