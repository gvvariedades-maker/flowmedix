/**
 * Remove `layout_variant` dos slides — visual fica a cargo do player
 * (subtópico + família + rotação por slug). Mantém campos semânticos (rows, correct, tap…).
 */

export type StripLayoutVariantStats = {
  filesTouched: number;
  slidesStripped: number;
  filesSkipped: number;
};

type SlideLike = Record<string, unknown>;

function stripSlidesArray(slides: unknown): { slides: unknown; count: number } {
  if (!Array.isArray(slides)) return { slides, count: 0 };
  let count = 0;
  const next = slides.map((raw) => {
    if (!raw || typeof raw !== 'object') return raw;
    const slide = raw as SlideLike;
    if (!('layout_variant' in slide)) return slide;
    count += 1;
    const { layout_variant: _removed, ...rest } = slide;
    return rest;
  });
  return { slides: next, count };
}

/** Remove `layout_variant` de `reverse_study_slides` / `study_slides` no payload da questão. */
export function stripLayoutVariantFromQuestaoPayload(
  payload: Record<string, unknown>,
): { payload: Record<string, unknown>; stripped: number } {
  let stripped = 0;
  const out = { ...payload };

  for (const key of ['reverse_study_slides', 'study_slides'] as const) {
    if (!(key in out)) continue;
    const { slides, count } = stripSlidesArray(out[key]);
    stripped += count;
    out[key] = slides;
  }

  return { payload: out, stripped };
}
