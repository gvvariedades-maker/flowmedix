/**
 * Converte URLSearchParams em objeto compatível com Zod (valores repetidos → array).
 */
export function searchParamsToQueryRecord(
  params: URLSearchParams,
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    out[key] = all.length === 1 ? all[0]! : all;
  }
  return out;
}
