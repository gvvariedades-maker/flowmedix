import { notFound } from 'next/navigation';
import EstudarQuestaoHydrator from '@/components/lesson/EstudarQuestaoHydrator';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
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

  const result = await buildEstudarQuestaoPlayerPayload({
    slug: resolvedParams.slug,
    userId,
    searchParams: resolvedSearch,
  });

  if (result.status !== 'ok') return notFound();

  return <EstudarQuestaoHydrator {...result.payload} />;
}
