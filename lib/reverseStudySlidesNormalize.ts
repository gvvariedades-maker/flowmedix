/**
 * Normaliza slides de estudo reverso para o formato semântico plano esperado pelo player e pelo Zod (`ReverseStudySlideSchema`).
 * Alguns importadores aninham dados em `concept_map`, `golden_rule`, `logic_flow`, `danger_zone`.
 */

const WRAPPER_KEYS = ['concept_map', 'golden_rule', 'logic_flow', 'danger_zone'] as const;

export type VersusArenaSideNormalized = {
  title: string;
  points: string[];
  icon?: string;
};

/** Converte passo legado (string ou objeto) em texto exibível. */
export function normalizeLogicFlowStep(step: unknown): string | null {
  if (typeof step === 'string') {
    const trimmed = step.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (step && typeof step === 'object' && !Array.isArray(step)) {
    const record = step as Record<string, unknown>;
    const candidate = record.text ?? record.step ?? record.label ?? record.content;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}

/** Filtra passos inválidos e normaliza objetos legados. */
export function normalizeLogicFlowSteps(steps: unknown): string[] {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((step) => normalizeLogicFlowStep(step))
    .filter((step): step is string => step != null);
}

function normalizeVersusArenaSide(
  value: unknown,
  fallbackTitle: string,
): VersusArenaSideNormalized | null {
  if (typeof value === 'string') {
    const title = value.trim();
    return title.length > 0 ? { title, points: [] } : null;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const titleRaw = record.title;
    const title =
      typeof titleRaw === 'string' && titleRaw.trim().length > 0
        ? titleRaw.trim()
        : fallbackTitle;
    const points = Array.isArray(record.points)
      ? record.points
          .map((point) => (typeof point === 'string' ? point.trim() : ''))
          .filter((point) => point.length > 0)
      : [];
    const icon = typeof record.icon === 'string' ? record.icon : undefined;
    return { title, points, icon };
  }
  return null;
}

export function isVersusArenaSideReady(
  side: unknown,
): side is VersusArenaSideNormalized {
  if (
    !side ||
    typeof side !== 'object' ||
    Array.isArray(side)
  ) {
    return false;
  }
  const normalized = side as VersusArenaSideNormalized;
  return (
    typeof normalized.title === 'string' &&
    normalized.title.trim().length > 0 &&
    Array.isArray(normalized.points) &&
    normalized.points.length > 0
  );
}

function mergeShellFieldsFromInner(
  out: Record<string, unknown>,
  inner: Record<string, unknown>
): void {
  if (inner.chip_label != null && out.chip_label == null) {
    out.chip_label = inner.chip_label;
  }
  if (inner.slide_title != null && out.slide_title == null) {
    out.slide_title = inner.slide_title;
  }
}

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
    mergeShellFieldsFromInner(out, inner);
    const topLen = Array.isArray(out.items) ? out.items.length : 0;
    if (Array.isArray(inner.items) && inner.items.length > 0 && topLen === 0) {
      out.items = inner.items;
    }
  }

  if (t === 'golden_rule' && raw.golden_rule && typeof raw.golden_rule === 'object' && !Array.isArray(raw.golden_rule)) {
    const inner = raw.golden_rule as Record<string, unknown>;
    mergeShellFieldsFromInner(out, inner);
    const topEmpty = out.content == null || String(out.content).trim() === '';
    if (inner.content != null && topEmpty) {
      out.content = inner.content;
    }
    if (inner.footer_rule && !out.footer_rule) {
      out.footer_rule = inner.footer_rule;
    }
    const topRowsLen = Array.isArray(out.rows) ? out.rows.length : 0;
    if (Array.isArray(inner.rows) && inner.rows.length > 0 && topRowsLen === 0) {
      out.rows = inner.rows;
    }
  }

  if (t === 'logic_flow' && raw.logic_flow && typeof raw.logic_flow === 'object' && !Array.isArray(raw.logic_flow)) {
    const inner = raw.logic_flow as Record<string, unknown>;
    mergeShellFieldsFromInner(out, inner);
    const topSteps = Array.isArray(out.steps) ? out.steps.length : 0;
    if (Array.isArray(inner.steps) && inner.steps.length > 0 && topSteps === 0) {
      out.steps = inner.steps;
    }
    if (inner.reveal_mode != null && out.reveal_mode == null) {
      out.reveal_mode = inner.reveal_mode;
    }
  }

  if (t === 'danger_zone' && raw.danger_zone && typeof raw.danger_zone === 'object' && !Array.isArray(raw.danger_zone)) {
    const inner = raw.danger_zone as Record<string, unknown>;
    mergeShellFieldsFromInner(out, inner);
    const topEmptyContent = out.content == null || String(out.content).trim() === '';
    if (inner.content != null && topEmptyContent) {
      out.content = inner.content;
    }
    if (inner.footer_rule && !out.footer_rule) {
      out.footer_rule = inner.footer_rule;
    }
    if (inner.bullet_style != null && out.bullet_style == null) {
      out.bullet_style = inner.bullet_style;
    }
    const topItemsLen = Array.isArray(out.items) ? out.items.length : 0;
    const innerItems = inner.items;
    if (Array.isArray(innerItems) && innerItems.length > 0 && topItemsLen === 0) {
      if (typeof innerItems[0] === 'string') {
        out.items = innerItems.map((text: string, i: number) => ({
          id: String(i + 1),
          label: `Ponto ${i + 1}`,
          detail: text,
        }));
      } else {
        out.items = innerItems;
      }
    }
  }

  if (t === 'logic_flow') {
    out.steps = normalizeLogicFlowSteps(out.steps);
  }

  if (t === 'versus_arena') {
    const conceptA = normalizeVersusArenaSide(out.concept_a, 'Conceito A');
    const conceptB = normalizeVersusArenaSide(out.concept_b, 'Conceito B');
    if (conceptA) out.concept_a = conceptA;
    if (conceptB) out.concept_b = conceptB;
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
