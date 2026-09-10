/**
 * Desembrulha `conteudo_json` salvo por engano como resultado de reclassify
 * (`{ changed, payload, zodValid, tecconcursos, ... }`).
 *
 * O campo top-level `tecconcursos` faz o gate de export falhar mesmo quando o
 * payload interno está limpo.
 */

/** Chaves do wrapper de importação/reclassify removidas na flatten estrutural. */
export const RECLASSIFY_WRAPPER_KEYS = [
  'changed',
  'payload',
  'zodValid',
  'fromLabel',
  'skipReason',
  'tecconcursos',
] as const;

/** Chaves não canônicas no payload interno (coluna `modulo_slug` é fonte de verdade). */
export const INNER_NON_CANONICAL_KEYS = ['modulo_slug'] as const;

export type FlattenStructuralEnvelopeResult = {
  payload: Record<string, unknown>;
  wasWrapped: boolean;
  wrapperFieldsRemoved: string[];
  innerFieldsRemoved: string[];
};

export function isReclassifyResultWrapper(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const r = raw as Record<string, unknown>;
  const payload = r.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const p = payload as Record<string, unknown>;
  if (!p.meta || !p.question_data) return false;
  return 'changed' in r || 'zodValid' in r || 'tecconcursos' in r || 'skipReason' in r;
}

export function unwrapCatalogPayload(raw: unknown): unknown {
  if (isReclassifyResultWrapper(raw)) {
    return (raw as Record<string, unknown>).payload;
  }
  return raw;
}

/**
 * Flatten estrutural mínimo: unwrap do envelope reclassify → objeto plano QuestaoCompleta.
 * Não altera instruction, options, gabarito nem conteúdo dos NeuroSlides.
 */
export function flattenStructuralEnvelopeQuestao(raw: unknown): FlattenStructuralEnvelopeResult {
  const wrapperFieldsRemoved: string[] = [];
  const innerFieldsRemoved: string[] = [];
  const wasWrapped = isReclassifyResultWrapper(raw);

  if (wasWrapped && raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const root = raw as Record<string, unknown>;
    for (const key of Object.keys(root)) {
      if (key === 'payload') {
        wrapperFieldsRemoved.push(key);
        continue;
      }
      if ((RECLASSIFY_WRAPPER_KEYS as readonly string[]).includes(key)) {
        wrapperFieldsRemoved.push(key);
        continue;
      }
      if (key === 'meta') {
        wrapperFieldsRemoved.push(key);
      }
    }
  }

  const unwrapped = unwrapCatalogPayload(raw);
  const payload = JSON.parse(JSON.stringify(unwrapped)) as Record<string, unknown>;

  for (const key of INNER_NON_CANONICAL_KEYS) {
    if (key in payload) {
      innerFieldsRemoved.push(key);
      delete payload[key];
    }
  }

  return {
    payload,
    wasWrapped,
    wrapperFieldsRemoved: [...new Set(wrapperFieldsRemoved)].sort(),
    innerFieldsRemoved,
  };
}
