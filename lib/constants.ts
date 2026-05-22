/**
 * Constantes compartilhadas do sistema
 */

/** Fallback documentado em `.env.example` quando `ADMIN_EMAIL` não está na env. */
const DEFAULT_ADMIN_EMAIL = 'gvvariedades@gmail.com';

function parseAdminEmailList(): string[] {
  const emails: string[] = [];

  const primary = process.env.ADMIN_EMAIL?.trim();
  if (primary) emails.push(primary);

  const extras = process.env.ADMIN_EMAILS?.split(',') ?? [];
  for (const raw of extras) {
    const trimmed = raw.trim();
    if (trimmed) emails.push(trimmed);
  }

  if (emails.length === 0) {
    emails.push(DEFAULT_ADMIN_EMAIL);
  }

  const normalized = [...new Set(emails.map((e) => e.toLowerCase()))];
  const owner = DEFAULT_ADMIN_EMAIL.toLowerCase();
  if (!normalized.includes(owner)) {
    normalized.push(owner);
  }
  return normalized;
}

const ADMIN_EMAIL_LIST = parseAdminEmailList();

/**
 * E-mail principal do administrador (primeiro da lista resolvida).
 * Usado para exibição e compatibilidade com código legado.
 *
 * IMPORTANTE: variável SOMENTE de servidor (sem `NEXT_PUBLIC_`).
 */
export const ADMIN_EMAIL = ADMIN_EMAIL_LIST[0] ?? DEFAULT_ADMIN_EMAIL.toLowerCase();

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

/** Concurso padrão para liberar acesso manual em `/admin/concursos/[id]/matriculas`. */
export const ADMIN_MATRICULAS_CONCURSO_ID_DEFAULT = 'c3e001fb-3b82-4bad-8097-8db842649bb9';

/** ID do concurso usado na tela admin de matrículas (override via `ADMIN_MATRICULAS_CONCURSO_ID`). */
export function getAdminMatriculasConcursoId(): string {
  const fromEnv = process.env.ADMIN_MATRICULAS_CONCURSO_ID?.trim();
  return fromEnv || ADMIN_MATRICULAS_CONCURSO_ID_DEFAULT;
}

/** Caminho da tela admin para cadastrar e-mails com acesso liberado. */
export function getAdminMatriculasPath(): string {
  return `/admin/concursos/${getAdminMatriculasConcursoId()}/matriculas`;
}

/** Mesmo path com ID padrão — seguro para links em Client Components. */
export const ADMIN_MATRICULAS_PATH = `/admin/concursos/${ADMIN_MATRICULAS_CONCURSO_ID_DEFAULT}/matriculas`;
