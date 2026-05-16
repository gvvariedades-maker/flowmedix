/**
 * Client: após login, se o destino calculado for `/planos` mas a sessão for do
 * admin (confirmado no servidor), envia para `/admin`.
 */
export async function applyAdminPostLoginOverride(path: string): Promise<string> {
  if (path !== '/planos') return path;
  try {
    const res = await fetch('/api/auth/session-is-admin', { credentials: 'same-origin' });
    if (!res.ok) return path;
    const body: unknown = await res.json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'admin' in body &&
      (body as { admin: unknown }).admin === true
    ) {
      return '/admin';
    }
  } catch {
    // mantém /planos
  }
  return path;
}
