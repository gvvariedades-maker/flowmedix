import { notFound } from 'next/navigation';
import EstudarQuestaoHydrator from '@/components/lesson/EstudarQuestaoHydrator';
import { getEstudarQuestaoPayloadCached } from '@/lib/cache';
import { isDataServiceUnavailableError } from '@/lib/dataServiceError';
import { isAdminSessionEmail } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { buildE2eEstudarQuestaoPayload } from '@/lib/e2e/estudarSeed';
import { isE2eEstudarSlug } from '@/lib/e2e/constants';
import { getServerSession } from '@/lib/supabase/server-auth';

export type EstudarQuestaoPageContentProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EstudarQuestaoPageContent(props: EstudarQuestaoPageContentProps) {
  try {
    return await renderEstudarQuestaoPageContent(props);
  } catch (err) {
    if (isDataServiceUnavailableError(err)) throw err;
    logger.error('Erro não tratado no conteúdo da questão (modal)', err);
    return notFound();
  }
}

async function renderEstudarQuestaoPageContent({
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
  const userEmail = session?.user?.email ?? null;

  let result: Awaited<ReturnType<typeof getEstudarQuestaoPayloadCached>>;
  try {
    result = await getEstudarQuestaoPayloadCached({
      slug: resolvedParams.slug,
      userId,
      userEmail,
      isAdmin: isAdminSessionEmail(userEmail),
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

  if (result.status === 'forbidden') return notFound();
  if (result.status !== 'ok') return notFound();

  return <EstudarQuestaoHydrator {...result.payload} />;
}
