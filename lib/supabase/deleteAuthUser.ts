import type { SupabaseClient } from '@supabase/supabase-js';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

/**
 * Remove o usuário do Supabase Auth (cascade em matrículas, histórico, cadernos, etc.).
 * Necessário para permitir novo cadastro com o mesmo e-mail.
 */
export async function deleteAuthUserCompletely(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  // Produção pode ter FK sem CASCADE em historico_questoes (legado).
  const { error: historicoError } = await admin
    .from('historico_questoes')
    .delete()
    .eq('user_id', userId);

  if (historicoError) {
    logger.error('Falha ao limpar historico_questoes antes de excluir usuário', historicoError, {
      userId,
    });
    throw historicoError;
  }

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    logger.error('Falha ao excluir usuário Auth (admin)', error, { userId });
    throw error;
  }

  try {
    await invalidateUserModulosCache(userId);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após excluir usuário', {
      userId,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }
}
