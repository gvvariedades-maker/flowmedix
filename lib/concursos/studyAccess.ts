import { isAdminSessionEmail } from '@/lib/constants';

/** Contexto de estudo por request — alinha vitrine, player e APIs de escrita. */
export type StudyAccessContext = {
  isAdmin: boolean;
  /** Admin/gestor: módulo existe no catálogo basta; não exige matrícula em concurso. */
  skipEntitlement: boolean;
};

export function resolveStudyAccessFromEmail(
  email: string | null | undefined,
): StudyAccessContext {
  const isAdmin = isAdminSessionEmail(email);
  return {
    isAdmin,
    skipEntitlement: isAdmin,
  };
}

export type ModuloAccessOptions = {
  skipEntitlement?: boolean;
};

export function moduloAccessOptionsFromEmail(
  email: string | null | undefined,
): ModuloAccessOptions | undefined {
  const { skipEntitlement } = resolveStudyAccessFromEmail(email);
  return skipEntitlement ? { skipEntitlement: true } : undefined;
}
