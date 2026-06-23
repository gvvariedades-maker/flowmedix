/**
 * Extrai array de slides do JSON retornado pelo Gemini.
 * Aceita { reverse_study_slides: [...] } ou array direto.
 */
export function extractSlidesFromModelJson(json: unknown): unknown[] | null {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return null;
  const slides =
    (json as { reverse_study_slides?: unknown }).reverse_study_slides ??
    (json as { slides?: unknown }).slides;
  return Array.isArray(slides) ? slides : null;
}
