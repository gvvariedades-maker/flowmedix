/**
 * Erros conhecidos do GoTrue quando o refresh/cookie de sessão não existe ou é inválido.
 * Limpamos com `signOut({ scope: 'local' })` para o cliente parar de tentar refresh em loop
 * (e reduzir AuthApiError no console).
 */
const REFRESH_FAIL_MARKERS = [
  'Invalid Refresh Token',
  'Refresh Token Not Found',
  'refresh_token_not_found',
] as const;

function messageFromError(err: unknown): string {
  if (err == null) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err);
}

export function isInvalidRefreshAuthError(err: unknown): boolean {
  const m = messageFromError(err);
  if (!m) return false;
  return REFRESH_FAIL_MARKERS.some((k) => m.includes(k) || m.toLowerCase().includes(String(k).toLowerCase()));
}
