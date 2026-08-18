/**
 * Constantes compartilhadas do sistema (server-side — parse de e-mails admin).
 * Paths admin sem env: `@/lib/admin/paths` (seguro para Client Components).
 *
 * Lê `ADMIN_EMAIL` / `ADMIN_EMAILS` em cada chamada (lazy). Não cachear na carga do
 * módulo: em Preview→Promote o build pode ter env vazia e o runtime de Production
 * precisa enxergar o valor atual.
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

/**
 * Retorna o e-mail principal do admin em lowercase.
 * Prefira `isAdminSessionEmail` para autorização.
 *
 * IMPORTANTE: variável SOMENTE de servidor (sem `NEXT_PUBLIC_`).
 */
export function getAdminEmail(): string {
  return parseAdminEmailList()[0] ?? '';
}

/**
 * E-mail principal do administrador (primeiro da lista resolvida).
 * Preferir `getAdminEmail()` — este export espelha o valor atual da env.
 */
export const ADMIN_EMAIL = getAdminEmail();

/** Lista de e-mails com permissão administrativa (lowercase, sem duplicatas). */
export function getAdminEmails(): readonly string[] {
  return parseAdminEmailList();
}

/** Compara e-mail da sessão com a lista de admins (case-insensitive). Só no servidor. */
export function isAdminSessionEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmailList().includes(email.toLowerCase());
}

/**
 * Valida no servidor que ao menos um e-mail admin está configurado.
 * Use exclusivamente em Route Handlers / Server Actions — nunca em Client Components.
 */
export function requireAdminEmail(): string {
  const email = getAdminEmail();
  if (!email) {
    throw new Error('ADMIN_EMAIL não configurado nas variáveis de ambiente');
  }
  return email;
}
