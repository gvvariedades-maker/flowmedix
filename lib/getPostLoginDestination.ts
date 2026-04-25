/**
 * Destino pós-login a partir de `?next=` (interno) com fallback para vitrine + cidade.
 * Rejeita caminhos abertos (ex.: `//evil.com`) e URLs absolutas.
 */
export function getPostLoginDestination(next: string | null | undefined, cidade: string | null): string {
  const n = next?.trim();
  if (n && n.startsWith('/') && !n.startsWith('//')) {
    return n;
  }
  if (cidade) {
    return `/estudar?cidade=${encodeURIComponent(cidade)}`;
  }
  return '/estudar';
}
