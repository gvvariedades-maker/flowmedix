/**
 * Normaliza slides de estudo reverso para o formato semântico plano esperado pelo player e pelo Zod (`ReverseStudySlideSchema`).
 * Alguns importadores aninham dados em `concept_map`, `golden_rule`, `logic_flow`, `danger_zone`.
 */

const WRAPPER_KEYS = ['concept_map', 'golden_rule', 'logic_flow', 'danger_zone'] as const;

function stripWrapperObjects(slide: Record<string, unknown>): void {
  for (const k of WRAPPER_KEYS) {
    delete slide[k];
  }
}

/**
 * Achata um slide único e remove objetos-wrapper redundantes (após copiar para o topo).
 */
export function normalizeReverseStudySlide(slide: unknown): unknown {
  if (!slide || typeof slide !== 'object' || Array.isArray(slide)) return slide;
  const raw = slide as Record<string, unknown>;
  if (!raw.type || typeof raw.type !== 'string') return slide;

  const out: Record<string, unknown> = { ...raw };
  const t = raw.type;

  if (t === 'concept_map' && raw.concept_map && typeof raw.concept_map === 'object' && !Array.isArray(raw.concept_map)) {
    const inner = raw.concept_map as Record<string, unknown>;
    const topLen = Array.isArray(out.items) ? out.items.length : 0;
    if (Array.isArray(inner.items) && inner.items.length > 0 && topLen === 0) {
      out.items = inner.items;
    }
  }

  if (t === 'golden_rule' && raw.golden_rule && typeof raw.golden_rule === 'object' && !Array.isArray(raw.golden_rule)) {
    const inner = raw.golden_rule as Record<string, unknown>;
    const topEmpty = out.content == null || String(out.content).trim() === '';
    if (inner.content != null && topEmpty) {
      out.content = inner.content;
    }
    if (inner.footer_rule && !out.footer_rule) {
      out.footer_rule = inner.footer_rule;
    }
  }

  if (t === 'logic_flow' && raw.logic_flow && typeof raw.logic_flow === 'object' && !Array.isArray(raw.logic_flow)) {
    const inner = raw.logic_flow as Record<string, unknown>;
    const topSteps = Array.isArray(out.steps) ? out.steps.length : 0;
    if (Array.isArray(inner.steps) && inner.steps.length > 0 && topSteps === 0) {
      out.steps = inner.steps;
    }
  }

  if (t === 'danger_zone' && raw.danger_zone && typeof raw.danger_zone === 'object' && !Array.isArray(raw.danger_zone)) {
    const inner = raw.danger_zone as Record<string, unknown>;
    const topEmptyContent = out.content == null || String(out.content).trim() === '';
    if (inner.content != null && topEmptyContent) {
      out.content = inner.content;
    }
    if (inner.footer_rule && !out.footer_rule) {
      out.footer_rule = inner.footer_rule;
    }
    const innerItems = inner.items;
    if (Array.isArray(innerItems) && innerItems.length > 0 && typeof innerItems[0] === 'string') {
      out.items = innerItems.map((text: string, i: number) => ({
        id: String(i + 1),
        label: `Ponto ${i + 1}`,
        detail: text,
      }));
    }
  }

  stripWrapperObjects(out);
  return out;
}

/**
 * Clona superficialmente o payload da questão e normaliza `reverse_study_slides` e `study_slides`.
 */
export function normalizeQuestaoSlideArrays(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  const o = { ...(payload as Record<string, unknown>) };

  if (Array.isArray(o.reverse_study_slides)) {
    o.reverse_study_slides = o.reverse_study_slides.map(normalizeReverseStudySlide);
  }
  if (Array.isArray(o.study_slides)) {
    o.study_slides = o.study_slides.map(normalizeReverseStudySlide);
  }

  return o;
}
