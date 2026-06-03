import { notFound } from 'next/navigation';
import EstudarQuestaoHydrator from '@/components/lesson/EstudarQuestaoHydrator';
import { getEstudarQuestaoPayloadCached } from '@/lib/cache';
import { isAdminSessionEmail } from '@/lib/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { buildE2eEstudarQuestaoPayload } from '@/lib/e2e/estudarSeed';
import { isE2eEstudarSlug } from '@/lib/e2e/constants';
import { getServerSession } from '@/lib/supabase/server-auth';

export type EstudarQuestaoPageContentProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EstudarQuestaoPageContent({
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

  const result = await getEstudarQuestaoPayloadCached({
    slug: resolvedParams.slug,
    userId,
    isAdmin: isAdminSessionEmail(session?.user?.email ?? null),
    searchParams: resolvedSearch,
    layers: 'full',
  });

  if (result.status !== 'ok') return notFound();

  return <EstudarQuestaoHydrator {...result.payload} />;
}
