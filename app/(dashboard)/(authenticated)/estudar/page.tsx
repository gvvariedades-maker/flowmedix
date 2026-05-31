import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCatalogStats, getVitrineFacetsCached, getVitrinePageCached } from '@/lib/cache';
import { getMatriculatedConcursos } from '@/lib/concursos/entitlements';
import { isAdminSessionEmail } from '@/lib/constants';
import { getServerUser } from '@/lib/supabase/server-auth';
import {
  parseVitrineListQuery,
  vitrineFacetsQueryKey,
  vitrineListQueryKey,
} from '@/lib/vitrine/parseListQuery';
import VitrineCatalogStats from '@/components/vitrine/VitrineCatalogStats';
import VitrineClient from '@/components/vitrine/VitrineClient';

/** Catálogo inicial no SSR (cache 2 min); cliente refetch em filtros/paginação. */
export const dynamic = 'force-dynamic';

export default async function VitrinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, resolvedSearch] = await Promise.all([getServerUser(), searchParams]);
  const userId = user?.id;
  if (!userId) redirect('/login?next=/estudar');

  const listQuery = parseVitrineListQuery(resolvedSearch);
  const isAdmin = isAdminSessionEmail(user.email ?? null);
  const vitrineFilters = {
    bancas: listQuery.bancas.length ? listQuery.bancas : undefined,
    assuntos: listQuery.assuntos.length ? listQuery.assuntos : undefined,
    q: listQuery.q,
  };

  const [matriculatedConcursos, catalogStats, initialPageData, initialFacetsData] =
    await Promise.all([
      getMatriculatedConcursos(userId).catch(() => []),
      getCatalogStats().catch(() => ({ totalQuestions: 0, totalSlides: 0 })),
      getVitrinePageCached(userId, listQuery.page, vitrineFilters, isAdmin).catch(() => null),
      getVitrineFacetsCached(
        userId,
        { bancas: listQuery.bancas.length ? listQuery.bancas : undefined },
        isAdmin,
      ).catch(() => null),
    ]);

  const vitrineFallbackTitulo =
    matriculatedConcursos.find((concurso) => concurso.tipo === 'edital')?.nome ?? 'Estudo Reverso';

  return (
    <Suspense fallback={<VitrineLoadingFallback />}>
      <VitrineClient
        fallbackTitulo={vitrineFallbackTitulo}
        initialListQuery={listQuery}
        initialPageData={initialPageData}
        initialFacetsData={initialFacetsData}
        ssrListQueryKey={vitrineListQueryKey(listQuery)}
        ssrFacetsQueryKey={vitrineFacetsQueryKey(listQuery.bancas)}
      >
        <VitrineCatalogStats
          totalQuestions={catalogStats.totalQuestions}
          totalSlides={catalogStats.totalSlides}
        />
      </VitrineClient>
    </Suspense>
  );
}

/** Evita mismatch de hidratação com `useSearchParams` (Next exige Suspense no segmento). */
function VitrineLoadingFallback() {
  return (
    <div className="dashboard-surface min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        <div className="h-24 rounded-xl bg-muted/70" />
        <div className="h-11 max-w-xl rounded-2xl bg-muted/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-11 rounded-xl bg-muted/70" />
          <div className="h-11 rounded-xl bg-muted/70" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
