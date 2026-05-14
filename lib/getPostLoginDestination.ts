/**
 * Destino pós-login a partir de `?next=` (interno) com fallback para vitrine + rótulos de URL.
 * Rejeita caminhos abertos (ex.: `//evil.com`) e URLs absolutas.
 */
export function getPostLoginDestination(
  next: string | null | undefined,
  cidade: string | null,
  concurso: string | null = null,
): string {
  const n = next?.trim();
  if (n && n.startsWith('/') && !n.startsWith('//')) {
    return n;
  }

  const params = new URLSearchParams();
  if (cidade) params.set('cidade', cidade);
  if (concurso) params.set('concurso', concurso);
  const query = params.toString();
  if (query) {
    return `/estudar?${query}`;
  }
  return '/planos';
}
