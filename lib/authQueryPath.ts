export function buildAuthQueryPath(
  basePath: '/login' | '/register',
  cidade: string | null,
  concurso: string | null,
): string {
  const params = new URLSearchParams();
  if (cidade) params.set('cidade', cidade);
  if (concurso) params.set('concurso', concurso);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
