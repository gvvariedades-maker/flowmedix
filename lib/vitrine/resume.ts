import { unstable_cache } from 'next/cache';
import { CACHE_CONFIG, getQuestaoBySlugCached } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { withPostgrestReadRetry } from '@/lib/supabaseReadRetry';

export type VitrineResumeHint = {
  moduloSlug: string;
  questaoSlug: string;
  tituloAula: string;
  avantCodigo: number | null;
  studiedAt: string;
};

/**
 * Última questão estudada (histórico mais recente) para o card "Continuar".
 * Cache USER 2 min; tag `historico` + `user-{id}`.
 */
export async function getLastStudiedQuestaoCached(
  userId: string,
): Promise<VitrineResumeHint | null> {
  if (!userId) return null;

  const cacheKey = `vitrine-resume-${userId}`;

  return unstable_cache(
    async () => {
      const { createServerSupabase } = await import('@/lib/supabase/server');
      const supabase = await createServerSupabase();

      const row = await withPostgrestReadRetry(
        `vitrine-resume:${userId.slice(0, 8)}`,
        async () =>
          supabase
            .from('historico_questoes')
            .select('modulo_slug, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
      );

      if (!row?.modulo_slug?.trim()) return null;

      const slug = row.modulo_slug.trim();
      const questao = await getQuestaoBySlugCached(slug).catch(() => null);
      if (!questao) {
        logger.warn('vitrine resume: módulo não encontrado para slug do histórico', {
          userId,
          slug,
        });
        return null;
      }

      return {
        moduloSlug: slug,
        questaoSlug: slug,
        tituloAula: questao.titulo_aula?.trim() || 'Assunto',
        avantCodigo:
          typeof questao.avant_codigo === 'number' && !Number.isNaN(questao.avant_codigo)
            ? questao.avant_codigo
            : null,
        studiedAt: row.created_at,
      };
    },
    [cacheKey],
    {
      ...CACHE_CONFIG.USER,
      tags: ['historico', 'user', `user-${userId}`, cacheKey],
    },
  )();
}
