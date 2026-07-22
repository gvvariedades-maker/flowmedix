/** Normaliza o primeiro argumento de `fetch` / `fetchWithAuth` nos mocks de teste. */
export function fetchInputUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}
