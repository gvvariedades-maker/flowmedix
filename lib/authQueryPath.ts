export function buildAuthQueryPath(
  basePath: '/login' | '/register',
  cidade: string | null,
  concurso: string | null,
  invite?: string | null,
): string {
  const params = new URLSearchParams();
  if (cidade) params.set('cidade', cidade);
  if (concurso) params.set('concurso', concurso);
  if (invite?.trim()) params.set('invite', invite.trim());
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
