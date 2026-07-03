/**
 * Remove spoiler de gabarito do golden_rule (e item Gabarito do concept_map) — pedagogy v2.
 * @see docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md §2.1
 */

const GABARITO_LABEL_RE = /gabarito|combina[çc]/i;

type SlideLike = Record<string, unknown> & { type?: string };

function slidesOf(payload: { reverse_study_slides?: unknown[]; study_slides?: unknown[] }): SlideLike[] {
  const raw = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(raw) ? (raw as SlideLike[]) : [];
}

export type GoldenV2SpoilerRepairResult = {
  changed: boolean;
  removed_golden_rows: number;
  removed_concept_items: number;
};

export function repairGoldenV2SpoilerInPayload(
  payload: { reverse_study_slides?: unknown[]; study_slides?: unknown[] },
): GoldenV2SpoilerRepairResult {
  const slides = slidesOf(payload);
  let removedGoldenRows = 0;
  let removedConceptItems = 0;

  for (const slide of slides) {
    if (slide.type === 'golden_rule' && Array.isArray(slide.rows)) {
      const rows = slide.rows as Record<string, unknown>[];
      const before = rows.length;
      slide.rows = rows.filter((row) => !GABARITO_LABEL_RE.test(String(row.label ?? '')));
      removedGoldenRows += before - (slide.rows as unknown[]).length;
    }

    if (slide.type === 'concept_map' && Array.isArray(slide.items)) {
      const items = slide.items as Record<string, unknown>[];
      const before = items.length;
      slide.items = items.filter((item) => !GABARITO_LABEL_RE.test(String(item.label ?? '')));
      removedConceptItems += before - (slide.items as unknown[]).length;
    }
  }

  return {
    changed: removedGoldenRows > 0 || removedConceptItems > 0,
    removed_golden_rows: removedGoldenRows,
    removed_concept_items: removedConceptItems,
  };
}
