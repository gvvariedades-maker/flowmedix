import type { SupabaseClient } from '@supabase/supabase-js';
import { CAMPINA_GRANDE_PRODUTO_ID } from '@/lib/campina/constants';
import { CAMPINA_GRANDE_2026_SLUG } from '@/lib/concursos/catalogSlugs';
import {
  getConcursoBySlug,
} from '@/lib/concursos/entitlements';
import { invalidateUserModulosCache } from '@/lib/cache/revalidate';
import { logger } from '@/lib/logger';

/**
 * Registra acesso Campina após checkout Stripe: `acessos` (auditoria) +
 * matrícula ativa em `concurso_matriculas` (o que libera /estudar).
 */
export async function fulfillCampinaGrandeAccess(
  admin: SupabaseClient,
  userId: string,
  stripeCheckoutSessionId: string,
): Promise<void> {
  const { error: insertError } = await admin.from('acessos').insert({
    user_id: userId,
    produto: CAMPINA_GRANDE_PRODUTO_ID,
    stripe_checkout_session_id: stripeCheckoutSessionId,
  });

  if (insertError) {
    const isDuplicate =
      insertError.code === '23505' ||
      insertError.message?.toLowerCase().includes('duplicate');
    if (!isDuplicate) {
      logger.error('Falha ao inserir acesso Campina Grande', insertError, {
        userId,
        sessionId: stripeCheckoutSessionId,
      });
      throw insertError;
    }
  }

  const concurso = await getConcursoBySlug(CAMPINA_GRANDE_2026_SLUG);
  if (!concurso) {
    logger.error('Concurso Campina não encontrado para matrícula pós-checkout', {
      slug: CAMPINA_GRANDE_2026_SLUG,
      userId,
    });
    throw new Error('Concurso Campina Grande não configurado no banco.');
  }

  const { error: matriculaError } = await admin.from('concurso_matriculas').upsert(
    {
      user_id: userId,
      concurso_id: concurso.id,
      origem: 'purchase',
      status: 'ativo',
      expires_at: null,
    },
    { onConflict: 'user_id,concurso_id' },
  );

  if (matriculaError) {
    logger.error('Falha ao matricular Campina pós-checkout', matriculaError, {
      userId,
      concursoId: concurso.id,
    });
    throw matriculaError;
  }

  try {
    await invalidateUserModulosCache(userId);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após fulfill Campina', {
      userId,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }
}

/** Usuário pagou Campina antes da matrícula unificada (só tabela `acessos`). */
export async function userHasLegacyCampinaAcesso(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from('acessos')
    .select('id')
    .eq('user_id', userId)
    .eq('produto', CAMPINA_GRANDE_PRODUTO_ID)
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao verificar acesso legado Campina', error, { userId });
    return false;
  }

  return Boolean(data);
}

/** Converte `acessos` legado em matrícula ativa (idempotente). */
export async function syncLegacyCampinaAcessoToMatricula(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const hasLegacy = await userHasLegacyCampinaAcesso(admin, userId);
  if (!hasLegacy) return false;

  const concurso = await getConcursoBySlug(CAMPINA_GRANDE_2026_SLUG);
  if (!concurso) return false;

  const { error } = await admin.from('concurso_matriculas').upsert(
    {
      user_id: userId,
      concurso_id: concurso.id,
      origem: 'purchase',
      status: 'ativo',
      expires_at: null,
    },
    { onConflict: 'user_id,concurso_id' },
  );

  if (error) {
    logger.error('Falha ao sincronizar acesso legado Campina', error, { userId });
    return false;
  }

  try {
    await invalidateUserModulosCache(userId);
  } catch {
    /* não bloqueia */
  }

  return true;
}
