/** Segmentos de URL reservados — não podem ser usados como `path` de LP. */
export const LP_RESERVED_PATHS = new Set([
  'admin',
  'api',
  'assinar-pro',
  'blog',
  'campina-grande',
  'checkout',
  'concursos',
  'esqueci-senha',
  'estudar',
  'goianinha',
  'login',
  'lp',
  'neuroslide-showcase-capture',
  'planos',
  'register',
  'redefinir-senha',
  'sucesso',
  'v2',
]);

export function isLpPathReserved(path: string): boolean {
  const normalized = path.trim().toLowerCase();
  return LP_RESERVED_PATHS.has(normalized);
}

export function validateLpPathSegment(path: string): string | null {
  const normalized = path.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    return 'Path inválido. Use apenas letras minúsculas, números e hífens.';
  }
  if (isLpPathReserved(normalized)) {
    return 'Este path está reservado pelo sistema.';
  }
  return null;
}
