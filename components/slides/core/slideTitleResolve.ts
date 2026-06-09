const SLIDE_TITLE_PREFIX: Record<string, string> = {
  concept_map: 'Mapa',
  golden_rule: 'Referência',
  logic_flow: 'Estratégia',
  danger_zone: 'Pegadinhas',
};

/**
 * Título de capa: `slide_title` no JSON ou derivado de `meta.subtopico` + tipo.
 */
export function resolveSlideTitle(slide: {
  slide_title?: string;
  type?: string;
  meta?: { subtopico?: string; topico?: string };
}): string | undefined {
  const explicit = slide.slide_title?.trim();
  if (explicit) return explicit;

  const subtopico = slide.meta?.subtopico?.trim() || slide.meta?.topico?.trim();
  if (!subtopico) return undefined;

  const prefix = slide.type ? SLIDE_TITLE_PREFIX[slide.type] : undefined;
  return prefix ? `${prefix} — ${subtopico}` : subtopico;
}
