import type { ResolverDecisionKind } from '@/lib/neurocanvas/resolverAudit';

export type ReadinessGrade = 'A' | 'B' | 'C';

export function slideShapeKey(slide: Record<string, unknown>): string {
  const hasItems = Array.isArray(slide.items) && slide.items.length > 0;
  const hasSteps = Array.isArray(slide.steps) && slide.steps.length > 0;
  const hasRows = Array.isArray(slide.rows) && slide.rows.length > 0;
  const hasContent = typeof slide.content === 'string' && slide.content.trim().length > 0;
  const parts = [
    hasItems ? 'items' : null,
    hasSteps ? 'steps' : null,
    hasRows ? 'rows' : null,
    hasContent ? 'content' : null,
  ].filter(Boolean);
  return parts.length ? parts.join('+') : 'empty';
}

export function textDensity(slide: Record<string, unknown>): number {
  let total = 0;
  if (typeof slide.content === 'string') total += slide.content.length;
  if (Array.isArray(slide.items)) {
    for (const it of slide.items) {
      if (it && typeof it === 'object') {
        const row = it as { label?: string; detail?: string; correct?: string };
        total += String(row.label ?? '').length + String(row.detail ?? '').length;
      }
    }
  }
  if (Array.isArray(slide.steps)) {
    for (const step of slide.steps) total += String(step).length;
  }
  if (Array.isArray(slide.rows)) {
    for (const row of slide.rows) {
      if (row && typeof row === 'object') {
        const r = row as { label?: string; value?: string };
        total += String(r.label ?? '').length + String(r.value ?? '').length;
      }
    }
  }
  return total;
}

export function gradeSlideReadiness(slide: Record<string, unknown>): ReadinessGrade {
  const t = String(slide.type ?? 'unknown');

  if (t === 'concept_map' && Array.isArray(slide.items) && slide.items.length >= 2) {
    return slide.items.length >= 3 ? 'A' : 'B';
  }
  if (t === 'logic_flow' && Array.isArray(slide.steps) && slide.steps.length >= 4) {
    return slide.reveal_mode === 'tap' ? 'A' : 'B';
  }
  if (t === 'golden_rule') {
    if (Array.isArray(slide.rows) && slide.rows.length >= 2) return 'A';
    if (typeof slide.content === 'string' && slide.content.trim().length > 0) return 'C';
    return 'B';
  }
  if (t === 'danger_zone') {
    const items = Array.isArray(slide.items) ? slide.items : [];
    const withCorrect = items.filter(
      (it) =>
        it &&
        typeof it === 'object' &&
        typeof (it as { correct?: unknown }).correct === 'string' &&
        String((it as { correct: string }).correct).trim().length > 0,
    ).length;
    if (withCorrect >= 2) return 'A';
    if (items.length > 0) return 'B';
    return 'C';
  }

  return 'C';
}

export function isContentOnlyAmbiguous(slide: Record<string, unknown>): boolean {
  const shape = slideShapeKey(slide);
  if (shape !== 'content' && shape !== 'empty') return false;
  const t = String(slide.type ?? '');
  if (t === 'golden_rule' && shape === 'content') {
    const len = typeof slide.content === 'string' ? slide.content.trim().length : 0;
    return len > 0 && len < 40;
  }
  return shape === 'empty';
}

export function isLegacyExceptionSlide(slide: Record<string, unknown>): boolean {
  const t = String(slide.type ?? '');
  if (t === 'danger_zone' && Array.isArray(slide.items) && slide.items.length > 0) {
    const withCorrect = slide.items.filter(
      (it) =>
        it &&
        typeof it === 'object' &&
        typeof (it as { correct?: unknown }).correct === 'string' &&
        String((it as { correct: string }).correct).trim().length > 0,
    ).length;
    if (withCorrect === 0) return true;
  }
  if (t === 'logic_flow' && slide.reveal_mode !== 'tap') return true;
  return false;
}

export type GenericReadinessRow = {
  slug: string;
  slide_index: number;
  slide_type: string;
  subtopico?: string;
  shape: string;
  layout_variant: string;
  decision: ResolverDecisionKind;
  readiness: ReadinessGrade;
  text_density: number;
  has_correct_pairs: boolean;
  reveal_mode_tap: boolean;
};
