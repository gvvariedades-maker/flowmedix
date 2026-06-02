import { notFound } from 'next/navigation';
import EstudarQuestaoHydrator from '@/components/lesson/EstudarQuestaoHydrator';
import { getEstudarQuestaoPayloadCached } from '@/lib/cache';
import { isAdminSessionEmail } from '@/lib/constants';
import { getServerSession } from '@/lib/supabase/server-auth';

export default async function PaginaQuestaoDinamica({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
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
