import { notFound } from 'next/navigation';
import EstudarQuestaoHydrator from '@/components/lesson/EstudarQuestaoHydrator';
import { getEstudarQuestaoPayloadCached } from '@/lib/cache';
import { isDataServiceUnavailableError } from '@/lib/dataServiceError';
import { getActiveMatriculatedConcursoIds } from '@/lib/concursos/entitlements';
import { isAdminSessionEmail } from '@/lib/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { buildE2eEstudarQuestaoPayload } from '@/lib/e2e/estudarSeed';
import { isE2eEstudarSlug } from '@/lib/e2e/constants';
import { logger } from '@/lib/logger';
import { getServerSession } from '@/lib/supabase/server-auth';
import { createServerSupabase } from '@/lib/supabase/server';

export type EstudarQuestaoPageContentProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Logs de diagnóstico quando userHasModuloAccess falha (status forbidden). */
async function logEntitlementDiagnostics(userId: string, slug: string): Promise<void> {
  logger.warn('estudar/[slug]: verificando entitlement antes de notFound', { userId, slug });

  const activeConcursoIds = await getActiveMatriculatedConcursoIds(userId);
  logger.warn('estudar/[slug]: getActiveMatriculatedConcursoIds', {
    userId,
    slug,
    activeConcursoIds,
    count: activeConcursoIds.length,
    matriculaAtivaVazia: activeConcursoIds.length === 0,
  });

  const supabase = await createServerSupabase();

  const { data: modulo, error: moduloError } = await supabase
    .from('modulos_estudo')
    .select('id, modulo_slug')
    .eq('modulo_slug', slug)
    .maybeSingle();

  if (moduloError) {
    logger.warn('estudar/[slug]: erro ao buscar modulos_estudo', {
      userId,
      slug,
      error: moduloError.message,
    });
    return;
  }

  logger.warn('estudar/[slug]: modulos_estudo por slug', {
    userId,
    slug,
    moduloExiste: Boolean(modulo),
    moduloId: modulo?.id ?? null,
    moduloSlug: modulo?.modulo_slug ?? null,
  });

  if (!modulo) return;

  if (!activeConcursoIds.length) {
    logger.warn('estudar/[slug]: sem matrícula ativa — concurso_modulos não consultado', {
      userId,
      slug,
      moduloId: modulo.id,
    });
    return;
  }

  const { data: vinculos, error: vinculoError } = await supabase
    .from('concurso_modulos')
    .select('id, concurso_id, modulo_id')
    .eq('modulo_id', modulo.id)
    .in('concurso_id', activeConcursoIds)
    .limit(10);

  if (vinculoError) {
    logger.warn('estudar/[slug]: erro ao buscar concurso_modulos', {
      userId,
      slug,
      moduloId: modulo.id,
      activeConcursoIds,
      error: vinculoError.message,
    });
    return;
  }

  logger.warn('estudar/[slug]: vínculo concurso_modulos (módulo × matrículas ativas)', {
    userId,
    slug,
    moduloId: modulo.id,
    activeConcursoIds,
    vinculoExiste: (vinculos?.length ?? 0) > 0,
    vinculoCount: vinculos?.length ?? 0,
    vinculos: vinculos ?? [],
  });
}

export default async function PaginaQuestaoDinamica(props: EstudarQuestaoPageContentProps) {
  try {
    return await renderPaginaQuestaoDinamica(props);
  } catch (err) {
    if (isDataServiceUnavailableError(err)) throw err;
    logger.error('Erro não tratado na página da questão', err);
    return notFound();
  }
}

async function renderPaginaQuestaoDinamica({
  params,
  searchParams,
}: EstudarQuestaoPageContentProps) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);

  if (
    isE2eBypassEnabled('E2E_DASHBOARD_BYPASS') &&
    isE2eEstudarSlug(resolvedParams.slug)
  ) {
    const result = buildE2eEstudarQuestaoPayload(resolvedParams.slug, resolvedSearch, 'full');
    if (result.status !== 'ok') return notFound();
    return <EstudarQuestaoHydrator {...result.payload} />;
  }

  const session = await getServerSession();
  const userId = session?.user?.id;
  const isAdmin = isAdminSessionEmail(session?.user?.email ?? null);

  let result: Awaited<ReturnType<typeof getEstudarQuestaoPayloadCached>>;
  try {
    result = await getEstudarQuestaoPayloadCached({
      slug: resolvedParams.slug,
      userId,
      userEmail: session?.user?.email ?? null,
      isAdmin,
      searchParams: resolvedSearch,
      layers: 'full',
    });
  } catch (err) {
    if (isDataServiceUnavailableError(err)) throw err;
    logger.error('Falha ao montar payload da questão', err, {
      slug: resolvedParams.slug,
      userId,
    });
    return notFound();
  }

  if (result.status === 'forbidden' && userId) {
    try {
      await logEntitlementDiagnostics(userId, resolvedParams.slug);
    } catch (diagErr) {
      logger.error('Falha no diagnóstico de entitlement', diagErr, {
        slug: resolvedParams.slug,
        userId,
      });
    }
    return notFound();
  }

  if (result.status !== 'ok') return notFound();

  return <EstudarQuestaoHydrator {...result.payload} />;
}
