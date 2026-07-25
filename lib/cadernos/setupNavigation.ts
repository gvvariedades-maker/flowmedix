/**
 * Limpa `?setup=done` da barra de endereço sem `router.replace` (evita round-trip RSC).
 * Paridade com `applySoftEstudarHistoryUrl` em `lib/estudar/navigation.ts`.
 */
export function stripCadernoSetupDoneFromBrowserUrl(notebookId: string): boolean {
  if (typeof window === 'undefined') return false;

  const expectedPath = `/cadernos/${notebookId}`;
  const { pathname, search } = window.location;
  if (pathname !== expectedPath) return false;

  const params = new URLSearchParams(search);
  if (params.get('setup') !== 'done') return false;

  params.delete('setup');
  const nextSearch = params.toString();
  const nextUrl = nextSearch ? `${expectedPath}?${nextSearch}` : expectedPath;
  window.history.replaceState(window.history.state, '', nextUrl);
  return true;
}
