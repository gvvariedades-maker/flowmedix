/**
 * Desembrulha `conteudo_json` salvo por engano como resultado de reclassify
 * (`{ changed, payload, zodValid, tecconcursos, ... }`).
 *
 * O campo top-level `tecconcursos` faz o gate de export falhar mesmo quando o
 * payload interno está limpo.
 */
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
