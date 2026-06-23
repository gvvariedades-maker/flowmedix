export type AbsorptionRouteKind = 'iv' | 'im' | 'sc' | 'vo' | 'compare' | 'technique' | 'exam' | 'velocity';

/** Romanos de afirmativa (I–IV) não são via intravenosa. */
const ASSERTIVE_TITLE = /^afirmativa\s+[ivxlc]+$/i;
const GABARITO_TITLE = /^gabarito$/i;
/** Conceitos âncora da via SC — não rotear por menção comparativa a IM/IV no detail. */
const SC_ANCHOR_TITLE = /^(absorção lenta|tecido adiposo)$/i;

/**
 * Classifica um item do concept_map Vias para o bucket da escada de absorção.
 * Evita falso positivo: "Afirmativa IV" → via IV intravenosa.
 */
export function inferAbsorptionRouteKind(title: string, description: string): AbsorptionRouteKind {
  const trimmedTitle = title.trim();
  if (
    ASSERTIVE_TITLE.test(trimmedTitle) ||
    GABARITO_TITLE.test(trimmedTitle) ||
    SC_ANCHOR_TITLE.test(trimmedTitle)
  ) {
    return 'sc';
  }

  const text = `${title} ${description}`.toLowerCase();
  if (/comparativo|iv = imediata|vo = variável/.test(text)) return 'compare';
  if (/técnica|ângulo|prega|massagem/.test(text)) return 'technique';
  if (/vunesp|padrão|banca/.test(text)) return 'exam';
  if (/velocidade de absorção|mais lenta que im|picos plasmáticos/.test(text)) return 'velocity';
  // SC antes de IM/IV — comparativos citam "que IM" / "que IV" sem ser conteúdo daquela via
  if (/subcutânea|\bsc\b|sc\/h|hipodérmico|insulina|heparina|absorção lenta|tecido adiposo|gordurosa|adiposo/.test(text)) {
    return 'sc';
  }
  if (/(?:^|\s)intravenosa(?:\s|$)|(?:^|\s)via\s+iv(?:\s|$)|\biv\s*[=:—-]/.test(text)) return 'iv';
  if (/(?:^|\s)intramuscular(?:\s|$)|(?:^|\s)via\s+im(?:\s|$)|\bim\s*[=:—-]/.test(text)) return 'im';
  if (/\bvo\b|oral|tgi/.test(text)) return 'vo';
  if (/volume|dose/.test(text)) return 'sc';
  return 'sc';
}