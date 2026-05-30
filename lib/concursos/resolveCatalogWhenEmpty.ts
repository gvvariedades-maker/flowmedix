import {
  getModulosEstudoCached,
  getModulosEstudoVitrineForUserCached,
} from '@/lib/cache';
import { logger } from '@/lib/logger';
import type { ModuloEstudoListRow } from '@/lib/concursos/entitlements';

/**
 * Catálogo acessível quando o pacote do usuário está vazio (ex.: admin sem matrícula).
 * Alinha caderno, vitrine JS e facets fallback.
 */
export async function resolveAccessibleModulosWhenEmpty(
  userId: string,
  isAdmin: boolean,
): Promise<ModuloEstudoListRow[]> {
  let modulos = (await getModulosEstudoVitrineForUserCached(userId)) as ModuloEstudoListRow[];
  if (modulos.length > 0) return modulos;

  if (isAdmin) {
    return (await getModulosEstudoCached()) as ModuloEstudoListRow[];
  }

  const { ensureGeralCadastroMatricula, getAccessibleModulosForMatriculatedEditalPacote } =
    await import('./entitlements');
  await ensureGeralCadastroMatricula(userId).catch((error) => {
    logger.warn('Falha ao garantir matrícula geral no catálogo', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  });
  return getAccessibleModulosForMatriculatedEditalPacote(userId);
}
