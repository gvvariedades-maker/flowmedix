/**
 * Constantes compartilhadas do sistema (server-side — parse de e-mails admin).
 * Paths admin sem env: `@/lib/admin/paths` (seguro para Client Components).
 */

function parseAdminEmailList(): string[] {
  const emails: string[] = [];

  const primary = process.env.ADMIN_EMAIL?.trim();
  if (primary) emails.push(primary);

  const extras = process.env.ADMIN_EMAILS?.split(',') ?? [];
  for (const raw of extras) {
    const trimmed = raw.trim();
    if (trimmed) emails.push(trimmed);
  }

  return [...new Set(emails.map((e) => e.toLowerCase()))];
}

const ADMIN_EMAIL_LIST = parseAdminEmailList();

/**
 * E-mail principal do administrador (primeiro da lista resolvida).
 * Usado para exibição e compatibilidade com código legado.
 *
 * IMPORTANTE: variável SOMENTE de servidor (sem `NEXT_PUBLIC_`).
 */
export const ADMIN_EMAIL = ADMIN_EMAIL_LIST[0] ?? '';

/**
 * Retorna o e-mail principal do admin em lowercase.
 * Prefira `isAdminSessionEmail` para autorização.
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}

/** Lista de e-mails com permissão administrativa (lowercase, sem duplicatas). */
export function getAdminEmails(): readonly string[] {
  return ADMIN_EMAIL_LIST;
}

/** Compara e-mail da sessão com a lista de admins (case-insensitive). Só no servidor. */
export function isAdminSessionEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_LIST.includes(email.toLowerCase());
}

/**
 * Valida no servidor que ao menos um e-mail admin está configurado.
 * Use exclusivamente em Route Handlers / Server Actions — nunca em Client Components.
 */
export function requireAdminEmail(): string {
  if (ADMIN_EMAIL_LIST.length === 0) {
    throw new Error('ADMIN_EMAIL não configurado nas variáveis de ambiente');
  }
  return ADMIN_EMAIL;
}
