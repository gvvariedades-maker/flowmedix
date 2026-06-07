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
